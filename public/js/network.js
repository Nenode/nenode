let net;

// Simple preprocessing function to normalize keys
function preprocess(text) {
  return text.toLowerCase().replace(/[^a-z0-9]/g, '');
}

// Load training data JSON and train network
function loadTrainingData(callback) {
  fetch('../data/training.json')
    .then(resp => resp.json())
    .then(trainingData => {
      net = new brain.NeuralNetwork();

      // Map and preprocess training data keys
      const formattedData = trainingData.map(({ input, output }) => ({
        input: Object.fromEntries(
          Object.entries(input).map(([k, v]) => [preprocess(k), v])
        ),
        output: Object.fromEntries(
          Object.entries(output).map(([k, v]) => [preprocess(k), v])
        ),
      }));

      net.train(formattedData, {
        iterations: 10000,
        learningRate: 0.3,
        log: false
      });

      if (callback) callback();
    })
    .catch(() => alert('Failed to load training data.'));
}

// Get reply from net given user message
function getBotReply(message) {
  if (!net) return "Training not finished yet.";
  if (!message) return "Please say something.";

  const result = net.run(preprocess(message));
  if (!result) return "Sorry, I don't understand.";

  const keys = Object.keys(result);
  if (keys.length === 0) return "Sorry, I don't understand.";

  // Select highest confidence output key
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

// Export functions
export { loadTrainingData, getBotReply };
