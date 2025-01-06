/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
// plugins/opennode-plugin/src/index.js
const axios = require("axios");
const path = require("path");

module.exports = {
  init: async function (router, sequelize) {
    console.log(`Initializing OpenNode Plugin`);

    // Serve the plugin's interface (index.html)
    router.get("/", (req, res) => {
      res.sendFile(path.join(__dirname, "../views", "index.html"));
    });

    // Helper function to retrieve provider data (handled by authMiddleware)
    function getProviderData(req) {
      return req.provider;
    }

    // Route to create an invoice (uses main app's /payments/createPayLink)
    router.post("/create-invoice", async (req, res) => {
      const { amount, memo } = req.body;
      const provider = getProviderData(req);

      if (!provider) {
        return res.status(400).send("Provider not specified or invalid.");
      }

      try {
        const response = await axios.post(
          "http://localhost:3000/payments/createPayLink",
          {
            amount,
            description: memo,
          },
          {
            headers: {
              "x-provider-invoice-key": provider.providerInvoiceKey,
            },
          },
        );

        res.status(200).json(response.data);
      } catch (error) {
        console.error(
          "Error creating invoice via main app API:",
          error.response ? error.response.data : error.message,
        );
        res.status(500).send("Error creating invoice.");
      }
    });

    // Route to pay an invoice (uses main app's /payments/payInvoice)
    router.post("/pay-invoice", async (req, res) => {
      const { bolt11 } = req.body;
      const provider = getProviderData(req);

      if (!bolt11) {
        return res.status(400).send("Invoice (BOLT11) is required.");
      }

      try {
        const response = await axios.post(
          "http://localhost:3000/payments/payInvoice",
          {
            bolt11,
          },
          {
            headers: {
              "x-provider-admin-key": provider.providerAdminKey,
            },
          },
        );

        res.status(200).json(response.data);
      } catch (error) {
        console.error(
          "Error paying invoice via main app API:",
          error.response ? error.response.data : error.message,
        );
        res.status(500).send("Error paying invoice.");
      }
    });

    // Route to get transaction history (uses main app's /payments/transactions)
    router.get("/transactions", async (req, res) => {
      const provider = getProviderData(req);

      try {
        const response = await axios.get(
          "http://localhost:3000/payments/transactions",
          {
            headers: {
              "x-provider-invoice-key": provider.providerInvoiceKey,
            },
          },
        );

        res.status(200).json(response.data);
      } catch (error) {
        console.error(
          "Error fetching transactions via main app API:",
          error.response ? error.response.data : error.message,
        );
        res.status(500).send("Error fetching transactions.");
      }
    });

    // Route to get wallet balance (uses main app's /payments/balance)
    router.get("/balance", async (req, res) => {
      const provider = getProviderData(req);

      try {
        const response = await axios.get(
          "http://localhost:3000/payments/balance",
          {
            headers: {
              "x-provider-invoice-key": provider.providerInvoiceKey,
            },
          },
        );

        res.status(200).json(response.data);
      } catch (error) {
        console.error(
          "Error fetching balance via main app API:",
          error.response ? error.response.data : error.message,
        );
        res.status(500).send("Error fetching balance.");
      }
    });
  },
};
