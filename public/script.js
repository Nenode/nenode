// Dark mode support
if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
  document.documentElement.classList.add('dark');
}

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
  if (event.matches) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
});

// Global variables
let net;
let chatData;
let messageCount = 0;

// DOM elements
const chatLog = document.getElementById('chat-log');
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');
const sendBtn = document.getElementById('send-btn');

// Load data and initialize network
async function loadData() {
  try {
    const response = await fetch('data.json');
    chatData = await response.json();
    await initNetwork();
  } catch (error) {
    console.error('Error loading data:', error);
    chatData = {
      trainingData: [],
      responses: {
        default: ["I'm having trouble loading my training data. Please try again later."]
      },
      networkConfig: {
        hiddenLayers: [3],
        iterations: 2000,
        errorThresh: 0.005
      }
    };
  }
}

// Initialize Brain.js neural network
async function initNetwork() {
  net = new brain.NeuralNetwork({
    hiddenLayers: chatData.networkConfig.hiddenLayers
  });

  if (chatData.trainingData.length > 0) {
    net.train(chatData.trainingData, {
      iterations: chatData.networkConfig.iterations,
      errorThresh: chatData.networkConfig.errorThresh,
    });
  }
}

// Get random response from category
function getRandomResponse(category) {
  const options = chatData.responses[category] || chatData.responses.default;
  return options[Math.floor(Math.random() * options.length)];
}

// Tokenize text input
function tokenize(text) {
  const tokens = {};
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 0);

  words.forEach(word => {
    tokens[word] = 1;
  });

  return tokens;
}

// Generate response using neural network
function generateResponse(input) {
  if (!net) return getRandomResponse('default');

  const tokens = tokenize(input);
  const output = net.run(tokens);

  // Find the highest confidence category
  let maxCategory = 'default';
  let maxValue = 0;

  for (const [category, value] of Object.entries(output)) {
    if (value > maxValue && value > 0.5) {
      maxValue = value;
      maxCategory = category;
    }
  }

  return getRandomResponse(maxCategory);
}

// Format current time
function formatTime() {
  const now = new Date();
  return now.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

// Add message to chat log
function addMessage(text, sender) {
  // Remove empty state on first message
  if (messageCount === 0) {
    chatLog.innerHTML = '';
  }
  messageCount++;

  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${sender}`;

  const avatar = sender === 'user' ? 'U' : 'N';
  const name = sender === 'user' ? 'You' : 'Nenode';

  messageDiv.innerHTML = `
    <div class="message-avatar">${avatar}</div>
    <div class="message-content">
      <div class="message-header">${name}</div>
      <div class="message-text">${text}</div>
      <div class="message-time">${formatTime()}</div>
    </div>
  `;

  chatLog.appendChild(messageDiv);
  chatLog.scrollTop = chatLog.scrollHeight;
}

// Show typing indicator
function showTypingIndicator() {
  const indicator = document.createElement('div');
  indicator.className = 'typing-indicator';
  indicator.id = 'typing-indicator';
  indicator.innerHTML = `
    <div class="typing-dots">
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
    </div>
  `;
  chatLog.appendChild(indicator);
  chatLog.scrollTop = chatLog.scrollHeight;
}

// Remove typing indicator
function removeTypingIndicator() {
  const indicator = document.getElementById('typing-indicator');
  if (indicator) {
    indicator.remove();
  }
}

// Handle form submission
async function handleSubmit(e) {
  e.preventDefault();

  const userMessage = chatInput.value.trim();
  if (!userMessage) return;

  // Disable input while processing
  chatInput.disabled = true;
  sendBtn.disabled = true;

  // Add user message
  addMessage(userMessage, 'user');
  chatInput.value = '';

  // Show typing indicator
  showTypingIndicator();

  // Simulate thinking time
  await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 400));

  // Generate and add bot response
  const botResponse = generateResponse(userMessage);
  removeTypingIndicator();
  addMessage(botResponse, 'bot');

  // Re-enable input
  chatInput.disabled = false;
  sendBtn.disabled = false;
  chatInput.focus();
}

// Event listeners
chatForm.addEventListener('submit', handleSubmit);

// Initialize app
loadData();
