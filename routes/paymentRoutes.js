// routes/paymentRoutes.js

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const paymentService = require('../services/paymentService');

module.exports = (models) => {
  const { LbtcTransaction } = models;

  /**
   * Create Pay Link
   * POST /payments/createPayLink
   */
  router.post('/createPayLink', authMiddleware, async (req, res) => {
    const { amount, description } = req.body;
    const provider = req.provider;
    const user = req.user;

    if (!provider) {
      return res.status(400).send('Provider not specified or invalid.');
    }

    try {
      let payLinkData;

      if (provider.provider === 'lnbits') {
        payLinkData = await paymentService.createPayLink(user, provider, amount, description, LbtcTransaction);
      }
      // Handle other providers here

      if (payLinkData) {
        res.status(200).json(payLinkData);
      } else {
        res.status(500).send('Failed to create pay link.');
      }
    } catch (error) {
      console.error('Error creating pay link:', error);
      res.status(500).send('Error creating pay link.');
    }
  });

  /**
   * Pay Invoice
   * POST /payments/payInvoice
   */
  router.post('/payInvoice', authMiddleware, async (req, res) => {
    const { bolt11 } = req.body;
    const provider = req.provider;
    const user = req.user;

    if (!bolt11) {
      return res.status(400).send('BOLT11 invoice is required.');
    }

    try {
      let paymentData;
      if (provider.provider === 'lnbits') {
        paymentData = await paymentService.payInvoice(user, provider, bolt11, LbtcTransaction);
      }
      

      if (paymentData) {
        res.status(200).json(paymentData);
      } else {
        res.status(500).send('Failed to pay invoice.');
      }
    } catch (error) {
      console.error('Error paying invoice:', error);
      res.status(500).send('Error paying invoice.');
    }
  });

  /**
   * Check Payment Status
   * GET /payments/checkPaymentStatus/:paymentId
   */
  router.get('/checkPaymentStatus/:paymentId', authMiddleware, async (req, res) => {
    const { paymentId } = req.params;
    const provider = req.provider;
    const user = req.user;

    if (!provider) {
      return res.status(400).send('Provider not specified or invalid.');
    }

    try {
      let paymentStatus;

      if (provider.provider === 'lnbits') {
        paymentStatus = await paymentService.checkPaymentStatus(user, provider, paymentId);
      }
      // Handle other providers here

      if (paymentStatus) {
        res.status(200).json(paymentStatus);
      } else {
        res.status(500).send('Failed to check payment status.');
      }
    } catch (error) {
      console.error('Error checking payment status:', error);
      res.status(500).send('Error checking payment status.');
    }
  });

  /**
   * Get Balance
   * GET /payments/balance
   */
  router.get('/balance', authMiddleware, async (req, res) => {
    const provider = req.provider;

    if (!provider) {
      return res.status(400).send('Provider not specified or invalid.');
    }

    try {
      const balance = await paymentService.getBalance(provider);

      if (balance !== null) {
        res.status(200).json({ balance });
      } else {
        res.status(500).send('Failed to retrieve balance.');
      }
    } catch (error) {
      console.error('Error fetching balance:', error);
      res.status(500).send('Error fetching balance.');
    }
  });

  /**
   * Get Transactions
   * GET /payments/transactions
   */
  router.get('/transactions', authMiddleware, async (req, res) => {
    const provider = req.provider;
    const user = req.user;

    if (!provider) {
      return res.status(400).send('Provider not specified or invalid.');
    }

    try {
      const transactions = await paymentService.getTransactions(user, provider, LbtcTransaction);

      if (transactions) {
        res.status(200).json(transactions);
      } else {
        res.status(500).send('Failed to fetch transactions.');
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      res.status(500).send('Error fetching transactions.');
    }
  });

  return router;
};
