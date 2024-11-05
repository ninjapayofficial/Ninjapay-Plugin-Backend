// app.js
const express = require('express');
const { Sequelize } = require('sequelize');
const app = express();
const pluginManager = require('./pluginManager');
require('dotenv').config();
const path = require('path');
const fs = require('fs');

const port = parseInt(process.env.PORT) || process.argv[3] || 3000;

// Middleware to parse JSON requests
app.use(express.json());

// Serve static files from the main 'views' directory
app.use(express.static(path.join(__dirname, 'views')));

// Middleware to serve static files from plugins' 'views' directories
app.use((req, res, next) => {
  const pluginsDir = path.join(__dirname, 'plugins');
  const pluginName = req.path.split('/')[1]; // Get the first segment after '/'
  const pluginPath = path.join(pluginsDir, pluginName);

  if (fs.existsSync(pluginPath)) {
    // Check if the plugin has a 'views' directory
    const pluginViewsPath = path.join(pluginPath, 'views');
    if (fs.existsSync(pluginViewsPath)) {
      express.static(pluginViewsPath)(req, res, next);
    } else {
      next();
    }
  } else {
    next();
  }
});

// Database Connection
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

// // Alternatively, you can use the connection URI provided:
// const sequelize = new Sequelize(process.env.DATABASE_URL, {
//   dialect: 'postgres',
//   protocol: 'postgres',
//   dialectOptions: {
//     ssl: process.env.DB_SSL === 'true' ? {
//       require: true,
//       rejectUnauthorized: false,
//     } : false,
//   },
// });


// Load the Invoice Key from the .env file
const invoiceKey = process.env.INVOICE_KEY;

// Wrap the initialization code in an async function
(async () => {
  try {
    await sequelize.authenticate();
    console.log('Connected to PostgreSQL');

    // Load existing plugins after DB connection
    await pluginManager.loadPlugins(app, sequelize, invoiceKey);

    // Start the server
    app.listen(port, () => {
      console.log(`Main Application is running on port '${port}'.`);
    });
  } catch (err) {
    console.error('Unable to connect to the database:', err);
  }
})();

// Endpoint to install plugins
app.post('/install-plugin', async (req, res) => {
  const { repoUrl } = req.body;
  try {
    await pluginManager.installPlugin(repoUrl, app, sequelize, invoiceKey);
    res.send('Plugin installed and loaded successfully!');
  } catch (error) {
    console.error(error);
    res.status(500).send('Failed to install plugin.');
  }
});

// Endpoint to list installed plugins
app.get('/plugins', (req, res) => {
  const pluginsDir = path.join(__dirname, 'plugins');
  fs.readdir(pluginsDir, (err, files) => {
    if (err) {
      console.error('Error reading plugins directory:', err);
      res.status(500).send('Error reading plugins directory.');
    } else {
      res.json(files);
    }
  });
});

// Endpoint to remove a plugin
app.post('/remove-plugin', (req, res) => {
  const { pluginName } = req.body;
  if (!pluginName) {
    return res.status(400).send('Plugin name is required.');
  }
  try {
    pluginManager.uninstallPlugin(pluginName);
    res.send(`Plugin '${pluginName}' uninstalled successfully.`);
  } catch (error) {
    console.error(`Error uninstalling plugin '${pluginName}':`, error);
    res.status(500).send(`Failed to uninstall plugin '${pluginName}'.`);
  }
});
