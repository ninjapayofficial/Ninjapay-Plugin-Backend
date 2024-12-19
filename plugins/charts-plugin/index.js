/* eslint-disable no-undef */
// plugins/charts-plugin/index.js
const path = require("path");
const express = require("express");
const dataRoutes = require("./routes/data");

module.exports = {
  // eslint-disable-next-line no-unused-vars
  init: async function (router, sequelize) {
    console.log("Initializing Candle Chart Plugin");

    // Serve static files from 'views' directory
    router.use(express.static(path.join(__dirname, "views")));

    // Add the data routes
    router.use("/api", dataRoutes);

    // Serve index.html for the root
    router.get("/", (req, res) => {
      res.sendFile(path.join(__dirname, "views", "index.html"));
    });

    // Serve index.html for symbol URLs
    router.get("/:symbol", (req, res) => {
      res.sendFile(path.join(__dirname, "views", "index.html"));
    });
  },
};
