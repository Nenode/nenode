// js/network.js

// Create the LSTM neural network instance
const net = new brain.recurrent.LSTM();

// Load the premade trained model JSON file (your attached training.json)
async function loadModel() {
  try {
    const response = await fetch('data/training.json');
    if (!response.ok) throw new Error('Network response was not ok');

    const jsonModel = await response.json();
    net.fromJSON(jsonModel);
    console.log('Model loaded successfully!');
  } catch (error) {
    console.error('Failed to load model:', error);
  }
}

// Normalize input text by lowercasing and removing non-alphanumeric characters
function preprocess(text) {
  return text.toLowerCase().replace(/[^a-z0-9]/g, '');
}

// Generate chatbot reply using the loaded model
function getBotReply(message) {
  if (!net) return 'Model not loaded yet, please wait...';

  try {
    const normalizedInput = preprocess(message);
    const output = net.run(normalizedInput);
    return output || "Sorry, I don't understand that.";
  } catch (error) {
    console.error('Error during network run:', error);
    return "Sorry, something went wrong.";
  }
}

// Call to load model when the script is first run
loadModel();
