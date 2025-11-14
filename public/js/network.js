// network.js

import brain from 'brain.js';
import trainingData from '../data/training.json'; // your training dataset import

// Initialize the Brain.js network instance with hidden layers and sigmoid activation
const net = new brain.NeuralNetwork({
  hiddenLayers: [128, 64],
  activation: 'sigmoid',
});

// Preprocess input/output strings to normalized keys (lowercase, alphanumeric only)
function preprocess(text) {
  return text.toLowerCase().replace(/[^a-z0-9]/g, '');
}

// Format training data by preprocessing keys on both input and output
const formattedTrainingData = trainingData.map(({ input, output }) => ({
  input: Object.fromEntries(
    Object.entries(input).map(([key, value]) => [preprocess(key), value])
  ),
  output: Object.fromEntries(
    Object.entries(output).map(([key, value]) => [preprocess(key), value])
  ),
}));

// Train the network synchronously
net.train(formattedTrainingData, {
  iterations: 20000,
  learningRate: 0.3,
  log: true,
  logPeriod: 1000,
  errorThresh: 0.005,
});

// Function to generate chatbot reply given a user message
export function getBotReply(message) {
  if (!message) return "Please say something.";

  const cleanedInput = preprocess(message);
  const result = net.run({ [cleanedInput]: 1 });

  // Select the output with the highest confidence
  let maxKey = null;
  let maxValue = 0;
  for (const key in result) {
    if (result[key] > maxValue) {
      maxValue = result[key];
      maxKey = key;
    }
  }

  if (!maxKey || maxValue < 0.3) {
    return "Could you say that differently?";
  }

  return maxKey;
}
