// Configuration
const API_BASE = 'http://localhost:3000';

// --- Section & Navigation ---
const sections = document.querySelectorAll('.section');
const navItems = document.querySelectorAll('.nav-item');

const show = el => el?.classList.remove('hidden');
const hide = el => el?.classList.add('hidden');

navItems.forEach(btn => {
  btn.addEventListener('click', () => {
    navItems.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const sectionId = btn.dataset.section;
    sections.forEach(s => s.classList.remove('active-section'));
    document.getElementById(sectionId).classList.add('active-section');
    
    // Smooth scroll to top
    document.getElementById(sectionId).scrollIntoView({ behavior: 'smooth', block: 'start' });
    
    if (sectionId === 'records') fetchRecordsAndUpdateGraph();
    if (sectionId === 'leaderboard') fetchLeaderboard();
  });
});

// --- User Management ---
let userName = '', userEmail = '', isAuthenticated = false;

const authCard = document.getElementById('authCard');
const dashboardStats = document.getElementById('dashboardStats');
const quickStartSection = document.getElementById('quickStartSection');
const performanceSection = document.getElementById('performanceSection');
const sidebarUserInfo = document.getElementById('sidebarUserInfo');

const quickName = document.getElementById('quickName');
const quickEmail = document.getElementById('quickEmail');
const quickPassword = document.getElementById('quickPassword');
const quickSignupBtn = document.getElementById('quickSignupBtn');
const quickLoginBtn = document.getElementById('quickLoginBtn');
const quickAuthMsg = document.getElementById('quickAuthMsg');

const logoutBtn = document.getElementById('logoutBtn');

