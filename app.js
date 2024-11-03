// app.js
const express = require('express');
const { Sequelize } = require('sequelize');
const app = express();
const pluginManager = require('./pluginManager');
require('dotenv').config();


// Middleware to parse JSON requests
app.use(express.json());

// // Database Connection
// const sequelize = new Sequelize('mainapp', 'your_username', 'your_password', {
//   host: 'localhost',
//   dialect: 'postgres',
// });

// // Database Connection
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: process.env.DB_DIALECT || 'postgres',
  port: process.env.DB_PORT || 5432,
  dialectOptions: {
    ssl: process.env.DB_SSL === 'true' ? {
      require: true,
      rejectUnauthorized: false,
    } : false,
  },
});



// Test the database connection
sequelize
  .authenticate()
  .then(() => {
    console.log('Connected to PostgreSQL');

    // Load existing plugins after DB connection
    pluginManager.loadPlugins(app, sequelize);

    // Start the server
    app.listen(3000, () => {
      console.log('Main Application is running on port 3000.');
    });
  })
  .catch((err) => {
    console.error('Unable to connect to the database:', err);
  });

// Routes
app.get('/', (req, res) => {
  res.send('Welcome to the Main Application!');
});

// Endpoint to install plugins
app.post('/install-plugin', async (req, res) => {
  const { repoUrl } = req.body;
  try {
    await pluginManager.installPlugin(repoUrl, app, sequelize);
    res.send('Plugin installed and loaded successfully!');
  } catch (error) {
    console.error(error);
    res.status(500).send('Failed to install plugin.');
  }
});
