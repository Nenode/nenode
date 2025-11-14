// js/chat.js

// Ensure loadTrainingData is imported from your network.js or available globally

// Initialize chat after training data is loaded
loadTrainingData(() => {
  addToLog("Hello, I am Nenode! Ask me anything.", 'bot');
});

const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');
const chatLog = document.getElementById('chat-log');

function addToLog(text, sender) {
  const msg = document.createElement('div');
  msg.className = sender;
  msg.innerHTML = `<strong>${sender === 'user' ? 'You' : 'Nenode'}:</strong> ` + text;
  chatLog.appendChild(msg);
  chatLog.scrollTop = chatLog.scrollHeight;
}

chatForm.addEventListener('submit', function (e) {
  e.preventDefault();
  const userMsg = chatInput.value.trim();
  if (!userMsg) return;
  addToLog(userMsg, 'user');
  chatInput.value = '';

  // Wait for training to complete before replying
  const reply = getBotReply(userMsg); // getBotReply should handle untrained state internally
  setTimeout(() => addToLog(reply, 'bot'), 200);
});
