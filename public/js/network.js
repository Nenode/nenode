// js/network.js

let net;

function loadTrainingData(callback) {
  fetch('data/training.json')
    .then(resp => resp.json())
    .then(trainingData => {
      net = new brain.NeuralNetwork();
      net.train(trainingData);
      if (callback) callback();
    })
    .catch(() => {
      alert("Failed to load training data.");
    });
}

function preprocess(text) {
  const key = text.replace(/[^a-z0-9]/gi, '').toLowerCase();
  const obj = {};
  obj[key] = 1;
  return obj;
}

function getBotReply(message) {
  if (!net) return "Training not loaded yet.";
  const result = net.run(preprocess(message));
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
