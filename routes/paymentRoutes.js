// routes/paymentRoutes.js

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const lnbitsPaymentService = require('../services/lnbitsPaymentService');
const opennodePaymentService = require('../services/opennodePaymentService');
const paymentService = require('../services/paymentService');

module.exports = (models) => {
  const { LbtcTransaction, OpennodeTransaction } = models;

  /**
   * Create Pay Link
   * POST /payments/createPayLink
   */
  router.post('/createPayLink', authMiddleware, async (req, res) => {
    const { amount, description } = req.body;
    const provider = req.provider;
    const user = req.user;

    if (!provider) {
      return res.status(400).send('No funding provider connected.');
    }

    try {
      let payLinkData;

      if (provider.provider === 'lnbits') {
        payLinkData = await lnbitsPaymentService.createPayLink(
          user,
          provider,
          amount,
          description,
          LbtcTransaction
        );
      } else if (provider.provider === 'opennode') {
        payLinkData = await opennodePaymentService.createPayLink(
          user,
          provider,
          amount,
          description,
          OpennodeTransaction
        );
      } else {
        return res.status(400).send('Unsupported provider.');
      }

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

    if (!provider) {
      return res.status(400).send('No funding provider connected.');
    }

    if (!bolt11) {
      return res.status(400).send('BOLT11 invoice is required.');
    }

    try {
      let paymentData;

      if (provider.provider === 'lnbits') {
        paymentData = await lnbitsPaymentService.payInvoice(
          user,
          provider,
          bolt11,
          LbtcTransaction
        );
      } else if (provider.provider === 'opennode') {
        paymentData = await opennodePaymentService.payInvoice(
          user,
          provider,
          bolt11,
          OpennodeTransaction
        );
      } else {
        return res.status(400).send('Unsupported provider.');
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
      return res.status(400).send('No funding provider connected.');
    }

    try {
      let paymentStatus;

      if (provider.provider === 'lnbits') {
        paymentStatus = await lnbitsPaymentService.checkPaymentStatus(
          provider,
          paymentId
        );
      } else if (provider.provider === 'opennode') {
        paymentStatus = await opennodePaymentService.checkPaymentStatus(
          provider,
          paymentId
        );
      } else {
        return res.status(400).send('Unsupported provider.');
      }

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
      return res.status(400).send('No funding provider connected.');
    }

    try {
      let balance;

      if (provider.provider === 'lnbits') {
        balance = await lnbitsPaymentService.getBalance(provider);
      } else if (provider.provider === 'opennode') {
        balance = await opennodePaymentService.getBalance(provider);
      } else {
        return res.status(400).send('Unsupported provider.');
      }

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
      return res.status(400).send('No funding provider connected.');
    }

    try {
      let transactions;

      if (provider.provider === 'lnbits') {
        transactions = await lnbitsPaymentService.getTransactions(
          user,
          provider,
          LbtcTransaction
        );
      } else if (provider.provider === 'opennode') {
        transactions = await opennodePaymentService.getTransactions(
          user,
          provider,
          OpennodeTransaction
        );
      } else {
        return res.status(400).send('Unsupported provider.');
      }

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