// Quick Signup
quickSignupBtn.addEventListener('click', async () => {
  const name = quickName.value.trim();
  const email = quickEmail.value.trim();
  const password = quickPassword.value;
  
  if (!name || !email || !password) {
    quickAuthMsg.innerText = '⚠️ Please fill all fields';
    quickAuthMsg.style.color = '#ef4444';
    return;
  }
  
  // Disable button during request
  quickSignupBtn.disabled = true;
  quickSignupBtn.innerText = 'Signing up...';
  
  try {
    const res = await fetch(`${API_BASE}/api/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    const data = await res.json();
    
    if (res.ok) {
      userName = name;
      userEmail = email;
      isAuthenticated = true;
      quickAuthMsg.innerText = '✅ Signup successful!';
      quickAuthMsg.style.color = '#10b981';
      setTimeout(() => showDashboard(), 800);
    } else {
      quickAuthMsg.innerText = `❌ ${data.message || 'Signup failed'}`;
      quickAuthMsg.style.color = '#ef4444';
    }
  } catch (e) {
    quickAuthMsg.innerText = '❌ Server not running! Start server with: node server.js';
    quickAuthMsg.style.color = '#ef4444';
    console.error(e);
  } finally {
    quickSignupBtn.disabled = false;
    quickSignupBtn.innerText = 'Sign Up';
  }
});

// Quick Login
quickLoginBtn.addEventListener('click', async () => {
  const email = quickEmail.value.trim();
  const password = quickPassword.value;
  
  if (!email || !password) {
    quickAuthMsg.innerText = '⚠️ Please provide email and password';
    quickAuthMsg.style.color = '#ef4444';
    return;
  }
  
  // Disable button during request
  quickLoginBtn.disabled = true;
  quickLoginBtn.innerText = 'Logging in...';
  
  try {
    const res = await fetch(`${API_BASE}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    
    if (res.ok) {
      userName = data.name || '';
      userEmail = email;
      isAuthenticated = true;
      quickAuthMsg.innerText = '✅ Login successful!';
      quickAuthMsg.style.color = '#10b981';
      setTimeout(() => showDashboard(), 800);
    } else {
      quickAuthMsg.innerText = `❌ ${data.message || 'Login failed'}`;
      quickAuthMsg.style.color = '#ef4444';
    }
  } catch (e) {
    quickAuthMsg.innerText = '❌ Server not running! Start server with: node server.js';
    quickAuthMsg.style.color = '#ef4444';
    console.error(e);
  } finally {
    quickLoginBtn.disabled = false;
    quickLoginBtn.innerText = 'Log In';
  }
});

// Logout
logoutBtn.addEventListener('click', () => {
  userName = '';
  userEmail = '';
  isAuthenticated = false;
  
  hide(dashboardStats);
  hide(quickStartSection);
  hide(performanceSection);
  hide(sidebarUserInfo);
  show(authCard);
  
  quickName.value = '';
  quickEmail.value = '';
  quickPassword.value = '';
  quickAuthMsg.innerText = '';
  
  // Go to home
  document.querySelector('[data-section="home"]').click();
});

// Show Dashboard after login
function showDashboard() {
  hide(authCard);
  show(dashboardStats);
  show(quickStartSection);
  show(performanceSection);
  show(sidebarUserInfo);
  
  document.getElementById('dashUserName').innerText = userName;
  document.getElementById('dashUserEmail').innerText = userEmail;
  document.getElementById('sidebarUserName').innerText = userName;
  
  fetchRecordsAndUpdateGraph();
}

// --- Quiz Logic ---
const questionEl = document.getElementById('question');
const optionsEl = document.getElementById('options');
const currentQEl = document.getElementById('currentQ');
const totalQEl = document.getElementById('totalQ');
const timeEl = document.getElementById('time');
const restartBtn = document.getElementById('restartBtn');
const backHomeBtn = document.getElementById('backHomeBtn');

let questions = [], currentQ = 0, score = 0, timer = 0, interval, selectedTopic = '';

// Topic card click handlers - IMPROVED WITH LOADING STATE
document.querySelectorAll('.topic-card').forEach(card => {
  card.addEventListener('click', () => {
    if (!isAuthenticated) {
      alert('⚠️ Please login first to start quiz!');
      return;
    }
    
    // Prevent multiple clicks
    if (card.classList.contains('loading')) return;
    
    selectedTopic = card.dataset.topic;
    
    // Add loading state
    card.classList.add('loading');
    card.style.opacity = '0.6';
    card.style.pointerEvents = 'none';
    
    // Start quiz immediately
    startQuiz(selectedTopic);
  });
});

restartBtn.addEventListener('click', () => startQuiz(selectedTopic));
backHomeBtn.addEventListener('click', () => {
  clearInterval(interval);
  document.querySelector('[data-section="home"]').click();
  hide(document.querySelector('.topbar'));
  hide(document.querySelector('.question-card'));
  hide(document.querySelector('.controls'));
});

function startQuiz(topic) {
  console.log('Starting quiz for topic:', topic);
  
  // Show loading in question area
  questionEl.innerText = '⏳ Loading questions...';
  optionsEl.innerHTML = '';
  
  fetch(`${API_BASE}/api/quiz?topic=${topic}&count=20`)
    .then(res => {
      if (!res.ok) throw new Error('Server error');
      return res.json();
    })
    .then(data => {
      console.log('Quiz data received:', data);
      questions = data || [];
      
      if (questions.length === 0) {
        alert('⚠️ No questions available for this topic!');
        document.querySelector('[data-section="home"]').click();
        return;
      }
      
      totalQEl.innerText = questions.length;
      
      // Switch to quiz section with smooth transition
      navItems.forEach(b => b.classList.remove('active'));
      sections.forEach(s => s.classList.remove('active-section'));
      document.getElementById('quiz').classList.add('active-section');
      
      // Smooth scroll to quiz section
      document.getElementById('quiz').scrollIntoView({ behavior: 'smooth', block: 'start' });
      
      show(document.querySelector('.topbar'));
      show(document.querySelector('.question-card'));
      show(document.querySelector('.controls'));
      
      currentQ = 0;
      score = 0;
      showQuestion();
      startTimer();
      
      // Remove loading state from all topic cards
      document.querySelectorAll('.topic-card').forEach(c => {
        c.classList.remove('loading');
        c.style.opacity = '1';
        c.style.pointerEvents = 'auto';
      });
    })
    .catch(err => {
      console.error('Error fetching quiz questions', err);
      alert('❌ Unable to load quiz. Make sure the server is running!\n\nRun: node server.js\nThen open: http://localhost:3000');
      
      // Remove loading state
      document.querySelectorAll('.topic-card').forEach(c => {
        c.classList.remove('loading');
        c.style.opacity = '1';
        c.style.pointerEvents = 'auto';
      });
    });
}

function showQuestion() {
  const q = questions[currentQ];
  questionEl.innerText = q.question;
  optionsEl.innerHTML = '';
  
  q.options.forEach(opt => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.innerText = opt;
    btn.addEventListener('click', () => {
      // Prevent multiple clicks on same question
      if (btn.disabled) return;
      
      Array.from(optionsEl.children).forEach(b => {
        b.disabled = true;
        b.style.cursor = 'not-allowed';
      });
      
      if (opt === q.answer) {
        score++;
        btn.classList.add('correct');
      } else {
        btn.classList.add('wrong');
        Array.from(optionsEl.children).forEach(b => {
          if (b.innerText === q.answer) b.classList.add('correct');
        });
      }
      setTimeout(nextQuestion, 1000); // Increased from 600ms to 1000ms for better UX
    });
    optionsEl.appendChild(btn);
  });
  
  currentQEl.innerText = currentQ + 1;
}

