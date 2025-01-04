/* eslint-disable no-undef */
// plugins/risk-engine-plugin/index.js
const path = require("path");
const express = require("express");
const riskEngineRoutes = require("./routes/riskEngine");

module.exports = {
  // eslint-disable-next-line no-unused-vars
  init: async function (router, sequelize) {
    console.log("Initializing Risk Engine Plugin");

    // If you have DB models for RiskEngine, you can import them here, e.g.:
    // const { RiskEvent } = require("./models")(sequelize);

    // Serve static files from the views folder (if you want a front-end UI)
    router.use(express.static(path.join(__dirname, "views")));

    // Add the routes
    router.use("/api", riskEngineRoutes);

    // Optional: Serve a simple index.html
    router.get("/", (req, res) => {
      res.sendFile(path.join(__dirname, "views", "index.html"));
    });
  },
};
