/* eslint-disable no-undef */
// plugins/doc-sign-plugin/index.js
const path = require("path");
const express = require("express");

module.exports = {
  init: async function (router, sequelize) {
    console.log("Initializing Doc Sign Plugin");

    // Import models
    const models = require("./models")(sequelize);

    // Serve static files from the 'views' directory
    router.use(express.static(path.join(__dirname, "views")));

    // Serve the admin dashboard
    router.get("/dashboard", (req, res) => {
      res.sendFile(path.join(__dirname, "views", "dashboard.html"));
    });

    // Serve the admin dashboard
    router.get("/login", (req, res) => {
      res.sendFile(path.join(__dirname, "views", "login.html"));
    });

    // Serve the admin dashboard
    router.get("/", (req, res) => {
      res.sendFile(path.join(__dirname, "views", "dashboard.html"));
    });


    // Import routes
    const routes = require("./routes")(models, sequelize);

    // Use routes under the plugin's path
    router.use("/", routes);
  },
};
