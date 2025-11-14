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

function getBotReply(message) {
  if (!net) return "Training not loaded yet.";
  const result = net.run(preprocess(message));
  if (!result) return "Sorry, I don't understand.";

  const keys = Object.keys(result);
  if (keys.length === 0) return "Sorry, I don't understand.";

  // Find max output and check confidence threshold
  let maxKey = keys[0];
  let maxVal = result[maxKey];
  keys.forEach(k => {
    if (result[k] > maxVal) {
      maxKey = k;
      maxVal = result[k];
    }
  });

  // Confidence threshold check; if too low, use fallback
  if (maxVal < 0.3) {
    return "Sorry, I didn't quite get that. Can you rephrase?";
  }

  // Weighted random selection among outputs with significant score
  const filteredKeys = keys.filter(k => result[k] > 0.05);
  let totalWeight = filteredKeys.reduce((sum, k) => sum + result[k], 0);
  let threshold = Math.random() * totalWeight;

  for (const key of filteredKeys) {
    threshold -= result[key];
    if (threshold <= 0) return key;
  }

  return maxKey; // fallback
}
