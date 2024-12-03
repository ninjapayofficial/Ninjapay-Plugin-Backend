/* eslint-disable no-undef */
const path = require("path");
const express = require("express");

module.exports = {
  init: async function (router, sequelize) {
    console.log("Initializing Loan Plugin");

    // Import models
    const models = require("./models")(sequelize);

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
