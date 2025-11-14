// js/network.js

let net;

// Characters we consider for input encoding (a-z and space)
const chars = "abcdefghijklmnopqrstuvwxyz ";

function textToInputVector(text) {
  text = text.toLowerCase();
  const input = {};
  for (const char of chars) {
    input[char] = 0;
  }
  for (const char of text) {
    if (chars.includes(char)) {
      input[char] = 1;
    }
  }
  return input;
}

function loadTrainingData(callback) {
  fetch('data/training.json')
    .then(response => {
      if (!response.ok) throw new Error("HTTP error " + response.status);
      return response.json();
    })
    .then(trainingData => {
      net = new brain.NeuralNetwork();

      const trainingOptions = {
        iterations: 20000,
        errorThresh: 0.005,
        log: true,
        logPeriod: 500,
        learningRate: 0.3
      };

      // Preprocess training inputs to vector form
      const processedData = trainingData.map(item => ({
        input: textToInputVector(Object.keys(item.input)[0]),
        output: item.output
      }));

      net.train(processedData, trainingOptions);
      if (callback) callback();
    })
    .catch(error => {
      console.error("Failed to load or train data:", error);
      alert("Failed to load training data. See console for details.");
    });
}

// Use character-level input vector for run too
function getBotReply(message) {
  if (!net) return "Training not loaded yet.";
  const inputVector = textToInputVector(message);
  const result = net.run(inputVector);
  if (!result) return "Sorry, I don't understand.";

  const keys = Object.keys(result);
  if (keys.length === 0) return "Sorry, I don't understand.";

  // Confidence threshold and weighted random selection
  let maxKey = keys[0];
  let maxVal = result[maxKey];
  keys.forEach(k => {
    if (result[k] > maxVal) {
      maxVal = result[k];
      maxKey = k;
    }
  });

  if (maxVal < 0.3) {
    return "Sorry, I didn't quite get that. Can you rephrase?";
  }

  const filteredKeys = keys.filter(k => result[k] > 0.05);
  const totalWeight = filteredKeys.reduce((sum, k) => sum + result[k], 0);
  let threshold = Math.random() * totalWeight;

  for (const key of filteredKeys) {
    threshold -= result[key];
    if (threshold <= 0) return key;
  }

  return maxKey;
}
