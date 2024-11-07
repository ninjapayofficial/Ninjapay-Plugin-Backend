// const express = require('express');
// const router = express.Router();
// const pluginManager = require('../pluginManager');

// // Define your routes
// router.post('/install-plugin', async (req, res) => { /*...*/ });
// router.get('/plugins', (req, res) => { /*...*/ });
// router.post('/remove-plugin', (req, res) => { /*...*/ });

// module.exports = router;



/////////
// // in app.js
// const pluginRoutes = require('./routes/pluginRoutes');
// app.use('/api', pluginRoutes);


// routes/pluginRoutes.js
const express = require('express');
const router = express.Router();
const pluginManager = require('../pluginManager');


/**
 * @swagger
 * /api/install-plugin:
 *   post:
 *     summary: Install a new plugin
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               repoUrl:
 *                 type: string
 *                 description: URL of the plugin repository
 *     responses:
 *       200:
 *         description: Plugin installed successfully
 *       500:
 *         description: Failed to install plugin
 */
router.post('/install-plugin', async (req, res) => {
  let { repoUrl } = req.body;
  if (!validator.isURL(repoUrl, { protocols: ['http', 'https'], require_tld: true })) {
    return res.status(400).send('Invalid repository URL.');
  }
  try {
    await pluginManager.installPlugin(repoUrl, app, sequelize, invoiceKey);
    res.send('Plugin installed and loaded successfully!');
  } catch (error) {
    console.error(error);
    res.status(500).send('Failed to install plugin.');
  }
  // ... existing code ...
});

/**
 * @swagger
 * /api/plugins:
 *   get:
 *     summary: Get list of installed plugins
 *     responses:
 *       200:
 *         description: List of plugins
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 */
router.get('/plugins', (req, res) => {
    const pluginsDir = path.join(__dirname, 'plugins');
    fs.readdir(pluginsDir, (err, files) => {
      if (err) {
        console.error('Error reading plugins directory:', err);
        res.status(500).send('Error reading plugins directory.');
      } else {
        res.json(files);
      }
    });
  // ... existing code ...
});

/**
 * @swagger
 * /api/remove-plugin:
 *   post:
 *     summary: Remove an installed plugin
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               pluginName:
 *                 type: string
 *                 description: Name of the plugin to remove
 *     responses:
 *       200:
 *         description: Plugin removed successfully
 *       500:
 *         description: Failed to remove plugin
 */
router.post('/remove-plugin', (req, res) => {
  // ... existing code ...
});

module.exports = router;
