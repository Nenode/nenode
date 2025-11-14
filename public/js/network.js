// js/network.js

import brain from 'brain.js';
import trainingData from '../data/training.json'; // Your properly formatted training JSON

// Normalize message string keys consistently
function preprocess(text) {
  return text.toLowerCase().replace(/[^a-z0-9]/g, '');
}

// Format training data keys for brain.js network training
const formattedTrainingData = trainingData.map(({ input, output }) => ({
  input: Object.fromEntries(
    Object.entries(input).map(([key, val]) => [preprocess(key), val])
  ),
  output: Object.fromEntries(
    Object.entries(output).map(([key, val]) => [preprocess(key), val])
  ),
}));

// Initialize the Neural Network with chosen structure and activation
const net = new brain.NeuralNetwork({
  hiddenLayers: [128, 64],
  activation: 'sigmoid',
});

// Train the network on the formatted training data
net.train(formattedTrainingData, {
  iterations: 20000,
  learningRate: 0.3,
  errorThresh: 0.005,
  log: true,
  logPeriod: 1000,
});

// Generate a bot reply to a user message
export function getBotReply(message) {
  if (!message) return 'Please say something!';

  const cleanedInput = preprocess(message);
  const result = net.run({ [cleanedInput]: 1 });

  const keys = Object.keys(result);
  if (keys.length === 0) return "Sorry, I don't understand.";

  // Pick the result with highest confidence
  let maxKey = keys[0];
  let maxVal = result[maxKey];
  keys.forEach(k => {
    if (result[k] > maxVal) {
      maxKey = k;
      maxVal = result[k];
    }
  });

  // Threshold for confident result
  if (maxVal < 0.3) return "Could you say that differently?";

  return maxKey;
}
