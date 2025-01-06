/* eslint-disable no-undef */
// plugins/khata-plugin/src/index.js

const path = require("path");
const express = require("express");

module.exports = {
  init: async function (router, sequelize) {
    console.log("Initializing Khata Plugin");

    // Import models
    const models = require("./models")(sequelize);

    // Run migrations (consider removing this if migrations are handled elsewhere)
    // await sequelize.getQueryInterface().createTable('KhataCompanies', models.KhataCompany.rawAttributes);
    // await sequelize.getQueryInterface().createTable('KhataParties', models.KhataParty.rawAttributes);
    // await sequelize.getQueryInterface().createTable('KhataTransactions', models.KhataTransaction.rawAttributes);

    // Serve static files from the 'views' directory
    router.use(express.static(path.join(__dirname, "views")));

    // Serve the index.html file when the root of the plugin is accessed
    router.get("/", (req, res) => {
      res.sendFile(path.join(__dirname, "views", "index.html"));
    });

    // Import routes
    const routes = require("./routes")(models);

    // Use routes
    router.use("/", routes);
  },
};
