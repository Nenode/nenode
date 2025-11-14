// network.js

import brain from 'brain.js';
import trainingData from './training.js';  // your training dataset import

// Initialize the Brain.js network
const net = new brain.NeuralNetwork({
  hiddenLayers: [128, 64],  // Adjust layer sizes for better performance as needed
  activation: 'sigmoid'
});

// Preprocess inputs into format compatible with training data keys
function preprocess(input) {
  return input.toLowerCase().replace(/[^a-z0-9]/g, '');
}

// Format training data to match Brain.js expected input/output shape
const formattedTrainingData = trainingData.map(({ input, output }) => ({
  input: { [preprocess(input)]: 1 },
  output: { [preprocess(output)]: 1 },
}));

// Train the network on your training data
net.train(formattedTrainingData, {
  iterations: 20000,
  learningRate: 0.3,
  log: true,
  logPeriod: 1000,
  errorThresh: 0.005,
});

// Given a user message, return the bot reply
export function getBotReply(message) {
  if (!message) return 'Please say something!';

  const cleaned = preprocess(message);
  const result = net.run({ [cleaned]: 1 });
  
  // Pick response with highest confidence
  const keys = Object.keys(result);
  if (keys.length === 0) return "Sorry, I don't understand.";

  let maxKey = keys[0];
  let maxVal = result[maxKey];
  for (const k of keys) {
    if (result[k] > maxVal) {
      maxVal = result[k];
      maxKey = k;
    }
  }

  if (maxVal < 0.3) return 'Could you say that differently?';

  return maxKey;
}
