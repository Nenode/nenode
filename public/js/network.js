// js/network.js

let net;

function loadTrainingData(callback) {
  fetch('data/training.json')
    .then(response => {
      if (!response.ok) throw new Error("HTTP error " + response.status);
      return response.json();
    })
    .then(trainingData => {
      net = new brain.NeuralNetwork();

      // Training options for better accuracy and training process control
      const trainingOptions = {
        iterations: 20000,    // Number of training iterations
        errorThresh: 0.005,   // Acceptable error threshold
        log: true,            // Enable training progress logging
        logPeriod: 500,       // Log every 500 iterations
        learningRate: 0.3     // Learning rate controls weight changes
      };

      net.train(trainingData, trainingOptions);
      if (callback) callback();
    })
    .catch(error => {
      console.error("Failed to load or train data:", error);
      alert("Failed to load training data. See console for details.");
    });
}

// Preprocess input text: lowercase, strip non-alphanumeric
function preprocess(text) {
  const key = text.replace(/[^a-z0-9]/gi, '').toLowerCase();
  const obj = {};
  obj[key] = 1;
  return obj;
}

// Choose a reply using weighted random sampling from brain.js output scores
function getBotReply(message) {
  if (!net) return "Training not loaded yet.";
  const result = net.run(preprocess(message));
  if (!result) return "Sorry, I don't understand.";

  const keys = Object.keys(result);
  if (keys.length === 0) return "Sorry, I don't understand.";

  // Total weight sum of all possible outputs
  const totalWeight = keys.reduce((sum, key) => sum + result[key], 0);
  let randomThreshold = Math.random() * totalWeight;

  // Walk through keys weighted by their activation scores to randomly pick
  for (const key of keys) {
    randomThreshold -= result[key];
    if (randomThreshold <= 0) return key;
  }

  // Fallback (shouldn't hit here)
  return keys[0];
}
