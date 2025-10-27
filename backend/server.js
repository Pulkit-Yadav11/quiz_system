const express = require('express');
const cors = require('cors');
const fs = require('fs');
const bcrypt = require('bcrypt');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;


// Enable CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json());

// Serve static files from frontend directory
app.use(express.static(path.join(__dirname, '../frontend')));

// ================= ENHANCED QUIZ DATA - 20 QUESTIONS PER TOPIC =================
const quizQuestions = {
  arrays: [
    { question: "What is the time complexity of binary search in a sorted array?", options: ["O(n)", "O(log n)", "O(n log n)", "O(1)"], answer: "O(log n)" },
    { question: "Which sorting algorithm is not considered in-place?", options: ["Bubble Sort", "Merge Sort", "Insertion Sort", "Selection Sort"], answer: "Merge Sort" },
    { question: "What is the best-case time complexity of insertion sort?", options: ["O(n)", "O(n²)", "O(log n)", "O(1)"], answer: "O(n)" },
    { question: "In an array of size n, what is the index of the last element?", options: ["n", "n+1", "n-1", "1"], answer: "n-1" },
    { question: "Which operation is the fastest in arrays?", options: ["Insertion at beginning", "Deletion from middle", "Access by index", "Sequential search"], answer: "Access by index" },
    { question: "Which algorithm is used to find the maximum subarray sum?", options: ["Kadane's Algorithm", "Kruskal's Algorithm", "Dijkstra's Algorithm", "Bellman-Ford Algorithm"], answer: "Kadane's Algorithm" },
    { question: "Which sorting algorithm is not stable?", options: ["Merge Sort", "Insertion Sort", "Quick Sort", "Bubble Sort"], answer: "Quick Sort" },
    { question: "What is the auxiliary space complexity of merge sort?", options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"], answer: "O(n)" },
    { question: "Which operation is generally inefficient in arrays?", options: ["Traversal", "Random access", "Insertion at beginning", "Access last element"], answer: "Insertion at beginning" },
    { question: "What is the minimum number of comparisons required to find the minimum element in an unsorted array?", options: ["n", "n-1", "log n", "n/2"], answer: "n-1" },
    { question: "Which data structure allows random access in constant time?", options: ["Linked List", "Array", "Stack", "Queue"], answer: "Array" },
    { question: "Which algorithm uses the divide-and-conquer strategy?", options: ["Bubble Sort", "Insertion Sort", "Merge Sort", "Selection Sort"], answer: "Merge Sort" },
    { question: "What is the worst-case time complexity of quicksort?", options: ["O(n)", "O(n log n)", "O(n²)", "O(log n)"], answer: "O(n²)" },
    { question: "Which operation cannot be performed efficiently on arrays?", options: ["Traversal", "Access", "Dynamic resizing", "Update"], answer: "Dynamic resizing" },
    { question: "Which search algorithm works only on sorted arrays?", options: ["Linear Search", "Binary Search", "Jump Search", "Interpolation Search"], answer: "Binary Search" },
    { question: "What is the best sorting algorithm for nearly sorted data?", options: ["Merge Sort", "Quick Sort", "Insertion Sort", "Heap Sort"], answer: "Insertion Sort" },
    { question: "Which data structure forms the basis of a heap?", options: ["Array", "Linked List", "Tree", "Graph"], answer: "Array" },
    { question: "Which sorting algorithm repeatedly swaps adjacent elements?", options: ["Bubble Sort", "Merge Sort", "Quick Sort", "Heap Sort"], answer: "Bubble Sort" },
    { question: "What is the space complexity of an in-place sorting algorithm?", options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"], answer: "O(1)" },
    { question: "Which algorithm finds the kth smallest element efficiently?", options: ["Linear Search", "Binary Search", "Quickselect", "Merge Sort"], answer: "Quickselect" }
  ],

  recursion: [
    { question: "What is recursion?", options: ["A function calling itself", "A loop structure", "A pointer operation", "An iteration method"], answer: "A function calling itself" },
    { question: "Which condition terminates a recursive function?", options: ["Base case", "Loop condition", "Return statement", "Break statement"], answer: "Base case" },
    { question: "Which data structure is used internally for recursion?", options: ["Stack", "Queue", "Array", "Heap"], answer: "Stack" },
    { question: "What happens if the base case is not defined in recursion?", options: ["Infinite recursion", "Compilation error", "Syntax error", "The function returns null"], answer: "Infinite recursion" },
    { question: "What is tail recursion?", options: ["Recursive call is the last statement", "Recursive call is the first statement", "Multiple recursive calls exist", "Recursion with no return value"], answer: "Recursive call is the last statement" },
    { question: "Recursion can be converted into which alternative?", options: ["Iteration", "Stack-based implementation", "Loop structure", "All of the above"], answer: "All of the above" },
    { question: "What is the main drawback of recursion?", options: ["High memory consumption", "Slower execution", "Risk of stack overflow", "All of the above"], answer: "All of the above" },
    { question: "Which algorithm commonly uses recursion?", options: ["Depth-First Search", "Binary Search", "Merge Sort", "All of the above"], answer: "All of the above" },
    { question: "What type of recursion makes multiple recursive calls?", options: ["Tree recursion", "Linear recursion", "Tail recursion", "Direct recursion"], answer: "Tree recursion" },
    { question: "What is linear recursion?", options: ["Only one recursive call per function", "Multiple recursive calls", "Recursion without base case", "Iteration in disguise"], answer: "Only one recursive call per function" },
    { question: "What is indirect recursion?", options: ["Function A calls B, which calls A", "Function calls itself directly", "Multiple functions call each other", "Recursion with no return"], answer: "Function A calls B, which calls A" },
    { question: "What is mutual recursion?", options: ["Two or more functions calling each other", "A function calling itself", "Multiple recursive calls in one function", "Recursion with loops"], answer: "Two or more functions calling each other" },
    { question: "Which data structure does recursion implicitly use?", options: ["Stack", "Queue", "Heap", "Array"], answer: "Stack" },
    { question: "What is an example of recursion?", options: ["Calculating factorial", "Linear search", "Bubble sort", "Sequential traversal"], answer: "Calculating factorial" },
    { question: "How can the Fibonacci sequence be implemented?", options: ["Recursion", "Iteration", "Both recursion and iteration", "Only dynamic programming"], answer: "Both recursion and iteration" },
    { question: "Recursion can be classified into direct and what?", options: ["Indirect", "Simple", "Complex", "Multiple"], answer: "Indirect" },
    { question: "Which graph traversal algorithm uses recursion?", options: ["Depth-First Search", "Breadth-First Search", "Dijkstra's Algorithm", "Prim's Algorithm"], answer: "Depth-First Search" },
    { question: "What does the base case prevent?", options: ["Infinite recursion", "Memory leaks", "Compilation errors", "Stack creation"], answer: "Infinite recursion" },
    { question: "Which type of recursion is most memory efficient?", options: ["Tail recursion", "Tree recursion", "Indirect recursion", "Linear recursion"], answer: "Tail recursion" },
    { question: "What is essential for any recursive function to work correctly?", options: ["A base case", "A recursive case", "Both base and recursive cases", "A return statement"], answer: "Both base and recursive cases" }
  ],

  stack: [
    { question: "Which principle does a stack follow?", options: ["FIFO (First In First Out)", "LIFO (Last In First Out)", "Random Access", "Priority-based"], answer: "LIFO (Last In First Out)" },
    { question: "Which operation adds an element to the stack?", options: ["Push", "Pop", "Peek", "Enqueue"], answer: "Push" },
    { question: "Which operation removes an element from the stack?", options: ["Pop", "Push", "Peek", "Dequeue"], answer: "Pop" },
    { question: "Which operation views the top element without removing it?", options: ["Peek", "Pop", "Push", "Top"], answer: "Peek" },
    { question: "Which data structure is used for function calls?", options: ["Stack", "Queue", "Array", "Linked List"], answer: "Stack" },
    { question: "Which algorithm uses a stack for traversal?", options: ["Depth-First Search", "Breadth-First Search", "Binary Search", "Linear Search"], answer: "Depth-First Search" },
    { question: "Which problem is solved using stacks?", options: ["Balanced parentheses", "Shortest path", "Sorting", "Matrix multiplication"], answer: "Balanced parentheses" },
    { question: "Which operation is not supported by a stack?", options: ["Enqueue", "Push", "Pop", "Peek"], answer: "Enqueue" },
    { question: "When does a stack overflow occur?", options: ["When the stack is full", "When the stack is empty", "When top pointer is negative", "During pop operation"], answer: "When the stack is full" },
    { question: "What is the time complexity of push and pop operations?", options: ["O(1)", "O(n)", "O(log n)", "O(n²)"], answer: "O(1)" },
    { question: "Which of the following can be implemented using a stack?", options: ["Recursion", "Backtracking", "Undo mechanism", "All of the above"], answer: "All of the above" },
    { question: "What is a stack underflow?", options: ["Attempting to pop from an empty stack", "Pushing to a full stack", "Stack with negative size", "Invalid stack pointer"], answer: "Attempting to pop from an empty stack" },
    { question: "Which notation is evaluated using stacks?", options: ["Postfix notation", "Infix notation", "Prefix notation", "Both postfix and prefix"], answer: "Both postfix and prefix" },
    { question: "What is the space complexity of a stack with n elements?", options: ["O(1)", "O(n)", "O(log n)", "O(n²)"], answer: "O(n)" },
    { question: "Which operation checks if a stack is empty?", options: ["isEmpty", "isFull", "peek", "size"], answer: "isEmpty" },
    { question: "How can you reverse a string using a stack?", options: ["Push all characters and pop them", "Use two stacks", "Use recursion only", "Sort the characters"], answer: "Push all characters and pop them" },
    { question: "What is the output sequence if 1, 2, 3 are pushed and then popped?", options: ["3, 2, 1", "1, 2, 3", "2, 3, 1", "Random order"], answer: "3, 2, 1" },
    { question: "Which expression is easiest to evaluate using a stack?", options: ["Postfix", "Infix", "Prefix", "All are equally easy"], answer: "Postfix" },
    { question: "What does the Tower of Hanoi problem use?", options: ["Stack-based recursion", "Queue", "Array sorting", "Linked list"], answer: "Stack-based recursion" },
    { question: "Which application does not typically use stacks?", options: ["Job scheduling", "Function calls", "Expression evaluation", "Backtracking"], answer: "Job scheduling" }
  ],

  queue: [
    { question: "Which principle does a queue follow?", options: ["LIFO (Last In First Out)", "FIFO (First In First Out)", "Random Access", "Priority-based"], answer: "FIFO (First In First Out)" },
    { question: "Where is insertion performed in a queue?", options: ["At the rear", "At the front", "In the middle", "At any position"], answer: "At the rear" },
    { question: "Where is deletion performed in a queue?", options: ["At the front", "At the rear", "In the middle", "At any position"], answer: "At the front" },
    { question: "Which is not a type of queue?", options: ["Circular queue", "Priority queue", "Double-ended queue", "Linear stack"], answer: "Linear stack" },
    { question: "Which algorithm uses a queue for traversal?", options: ["Breadth-First Search", "Depth-First Search", "Binary Search", "Linear Search"], answer: "Breadth-First Search" },
    { question: "What is the time complexity of enqueue and dequeue operations?", options: ["O(1)", "O(n)", "O(log n)", "O(n²)"], answer: "O(1)" },
    { question: "What is a circular queue?", options: ["Queue where rear connects to front", "Queue with priority", "Queue with two ends", "Queue with random access"], answer: "Queue where rear connects to front" },
    { question: "What is a deque?", options: ["Double-ended queue", "Priority-based queue", "Circular queue", "Stack-based queue"], answer: "Double-ended queue" },
    { question: "Which operation is not standard in a simple queue?", options: ["Insert at front", "Insert at rear", "Delete from front", "Peek"], answer: "Insert at front" },
    { question: "What happens when you try to enqueue into a full queue?", options: ["Queue overflow", "Queue underflow", "Segmentation fault", "Data loss"], answer: "Queue overflow" },
    { question: "What is a priority queue?", options: ["Elements are served based on priority", "FIFO structure", "LIFO structure", "Random access queue"], answer: "Elements are served based on priority" },
    { question: "Which data structure implements Breadth-First Search?", options: ["Stack", "Queue", "Array", "Linked List"], answer: "Queue" },
    { question: "What is the space complexity of a queue with n elements?", options: ["O(1)", "O(n)", "O(log n)", "O(n²)"], answer: "O(n)" },
    { question: "How is a queue typically implemented?", options: ["Array or Linked List", "Stack", "Tree", "Graph"], answer: "Array or Linked List" },
    { question: "What is queue underflow?", options: ["Attempting to dequeue from empty queue", "Enqueuing to full queue", "Invalid queue size", "Negative queue pointer"], answer: "Attempting to dequeue from empty queue" },
    { question: "Which real-world scenario uses a queue?", options: ["Printer job scheduling", "Undo operation", "Function calls", "Expression evaluation"], answer: "Printer job scheduling" },
    { question: "In a circular queue, what happens when rear reaches the end?", options: ["It wraps around to the beginning", "Queue becomes full", "Elements are lost", "Queue is reset"], answer: "It wraps around to the beginning" },
    { question: "Which operation checks if a queue is empty?", options: ["isEmpty", "isFull", "front", "rear"], answer: "isEmpty" },
    { question: "What is the advantage of a circular queue over a linear queue?", options: ["Better space utilization", "Faster operations", "Easier implementation", "More storage"], answer: "Better space utilization" },
    { question: "Which CPU scheduling algorithm uses a queue?", options: ["Round Robin", "Shortest Job First", "Priority Scheduling", "All of the above"], answer: "Round Robin" }
  ],

  trees: [
    { question: "What is the maximum number of children a binary tree node can have?", options: ["1", "2", "3", "Unlimited"], answer: "2" },
    { question: "Which tree traversal is used for expression tree evaluation?", options: ["Inorder", "Preorder", "Postorder", "Level-order"], answer: "Postorder" },
    { question: "What is a full binary tree?", options: ["Every node has 0 or 2 children", "All levels are completely filled", "Height is minimum", "All leaves are at same level"], answer: "Every node has 0 or 2 children" },
    { question: "What is the time complexity of searching in a balanced BST?", options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"], answer: "O(log n)" },
    { question: "Which traversal visits nodes in ascending order in a BST?", options: ["Inorder", "Preorder", "Postorder", "Level-order"], answer: "Inorder" },
    { question: "What is the height of a binary tree with n nodes in the worst case?", options: ["log n", "n", "n-1", "n/2"], answer: "n-1" },
    { question: "Which tree is always balanced?", options: ["AVL Tree", "Binary Search Tree", "Binary Tree", "Expression Tree"], answer: "AVL Tree" },
    { question: "What is a leaf node?", options: ["Node with no children", "Node with one child", "Root node", "Node with two children"], answer: "Node with no children" },
    { question: "What is the degree of a binary tree node?", options: ["Number of children", "Height of node", "Depth of node", "Number of ancestors"], answer: "Number of children" },
    { question: "Which traversal uses a queue?", options: ["Level-order", "Inorder", "Preorder", "Postorder"], answer: "Level-order" },
    { question: "What is a complete binary tree?", options: ["All levels filled except possibly last", "All nodes have two children", "Height is minimum", "All leaves at same level"], answer: "All levels filled except possibly last" },
    { question: "What is the worst-case time complexity of insertion in a BST?", options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"], answer: "O(n)" },
    { question: "Which tree maintains balance using rotations?", options: ["AVL Tree", "Binary Tree", "Expression Tree", "Parse Tree"], answer: "AVL Tree" },
    { question: "What is the maximum number of nodes at level L?", options: ["2^L", "L", "2L", "L^2"], answer: "2^L" },
    { question: "What is a Binary Search Tree property?", options: ["Left subtree < root < right subtree", "All nodes have two children", "Tree is balanced", "All leaves are at same level"], answer: "Left subtree < root < right subtree" },
    { question: "Which traversal is used to create a copy of the tree?", options: ["Preorder", "Inorder", "Postorder", "Level-order"], answer: "Preorder" },
    { question: "What is the space complexity of tree traversal using recursion?", options: ["O(1)", "O(log n)", "O(n)", "O(h) where h is height"], answer: "O(h) where h is height" },
    { question: "Which tree structure is used in syntax parsing?", options: ["Parse Tree", "AVL Tree", "Binary Search Tree", "Heap"], answer: "Parse Tree" },
    { question: "What is the minimum height of a binary tree with n nodes?", options: ["log n", "n", "n-1", "1"], answer: "log n" },
    { question: "Which operation is fastest in a balanced BST?", options: ["Search", "Insertion", "Deletion", "All have same complexity"], answer: "All have same complexity" }
  ],

  graphs: [
    { question: "What does a graph consist of?", options: ["Vertices and edges", "Nodes only", "Edges only", "Arrays"], answer: "Vertices and edges" },
    { question: "Which traversal uses a queue?", options: ["Depth-First Search", "Breadth-First Search", "Inorder", "Postorder"], answer: "Breadth-First Search" },
    { question: "Which traversal uses a stack or recursion?", options: ["Depth-First Search", "Breadth-First Search", "Level-order", "None"], answer: "Depth-First Search" },
    { question: "What is the time complexity of BFS on a graph with V vertices and E edges?", options: ["O(V)", "O(E)", "O(V + E)", "O(V * E)"], answer: "O(V + E)" },
    { question: "What is a directed graph?", options: ["Edges have direction", "Edges have no direction", "All edges are weighted", "Graph has cycles"], answer: "Edges have direction" },
    { question: "What is an undirected graph?", options: ["Edges have no direction", "Edges have direction", "Graph has no cycles", "All edges are weighted"], answer: "Edges have no direction" },
    { question: "What is a weighted graph?", options: ["Edges have weights", "Vertices have weights", "Graph has no cycles", "Graph is directed"], answer: "Edges have weights" },
    { question: "What is a cycle in a graph?", options: ["Path that starts and ends at same vertex", "Path with no repeated edges", "Shortest path", "Longest path"], answer: "Path that starts and ends at same vertex" },
    { question: "Which algorithm finds the shortest path in an unweighted graph?", options: ["BFS", "DFS", "Dijkstra's", "Bellman-Ford"], answer: "BFS" },
    { question: "Which algorithm finds the shortest path in a weighted graph?", options: ["Dijkstra's Algorithm", "BFS", "DFS", "Prim's Algorithm"], answer: "Dijkstra's Algorithm" },
    { question: "What is a spanning tree?", options: ["Subgraph connecting all vertices with no cycles", "Graph with cycles", "Tree with weighted edges", "Complete graph"], answer: "Subgraph connecting all vertices with no cycles" },
    { question: "Which algorithm finds the minimum spanning tree?", options: ["Kruskal's Algorithm", "Dijkstra's Algorithm", "BFS", "DFS"], answer: "Kruskal's Algorithm" },
    { question: "What is the degree of a vertex?", options: ["Number of edges connected to it", "Number of paths from it", "Distance from root", "Number of cycles"], answer: "Number of edges connected to it" },
    { question: "What is a complete graph?", options: ["Every pair of vertices is connected", "Graph has no cycles", "All vertices have same degree", "Graph is directed"], answer: "Every pair of vertices is connected" },
    { question: "What is an adjacency matrix?", options: ["2D array representing graph connections", "List of edges", "Tree structure", "Stack of vertices"], answer: "2D array representing graph connections" },
    { question: "What is an adjacency list?", options: ["Array of lists representing connections", "2D matrix", "Tree structure", "Stack of vertices"], answer: "Array of lists representing connections" },
    { question: "Which representation is more space-efficient for sparse graphs?", options: ["Adjacency List", "Adjacency Matrix", "Both are equal", "Depends on vertices"], answer: "Adjacency List" },
    { question: "What is the time complexity of DFS?", options: ["O(V)", "O(E)", "O(V + E)", "O(V * E)"], answer: "O(V + E)" },
    { question: "Which algorithm detects negative weight cycles?", options: ["Bellman-Ford Algorithm", "Dijkstra's Algorithm", "Kruskal's Algorithm", "Prim's Algorithm"], answer: "Bellman-Ford Algorithm" },
    { question: "What is a bipartite graph?", options: ["Vertices can be divided into two sets", "Graph has two components", "Graph with two cycles", "Graph with even vertices"], answer: "Vertices can be divided into two sets" }
  ]
};

// ---------------- FILE SETUP ----------------
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);

const RESULTS_FILE = path.join(dataDir, 'results.json');
const USERS_FILE = path.join(dataDir, 'users.json');

if (!fs.existsSync(RESULTS_FILE)) fs.writeFileSync(RESULTS_FILE, JSON.stringify([]));
if (!fs.existsSync(USERS_FILE)) fs.writeFileSync(USERS_FILE, JSON.stringify([]));

const readJSON = (f) => JSON.parse(fs.readFileSync(f, 'utf-8'));
const writeJSON = (f, d) => fs.writeFileSync(f, JSON.stringify(d, null, 2));

// ---------------- AUTH ROUTES ----------------
app.post('/api/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: 'All fields are required' });

    const users = readJSON(USERS_FILE);
    if (users.find(u => u.email === email))
      return res.status(400).json({ message: 'User already exists' });

    const hashed = await bcrypt.hash(password, 10);
    users.push({ name, email, password: hashed });
    writeJSON(USERS_FILE, users);
    console.log('✅ New user signed up:', email);
    res.json({ message: 'Signup successful', name, email });
  } catch (error) {
    console.error('❌ Signup error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const users = readJSON(USERS_FILE);
    const user = users.find(u => u.email === email);
    if (!user) return res.status(400).json({ message: 'User not found' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: 'Invalid password' });

    console.log('✅ User logged in:', email);
    res.json({ message: 'Login successful', name: user.name, email });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ---------------- QUIZ ROUTES ----------------
app.get('/api/quiz', (req, res) => {
  try {
    const topic = req.query.topic || 'arrays';
    const count = parseInt(req.query.count) || 20;
    
    let q = [];
    if (topic === 'all') {
      Object.values(quizQuestions).forEach(topicQs => {
        q = q.concat(topicQs);
      });
    } else {
      q = quizQuestions[topic] || [];
    }
    
    q = q.sort(() => 0.5 - Math.random()).slice(0, count);
    console.log(`✅ Quiz requested: ${topic}, sending ${q.length} questions`);
    res.json(q);
  } catch (error) {
    console.error('❌ Quiz error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ---------------- RESULT ROUTES ----------------
app.post('/api/results', (req, res) => {
  try {
    const result = req.body;
    const results = readJSON(RESULTS_FILE);
    results.push(result);
    writeJSON(RESULTS_FILE, results);
    console.log('✅ Result saved for:', result.email);
    res.json({ status: 'success', result });
  } catch (error) {
    console.error('❌ Save result error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/records', (req, res) => {
  try {
    res.json(readJSON(RESULTS_FILE));
  } catch (error) {
    console.error('❌ Records error:', error);
    res.status(500).json([]);
  }
});

app.get('/api/leaderboard', (req, res) => {
  try {
    const results = readJSON(RESULTS_FILE);
    const board = results.sort((a, b) => b.score - a.score || a.time - b.time).slice(0, 10);
    res.json(board);
  } catch (error) {
    console.error('❌ Leaderboard error:', error);
    res.status(500).json([]);
  }
});

// Serve index.html for root path
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend', 'index.html'));
});

// ---------------- START SERVER ----------------
app.listen(PORT, () => {
  console.log(`\n${'='.repeat(50)}`);
  console.log(`✅ DSA Quiz Server Running`);
  console.log(`${'='.repeat(50)}`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
  console.log(`📂 Frontend: ${path.join(__dirname, '../frontend')}`);
  console.log(`💾 Data: ${dataDir}`);
  console.log(`📊 Total Questions: ${Object.values(quizQuestions).reduce((sum, arr) => sum + arr.length, 0)}`);
  console.log(`${'='.repeat(50)}\n`);
});
