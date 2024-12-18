/* eslint-disable no-undef */
// plugins/charts-plugin/index.js
const path = require("path");
const express = require("express");

module.exports = {
  // eslint-disable-next-line no-unused-vars
  init: async function (router, sequelize) {
    console.log("Initializing Candle Chart Plugin");

    // Serve static files from the 'views' directory
    router.use(express.static(path.join(__dirname, "views")));

    // Serve the index.html file at the plugin root
    router.get("/", (req, res) => {
      res.sendFile(path.join(__dirname, "views", "index.html"));
    });

    // If you have models and routes, set them up similarly
    // const models = require("./models")(sequelize);
    // const routes = require("./routes")(models);
    // router.use("/", routes);
  },
};
