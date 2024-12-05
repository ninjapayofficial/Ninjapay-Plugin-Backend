/* eslint-disable no-undef */
// plugins/admin-plugin/index.js

const path = require('path');
const express = require('express');

module.exports = {
  init: async function (router, sequelize) {
    console.log('Initializing Admin Plugin');

    // Import models
    const models = require('../../models')(sequelize);

    // Serve static files from the 'views' directory
    router.use(express.static(path.join(__dirname, 'views')));

    // Serve the index.html file when the root of the plugin is accessed
    router.get('/', (req, res) => {
      res.sendFile(path.join(__dirname, 'views', 'index.html'));
    });

    // Import routes
    const routes = require('./routes')(models, sequelize);

    // Use routes
    router.use('/', routes);
  },
};
