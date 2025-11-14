// js/network.js

let net;

// Load training data and train network asynchronously
function loadTrainingData(callback) {
  fetch('data/training.json')
    .then(resp => {
      if (!resp.ok) throw new Error('Failed to fetch training data');
      return resp.json();
    })
    .then(trainingData => {
      net = new brain.NeuralNetwork({
        hiddenLayers: [128, 64],
        activation: 'sigmoid',
      });

      // Preprocess keys in training data
      const preprocessed = trainingData.map(({ input, output }) => ({
        input: Object.fromEntries(
          Object.entries(input).map(([k, v]) => [preprocess(k), v])
        ),
        output: Object.fromEntries(
          Object.entries(output).map(([k, v]) => [preprocess(k), v])
        ),
      }));

      net.train(preprocessed, {
        iterations: 20000,
        learningRate: 0.3,
        errorThresh: 0.005,
        log: true,
        logPeriod: 1000,
      });

      if (callback) callback();
    })
    .catch(error => {
      console.error("Training data load or train failed", error);
      alert("Failed to load or train on training data.");
    });
}

// Normalize message strings to keys
function preprocess(text) {
  return text.toLowerCase().replace(/[^a-z0-9]/gi, '');
}

// Get bot reply after network trained
function getBotReply(message) {
  if (!net) return "Training not loaded yet.";
  if (!message) return "Please say something.";

  const result = net.run(preprocess(message));
  if (!result) return "Sorry, I don't understand.";

  const keys = Object.keys(result);
  if (keys.length === 0) return "Sorry, I don't understand.";

  let maxKey = keys[0];
  let maxVal = result[maxKey];

  keys.forEach(k => {
    if (result[k] > maxVal) {
      maxKey = k;
      maxVal = result[k];
    }
  });

  if (maxVal < 0.3) return "Could you say that differently?";

  return maxKey;
}

// Export functions to use elsewhere
export { loadTrainingData, getBotReply };
