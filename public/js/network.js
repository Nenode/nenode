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

  // Compute total weight
  const totalWeight = keys.reduce((sum, k) => sum + result[k], 0);

  // Pick a random threshold
  let threshold = Math.random() * totalWeight;

  // Select output key by weighted random
  for (const key of keys) {
    threshold -= result[key];
    if (threshold <= 0) return key;
  }

  // Fallback - return highest weighted key
  return keys[0];
}
