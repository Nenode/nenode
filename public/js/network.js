// js/network.js

// Neural net setup and training data
const net = new brain.NeuralNetwork();

// Very basic Q&A training data
net.train([
  {input: {hi: 1}, output: {hello: 1}},
  {input: {hello: 1}, output: {hi: 1}},
  {input: {howareyou: 1}, output: {good: 1}},
  {input: {bye: 1}, output: {goodbye: 1}},
]);

// Helper to process text input into {key:1} for training and running
function preprocess(text) {
  // Lowercase and remove spaces
  const key = text.replace(/[^a-z0-9]/gi,'').toLowerCase();
  const obj = {};
  obj[key] = 1;
  return obj;
}

// Given a user message, get bot reply
function getBotReply(message) {
  const result = net.run(preprocess(message));
  // Pick most likely output
  if (!result) return "Sorry, I don't understand.";
  const keys = Object.keys(result);
  if (keys.length === 0) return "Sorry, I don't understand.";
  let maxKey = keys[0], maxVal = result[maxKey];
  keys.forEach(k => {
    if (result[k] > maxVal) {
      maxKey = k;
      maxVal = result[k];
    }
  });
  return maxKey;
}