function nextQuestion() {
  currentQ++;
  if (currentQ >= questions.length) endQuiz();
  else showQuestion();
}

function startTimer() {
  timer = 0;
  clearInterval(interval);
  interval = setInterval(() => {
    timer++;
    timeEl.innerText = timer;
  }, 1000);
}

// --- Summary Modal ---
const summaryModal = document.getElementById('summaryModal');
const sumScore = document.getElementById('sumScore');
const sumAccuracy = document.getElementById('sumAccuracy');
const sumTime = document.getElementById('sumTime');
const sumPercentile = document.getElementById('sumPercentile');
const closeSummaryBtn = document.getElementById('closeSummaryBtn');
const viewRecordsBtn = document.getElementById('viewRecordsBtn');

closeSummaryBtn.addEventListener('click', () => {
  summaryModal.classList.add('hidden');
  document.querySelector('[data-section="home"]').click();
  hide(document.querySelector('.topbar'));
  hide(document.querySelector('.question-card'));
  hide(document.querySelector('.controls'));
});

viewRecordsBtn.addEventListener('click', () => {
  summaryModal.classList.add('hidden');
  document.querySelector('[data-section="records"]').click();
  hide(document.querySelector('.topbar'));
  hide(document.querySelector('.question-card'));
  hide(document.querySelector('.controls'));
});

function endQuiz() {
  clearInterval(interval);
  questionEl.innerText = `🎉 Quiz Completed! Your Score: ${score}/${questions.length}`;
  optionsEl.innerHTML = '';

  const result = {
    name: userName,
    email: userEmail,
    topic: selectedTopic,
    score: score,
    total: questions.length,
    accuracy: Math.round((score / questions.length) * 100),
    time: timer,
    date: new Date().toLocaleString()
  };

  fetch(`${API_BASE}/api/results`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(result)
  })
    .then(res => res.json())
    .then(() => {
      fetchRecordsAndUpdateGraph();
      showSummary(result);
    })
    .catch(err => console.error('Error saving quiz result:', err));
}

function showSummary(result) {
  const { score, total, accuracy, time } = result;
  sumScore.innerText = `${score}/${total}`;
  sumAccuracy.innerText = `${accuracy}%`;
  sumTime.innerText = `${time}s`;

  fetch(`${API_BASE}/api/leaderboard`)
    .then(res => res.json())
    .then(lb => {
      const scores = lb.map(r => r.score);
      const below = scores.filter(s => s <= score).length;
      const percentile = scores.length > 0 ? Math.round((below / scores.length) * 100) : 0;
      sumPercentile.innerText = `${percentile}%`;
    })
    .catch(() => sumPercentile.innerText = '—');

  summaryModal.classList.remove('hidden');
}

// --- Chart.js Performance Graph ---
let performanceChart = null;

