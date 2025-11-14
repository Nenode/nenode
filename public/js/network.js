import brain from 'brain.js';
import trainingData from '../data/training.json';

// Normalize strings for keys used in training and inference
function preprocess(text) {
  return text.toLowerCase().replace(/[^a-z0-9]/g, '');
}

// Preprocess training data keys
const formattedTrainingData = trainingData.map(({ input, output }) => ({
  input: Object.fromEntries(
    Object.entries(input).map(([key, val]) => [preprocess(key), val])
  ),
  output: Object.fromEntries(
    Object.entries(output).map(([key, val]) => [preprocess(key), val])
  ),
}));

const net = new brain.NeuralNetwork({
  hiddenLayers: [128, 64],
  activation: 'sigmoid',
});

// Train network (can reduce iterations to speed up)
net.train(formattedTrainingData, {
  iterations: 20000,
  learningRate: 0.3,
  errorThresh: 0.005,
  log: true,
  logPeriod: 1000,
});

export function getBotReply(message) {
  if (!message) return 'Please say something.';

  const cleanedInput = preprocess(message);
  const result = net.run({ [cleanedInput]: 1 });

  const keys = Object.keys(result);
  if (!keys.length) return "Sorry, I didn't understand.";

  let maxKey = keys[0];
  let maxValue = result[maxKey];

  keys.forEach((key) => {
    if (result[key] > maxValue) {
      maxKey = key;
      maxValue = result[key];
    }
  });

  if (maxValue < 0.3) return 'Could you say that differently?';

  return maxKey;
}
