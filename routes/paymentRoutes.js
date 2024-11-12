// routes/paymentRoutes.js

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const axios = require('axios');

// Create Pay Link
router.post('/createPayLink', authMiddleware, async (req, res) => {
  const { amount, description } = req.body;
  const provider = req.provider;

  if (!provider) {
    return res.status(400).send('Provider not specified or invalid.');
  }

  try {
    let payLinkData;

    if (provider.provider === 'lnbits') {
      payLinkData = await createLNbitsPayLink(provider, amount, description);
    }
    // Handle other providers

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

// Check Payment Status
router.get('/checkPaymentStatus/:paymentId', authMiddleware, async (req, res) => {
  const { paymentId } = req.params;
  const provider = req.provider;

  if (!provider) {
    return res.status(400).send('Provider not specified or invalid.');
  }

  try {
    let paymentStatus;

    if (provider.provider === 'lnbits') {
      paymentStatus = await checkLNbitsPaymentStatus(provider, paymentId);
    }
    // Handle other providers

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



async function createLNbitsPayLink(provider, amount, description) {
    try {
      const url = `${provider.instanceUrl}/api/v1/payments`;
      const data = {
        out: false,
        amount: amount,
        memo: description,
      };
      const headers = {
        'X-Api-Key': provider.invoiceKey, // Use user's decrypted LNbits invoice key
        'Content-Type': 'application/json',
      };
      const response = await axios.post(url, data, { headers });
  
      if (response.status === 201 || response.status === 200) {
        return response.data;
      } else {
        console.error('Failed to create LNbits pay link:', response.statusText);
        return null;
      }
    } catch (error) {
      console.error('Error creating LNbits pay link:', error);
      return null;
    }
  }
  
  async function checkLNbitsPaymentStatus(provider, paymentId) {
    try {
      const url = `${provider.instanceUrl}/api/v1/payments/${paymentId}`;
      const headers = {
        'X-Api-Key': provider.invoiceKey, // Use user's decrypted LNbits invoice key
        'Content-Type': 'application/json',
      };
      const response = await axios.get(url, { headers });
  
      if (response.status === 200) {
        return response.data;
      } else {
        console.error('Failed to check LNbits payment status:', response.statusText);
        return null;
      }
    } catch (error) {
      console.error('Error checking LNbits payment status:', error);
      return null;
    }
  }
  

module.exports = router;
