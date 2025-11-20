let net;

function preprocess(text) {
  // Preprocess: lowercase and remove non-alphanumeric, then convert into object
  const token = text.toLowerCase().replace(/[^a-z0-9]/g, '');
  const result = {};
  if (token.trim().length > 0) {
    result[token] = 1;
  }
  return result;
}

function loadTrainingData(callback) {
  console.log('Loading training data...');
  fetch('../data/training.json')
    .then(resp => {
      if (!resp.ok) throw new Error('Fetch failed');
      return resp.json();
    })
    .then(trainingData => {
      console.log('Training data loaded:', trainingData);
      net = new brain.NeuralNetwork();
      net.train(trainingData, {
        iterations: 2000,
        log: true
      });
      console.log('Training finished!');
      if (callback) callback();
    })
    .catch(err => {
      console.error('Error loading or training:', err);
      alert('Could not load training data');
    });
}

function getBotReply(message) {
  if (!net) return "Training not finished yet.";
  if (!message) return "Please say something.";

  // Preprocess to be { token: 1 } form
  const input = preprocess(message);
  const result = net.run(input);
  console.log('Bot reply result:', result);
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
  if (maxVal < 0.1) return "Could you say that differently?";
  return maxKey;
}
