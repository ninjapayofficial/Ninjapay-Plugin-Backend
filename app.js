// app.js
const express = require('express');
const app = express();
const pluginManager = require('./pluginManager');

// Middleware to parse JSON requests
app.use(express.json());

// Load existing plugins at startup
pluginManager.loadPlugins(app);

// Routes
app.get('/', (req, res) => {
  res.send('Welcome to the Main Application!');
});

// Endpoint to install plugins
app.post('/install-plugin', async (req, res) => {
  const { repoUrl } = req.body;
  try {
    await pluginManager.installPlugin(repoUrl, app); // Pass 'app' here
    res.send('Plugin installed and loaded successfully!');
  } catch (error) {
    console.error(error);
    res.status(500).send('Failed to install plugin.');
  }
});

// Start the server
app.listen(3000, () => {
  console.log('Main Application is running on port 3000.');
});
