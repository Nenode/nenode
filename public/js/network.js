// network.js

import brain from 'brain.js';
import trainingData from '../data/training.json';  // JSON of [{input:{key:1}, output:{key:1}}...]

const net = new brain.NeuralNetwork({
  hiddenLayers: [128, 64],
  activation: 'sigmoid',
});

function preprocess(text) {
  return text.toLowerCase().replace(/[^a-z0-9]/g, '');
}

// Format training data keys with preprocessing
const formattedTrainingData = trainingData.map(({ input, output }) => ({
  input: Object.fromEntries(
    Object.entries(input).map(([key, val]) => [preprocess(key), val])
  ),
  output: Object.fromEntries(
    Object.entries(output).map(([key, val]) => [preprocess(key), val])
  ),
}));

net.train(formattedTrainingData, {
  iterations: 20000,
  learningRate: 0.3,
  errorThresh: 0.005,
  log: true,
  logPeriod: 1000,
});

export function getBotReply(message) {
  if (!message) return 'Please say something!';

  const cleanedKey = preprocess(message);
  const result = net.run({ [cleanedKey]: 1 });

  const keys = Object.keys(result);
  if (keys.length === 0) return "Sorry, I don't understand.";

  let maxKey = keys[0];
  let maxVal = result[maxKey];
  for (const k of keys) {
    if (result[k] > maxVal) {
      maxKey = k;
      maxVal = result[k];
    }
  }

  if (maxVal < 0.3) return 'Could you say that differently?';

  return maxKey;
}
