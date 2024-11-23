// services/lnbitsPaymentService.js

const axios = require('axios');

/**
 * Creates a payment link using the specified provider.
 * @param {Object} provider - Provider details.
 * @param {number} amount - Amount in sats.
 * @param {string} description - Description/memo for the invoice.
 * @param {Object} LbtcTransaction - Sequelize Transaction model.
 * @returns {Object|null} - Payment link data or null on failure.
 */
async function createPayLink(user, provider, amount, description, LbtcTransaction) {
  try {
    if (provider.provider === 'lnbits') {
      const url = `${provider.instanceUrl}/api/v1/payments`;
      const data = {
        out: false,
        amount,
        memo: description,
      };
      const headers = {
        'X-Api-Key': provider.invoiceKey, // Use provider-specific invoice key
        'Content-Type': 'application/json',
      };
      const response = await axios.post(url, data, { headers });

      if (response.status === 201 || response.status === 200) {
        const { payment_request, payment_hash } = response.data;

        // Store the transaction
        await LbtcTransaction.create({
          userId: user.uid, // Assuming user includes userId
          txid: payment_hash,
          amount,
          description,
          invoiceKeyUsed: provider.providerInvoiceKey,
          walletId: provider.walletId || null,
        });

        return { payment_request, payment_hash };
      } else {
        console.error('Failed to create LNbits pay link:', response.statusText);
        return null;
      }
    }

    // Handle other providers here

    console.error('Unsupported provider:', provider.provider);
    return null;
  } catch (error) {
    console.error('Error creating pay link:', error.response ? error.response.data : error.message);
    return null;
  }
}

/**
 * Pays an invoice using the specified provider.
 * @param {Object} provider - Provider details.
 * @param {string} bolt11 - BOLT11 invoice string.
 * @param {Object} LbtcTransaction - Sequelize Transaction model.
 * @returns {Object|null} - Payment status data or null on failure.
 */
async function payInvoice(user, provider, bolt11, LbtcTransaction) {
  try {
    if (provider.provider === 'lnbits') {
      const url = `${provider.instanceUrl}/api/v1/payments`;
      const data = {
        out: true,
        bolt11,
      };
      const headers = {
        'X-Api-Key': provider.adminKey, // Use provider-specific admin key
        'Content-Type': 'application/json',
      };
      const response = await axios.post(url, data, { headers });

      if (response.status === 201 || response.status === 200) {
        const { payment_hash } = response.data;

        // Store the transaction
        await LbtcTransaction.create({
          userId: user.uid, // Assuming provider includes userId
          txid: payment_hash,
          amount: null, // Optionally, fetch from invoice details
          description: 'Payment made',
          invoiceKeyUsed: provider.providerAdminKey,
          walletId: provider.walletId || null,
        });

        return { payment_hash };
      } else {
        console.error('Failed to pay LNbits invoice:', response.statusText);
        return null;
      }
    }

    // Handle other providers here

    console.error('Unsupported provider:', provider.provider, user.userId);
    console.log(provider.provider);
    return null;
  } catch (error) {
    console.error('Error paying invoice:', error.response ? error.response.data : error.message);
    return null;
  }
}

/**
 * Checks the status of a payment using the specified provider.
 * @param {Object} provider - Provider details.
 * @param {string} paymentId - Payment hash or ID.
 * @returns {Object|null} - Payment status data or null on failure.
 */
async function checkPaymentStatus(provider, paymentId) {
  try {
    if (provider.provider === 'lnbits') {
      const url = `${provider.instanceUrl}/api/v1/payments/${paymentId}`;
      const headers = {
        'X-Api-Key': provider.invoiceKey, // Use provider-specific invoice key
        'Content-Type': 'application/json',
      };
      const response = await axios.get(url, { headers });

      if (response.status === 200) {
        return response.data;
      } else {
        console.error('Failed to check LNbits payment status:', response.statusText);
        return null;
      }
    }

    // Handle other providers here

    console.error('Unsupported provider:', provider.provider);
    return null;
  } catch (error) {
    console.error('Error checking payment status:', error.response ? error.response.data : error.message);
    return null;
  }
}

/**
 * Retrieves the wallet balance using the specified provider.
 * @param {Object} provider - Provider details.
 * @returns {number|null} - Balance in sats or null on failure.
 */
async function getBalance(provider) {
  try {
    if (provider.provider === 'lnbits') {
      const url = `${provider.instanceUrl}/api/v1/wallet`;
      const headers = {
        'X-Api-Key': provider.invoiceKey, // Use provider-specific invoice key
        'Content-Type': 'application/json',
      };
      const response = await axios.get(url, { headers });

      if (response.status === 200) {
        return  Math.floor(parseFloat(response.data.balance) * 0.001);
      } else {
        console.error('Failed to fetch LNbits balance:', response.statusText);
        return null;
      }
    }

    // Handle other providers here

    console.error('Unsupported provider:', provider.provider);
    return null;
  } catch (error) {
    console.error('Error fetching balance:', error.response ? error.response.data : error.message);
    return null;
  }
}

/**
 * Retrieves transaction history using the specified provider.
 * @param {Object} provider - Provider details.
 * @param {Object} LbtcTransaction - Sequelize Transaction model.
 * @returns {Array|null} - Array of transactions or null on failure.
 */
async function getTransactions(user, provider, LbtcTransaction) {
  try {
    // Since transactions are stored in your own database, fetch from there
    const transactions = await LbtcTransaction.findAll({
      where: { userId: user.uid },
      order: [['createdAt', 'DESC']],
    });
    return transactions;
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return null;
  }
}

module.exports = {
  createPayLink,
  payInvoice,
  checkPaymentStatus,
  getBalance,
  getTransactions,
};