function updatePerformanceChart(userRecords) {
  const ctx = document.getElementById('performanceChart');
  if (!ctx) return;

  const sortedRecords = userRecords
    .filter(r => r.email === userEmail)
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  if (sortedRecords.length === 0) return;

  const labels = sortedRecords.map((r, i) => `Quiz ${i + 1}`);
  const accuracyData = sortedRecords.map(r => r.accuracy);
  const scoreData = sortedRecords.map(r => (r.score / r.total) * 100);

  if (performanceChart) performanceChart.destroy();

  performanceChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Accuracy (%)',
          data: accuracyData,
          borderColor: '#5a48e8',
          backgroundColor: 'rgba(90, 72, 232, 0.1)',
          borderWidth: 3,
          tension: 0.3,
          fill: true,
        },
        {
          label: 'Score (%)',
          data: scoreData,
          borderColor: '#16a34a',
          backgroundColor: 'rgba(22, 163, 74, 0.1)',
          borderWidth: 3,
          tension: 0.3,
          fill: true,
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { display: true, position: 'top' },
        tooltip: { mode: 'index', intersect: false }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          ticks: { callback: value => value + '%' }
        }
      }
    }
  });

  // Update stats
  document.getElementById('totalQuizzes').innerText = sortedRecords.length;
  
  const bestScore = Math.max(...sortedRecords.map(r => r.accuracy));
  document.getElementById('bestScore').innerText = bestScore + '%';
  
  const avgAccuracy = Math.round(sortedRecords.reduce((sum, r) => sum + r.accuracy, 0) / sortedRecords.length);
  document.getElementById('avgAccuracy').innerText = avgAccuracy + '%';

  // Percentile
  fetch(`${API_BASE}/api/leaderboard`)
    .then(res => res.json())
    .then(lb => {
      const allScores = lb.map(r => r.score);
      const userBestScore = Math.max(...sortedRecords.map(r => r.score));
      const below = allScores.filter(s => s <= userBestScore).length;
      const percentile = allScores.length > 0 ? Math.round((below / allScores.length) * 100) : 0;
      document.getElementById('percentile').innerText = percentile;
    })
    .catch(() => document.getElementById('percentile').innerText = '0');
}

// --- Fetch Records + Update Graph ---
async function fetchRecordsAndUpdateGraph() {
  try {
    const res = await fetch(`${API_BASE}/api/records`);
    const records = await res.json();
    
    const tbody = document.querySelector('#recordsTable tbody');
    const noRecordsMsg = document.getElementById('noRecordsMsg');
    const recordsTableWrap = document.getElementById('recordsTableWrap');
    
    tbody.innerHTML = '';
    
    if (records.length === 0) {
      show(noRecordsMsg);
      hide(recordsTableWrap);
    } else {
      hide(noRecordsMsg);
      show(recordsTableWrap);
      
      records.forEach(r => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${r.name || '-'}</td>
          <td>${r.email || '-'}</td>
          <td>${r.topic || '-'}</td>
          <td>${r.score}/${r.total}</td>
          <td>${r.accuracy}%</td>
          <td>${r.time}s</td>
          <td>${r.date}</td>
        `;
        tbody.appendChild(tr);
      });
    }

    if (userEmail) updatePerformanceChart(records);
  } catch (err) {
    console.error('Failed to fetch records', err);
  }
}

// --- Fetch Leaderboard ---
async function fetchLeaderboard() {
  try {
    const res = await fetch(`${API_BASE}/api/leaderboard`);
    const leaderboard = await res.json();
    
    const tbody = document.querySelector('#leaderboardTable tbody');
    const noLeadersMsg = document.getElementById('noLeadersMsg');
    const leaderboardTableWrap = document.getElementById('leaderboardTableWrap');
    
    tbody.innerHTML = '';
    
    if (leaderboard.length === 0) {
      show(noLeadersMsg);
      hide(leaderboardTableWrap);
    } else {
      hide(noLeadersMsg);
      show(leaderboardTableWrap);
      
      leaderboard.forEach((r, i) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${i + 1}</td>
          <td>${r.name || '-'}</td>
          <td>${r.email || '-'}</td>
          <td>${r.score}/${r.total || 10}</td>
          <td>${r.accuracy}%</td>
          <td>${r.topic || '-'}</td>
        `;
        tbody.appendChild(tr);
      });
    }
  } catch (err) {
    console.error('Failed to fetch leaderboard', err);
  }
}

// --- Dark mode toggle ---
const darkToggle = document.getElementById('darkModeToggle');
darkToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  darkToggle.innerText = document.body.classList.contains('dark')
    ? '🌙 Dark Mode'
    : '☀️ Light Mode';
});
