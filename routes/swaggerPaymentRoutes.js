// routes/swaggerPaymentRoutes.js

const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const lnbitsPaymentService = require("../services/lnbitsPaymentService");
const opennodePaymentService = require("../services/opennodePaymentService");
// eslint-disable-next-line no-unused-vars
const paymentService = require("../services/paymentService");

module.exports = (models) => {
  const { LbtcTransaction, OpennodeTransaction } = models;

  /**
   * @swagger
   * tags:
   *   name: Payments
   *   description: Payment processing endpoints
   */

  /**
   * @swagger
   * /payments/createPayLink:
   *   post:
   *     summary: Create a pay link
   *     tags: [Payments]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - amount
   *               - description
   *               - notifyUrl
   *             properties:
   *               amount:
   *                 type: number
   *                 description: Amount to be paid
   *               description:
   *                 type: string
   *                 description: Description of the payment
   *               notifyUrl:
   *                 type: string
   *                 format: uri
   *                 description: URL to notify upon payment completion
   *     responses:
   *       200:
   *         description: Pay link created successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 payLink:
   *                   type: string
   *                   description: The generated payment link
   *                 expiresAt:
   *                   type: string
   *                   format: date-time
   *                   description: Expiration time of the pay link
   *       400:
   *         description: Bad request or missing provider
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: string
   *       500:
   *         description: Failed to create pay link
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: string
   */
  router.post("/createPayLink", authMiddleware, async (req, res) => {
    const { amount, description, notifyUrl } = req.body;
    const provider = req.provider;
    const user = req.user;

    if (!provider) {
      return res.status(400).json({ error: "No funding provider connected." });
    }

    try {
      let payLinkData;

      if (provider.provider === "lnbits") {
        payLinkData = await lnbitsPaymentService.createPayLink(
          user,
          provider,
          amount,
          description,
          notifyUrl,
          LbtcTransaction,
        );
      } else if (provider.provider === "opennode") {
        payLinkData = await opennodePaymentService.createPayLink(
          user,
          provider,
          amount,
          description,
          notifyUrl,
          OpennodeTransaction,
        );
      } else {
        return res.status(400).json({ error: "Unsupported provider." });
      }

      if (payLinkData) {
        res.status(200).json(payLinkData);
      } else {
        res.status(500).json({ error: "Failed to create pay link." });
      }
    } catch (error) {
      console.error("Error creating pay link:", error);
      res.status(500).json({ error: "Error creating pay link." });
    }
  });

  /**
   * @swagger
   * /payments/payInvoice:
   *   post:
   *     summary: Pay an invoice
   *     tags: [Payments]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - bolt11
   *             properties:
   *               bolt11:
   *                 type: string
   *                 description: BOLT11 invoice string
   *     responses:
   *       200:
   *         description: Invoice paid successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 transactionId:
   *                   type: string
   *                   description: ID of the transaction
   *                 status:
   *                   type: string
   *                   description: Status of the payment
   *       400:
   *         description: Bad request or unsupported provider
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: string
   *       500:
   *         description: Failed to pay invoice
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: string
   */
  router.post("/payInvoice", authMiddleware, async (req, res) => {
    const { bolt11 } = req.body;
    const provider = req.provider;
    const user = req.user;

    if (!provider) {
      return res.status(400).json({ error: "No funding provider connected." });
    }

    if (!bolt11) {
      return res.status(400).json({ error: "BOLT11 invoice is required." });
    }

    try {
      let paymentData;

      if (provider.provider === "lnbits") {
        paymentData = await lnbitsPaymentService.payInvoice(
          user,
          provider,
          bolt11,
          LbtcTransaction,
        );
      } else if (provider.provider === "opennode") {
        paymentData = await opennodePaymentService.payInvoice(
          user,
          provider,
          bolt11,
          OpennodeTransaction,
        );
      } else {
        return res.status(400).json({ error: "Unsupported provider." });
      }

      if (paymentData) {
        res.status(200).json(paymentData);
      } else {
        res.status(500).json({ error: "Failed to pay invoice." });
      }
    } catch (error) {
      console.error("Error paying invoice:", error);
      res.status(500).json({ error: "Error paying invoice." });
    }
  });

  /**
   * @swagger
   * /payments/checkPaymentStatus/{paymentId}:
   *   get:
   *     summary: Check the status of a payment
   *     tags: [Payments]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: paymentId
   *         required: true
   *         schema:
   *           type: string
   *         description: ID of the payment to check
   *     responses:
   *       200:
   *         description: Payment status retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 paymentId:
   *                   type: string
   *                 status:
   *                   type: string
   *                 amount:
   *                   type: number
   *                 currency:
   *                   type: string
   *       400:
   *         description: Bad request or unsupported provider
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: string
   *       500:
   *         description: Failed to check payment status
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: string
   */
  router.get(
    "/checkPaymentStatus/:paymentId",
    authMiddleware,
    async (req, res) => {
      const { paymentId } = req.params;
      const provider = req.provider;
      // eslint-disable-next-line no-unused-vars
      const user = req.user;

      if (!provider) {
        return res.status(400).json({ error: "No funding provider connected." });
      }

      try {
        let paymentStatus;

        if (provider.provider === "lnbits") {
          paymentStatus = await lnbitsPaymentService.checkPaymentStatus(
            provider,
            paymentId,
            LbtcTransaction,
          );
        } else if (provider.provider === "opennode") {
          paymentStatus = await opennodePaymentService.checkPaymentStatus(
            provider,
            paymentId,
          );
        } else {
          return res.status(400).json({ error: "Unsupported provider." });
        }

        if (paymentStatus) {
          res.status(200).json(paymentStatus);
        } else {
          res.status(500).json({ error: "Failed to check payment status." });
        }
      } catch (error) {
        console.error("Error checking payment status:", error);
        res.status(500).json({ error: "Error checking payment status." });
      }
    },
  );

  /**
   * @swagger
   * /payments/balance:
   *   get:
   *     summary: Retrieve the current balance
   *     tags: [Payments]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Balance retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 balance:
   *                   type: number
   *                   description: Current balance
   *                 currency:
   *                   type: string
   *                   description: Currency of the balance
   *       400:
   *         description: Bad request or unsupported provider
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: string
   *       500:
   *         description: Failed to retrieve balance
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: string
   */
  router.get("/balance", authMiddleware, async (req, res) => {
    const provider = req.provider;

    if (!provider) {
      return res.status(400).json({ error: "No funding provider connected." });
    }

    try {
      let balance;

      if (provider.provider === "lnbits") {
        balance = await lnbitsPaymentService.getBalance(provider);
      } else if (provider.provider === "opennode") {
        balance = await opennodePaymentService.getBalance(provider);
      } else {
        return res.status(400).json({ error: "Unsupported provider." });
      }

      if (balance !== null) {
        res.status(200).json(balance);
      } else {
        res.status(500).json({ error: "Failed to retrieve balance." });
      }
    } catch (error) {
      console.error("Error fetching balance:", error);
      res.status(500).json({ error: "Error fetching balance." });
    }
  });

  /**
   * @swagger
   * /payments/transactions:
   *   get:
   *     summary: Fetch all transactions
   *     tags: [Payments]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Transactions fetched successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 type: object
   *                 properties:
   *                   transactionId:
   *                     type: string
   *                   amount:
   *                     type: number
   *                   currency:
   *                     type: string
   *                   status:
   *                     type: string
   *                   date:
   *                     type: string
   *                     format: date-time
   *       400:
   *         description: Bad request or unsupported provider
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: string
   *       500:
   *         description: Failed to fetch transactions
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: string
   */
  router.get("/transactions", authMiddleware, async (req, res) => {
    const provider = req.provider;
    const user = req.user;

    if (!provider) {
      return res.status(400).json({ error: "No funding provider connected." });
    }

    try {
      let transactions;

      if (provider.provider === "lnbits") {
        transactions = await lnbitsPaymentService.getTransactions(
          user,
          provider,
          LbtcTransaction,
        );
      } else if (provider.provider === "opennode") {
        transactions = await opennodePaymentService.getTransactions(
          user,
          provider,
          OpennodeTransaction,
        );
      } else {
        return res.status(400).json({ error: "Unsupported provider." });
      }

      if (transactions) {
        res.status(200).json(transactions);
      } else {
        res.status(500).json({ error: "Failed to fetch transactions." });
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ error: "Error fetching transactions." });
    }
  });

  return router;
};
