// js/network.js

let net;

// Characters allowed in input encoding
const chars = "abcdefghijklmnopqrstuvwxyz ";

// Convert a text string to a character-level input vector
function textToInputVector(text) {
  text = text.toLowerCase();
  const input = {};
  // Initialize all chars to 0
  for (const char of chars) {
    input[char] = 0;
  }
  // Set present chars to 1
  for (const char of text) {
    if (chars.includes(char)) {
      input[char] = 1;
    }
  }
  return input;
}

// Load training data, preprocess it, and train the neural network
function loadTrainingData(callback) {
  fetch('data/training.json')
    .then(response => {
      if (!response.ok) throw new Error("HTTP error " + response.status);
      return response.json();
    })
    .then(trainingData => {
      net = new brain.NeuralNetwork({
        hiddenLayers: [128, 64]  // Two hidden layers for more capacity
      });

      // Preprocess training data input keys
      const processedData = trainingData.map(item => ({
        input: textToInputVector(Object.keys(item.input)[0]),
        output: item.output
      }));

      // Train with more iterations and lower error threshold
      net.train(processedData, {
        iterations: 30000,
        errorThresh: 0.003,
        log: true,
        logPeriod: 500,
        learningRate: 0.3
      });

      if (callback) callback();
    })
    .catch(error => {
      console.error("Failed to load or train data:", error);
      alert("Failed to load training data. See console for details.");
    });
}

// Given a message, return the chatbot reply with confidence checks and randomness
function getBotReply(message) {
  if (!net) return "Training not loaded yet.";
  const inputVector = textToInputVector(message);
  const result = net.run(inputVector);
  if (!result) return "Sorry, I don't understand.";

  const keys = Object.keys(result);
  if (keys.length === 0) return "Sorry, I don't understand.";

  // Find highest confidence output
  let maxKey = keys[0];
  let maxVal = result[maxKey];
  for (const k of keys) {
    if (result[k] > maxVal) {
      maxVal = result[k];
      maxKey = k;
    }
  }

  // Confidence threshold fallback
  if (maxVal < 0.3) {
    return "Sorry, I didn't quite get that. Can you rephrase?";
  }

  // Weighted random among outputs above 0.05 threshold
  const filteredKeys = keys.filter(k => result[k] > 0.05);
  const totalWeight = filteredKeys.reduce((sum, k) => sum + result[k], 0);
  let threshold = Math.random() * totalWeight;
  for (const key of filteredKeys) {
    threshold -= result[key];
    if (threshold <= 0) return key;
  }

  return maxKey; // fallback
}
