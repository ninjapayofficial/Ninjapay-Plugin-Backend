// services/binanceTradeService.js
const axios = require("axios");
const crypto = require("crypto");

// Utility to create Binance API signatures
function createBinanceSignature(queryString, secretKey) {
  return crypto.createHmac('sha256', secretKey).update(queryString).digest('hex');
}

/**
 * Place a trade (buy/sell) on Binance.
 * @param {Object} user - The user object from req.user.
 * @param {Object} provider - The provider object from req.provider (should contain API keys, etc.).
 * @param {String} symbol - The trading pair symbol (e.g., "BTCUSDT").
 * @param {String} side - "BUY" or "SELL".
 * @param {Number} quantity - The amount to buy/sell.
 * @param {Number} [price] - Optional price if using a limit order. If not provided, use MARKET order.
 * @param {String} [webhookUrl] - Optional webhook URL to notify on order completion.
 * @returns {Object|null} Trade order result or null on failure.
 */
// eslint-disable-next-line no-unused-vars
async function placeTrade(user, provider, symbol, side, quantity, price = null, webhookUrl = null) {
  try {
    const endpoint = "/api/v3/order";
    const timestamp = Date.now();
    const params = new URLSearchParams({
      symbol,
      side,
      type: price ? "LIMIT" : "MARKET",
      quantity,
      timestamp,
    });

    if (price) {
      params.append("price", price);
      params.append("timeInForce", "GTC");
    }

    const signature = createBinanceSignature(params.toString(), provider.secretApiKey);
    params.append("signature", signature);

    const headers = {
      "X-MBX-APIKEY": provider.apiKey,
    };

    const response = await axios.post(provider.baseUrl + endpoint, params, { headers });

    // If webhookUrl is provided, you might store this order data in your DB and use a background worker to notify webhook when filled.
    // For now, just return the order data:
    return response.data;
  } catch (error) {
    console.error("Error placing trade on Binance:", error.response ? error.response.data : error.message);
    return null;
  }
}

/**
 * Cancel an existing trade (open order).
 * @param {Object} user
 * @param {Object} provider
 * @param {String} symbol
 * @param {String|Number} orderId
 * @returns {Object|null}
 */
async function cancelTrade(user, provider, symbol, orderId) {
  try {
    const endpoint = "/api/v3/order";
    const timestamp = Date.now();
    const params = new URLSearchParams({
      symbol,
      orderId,
      timestamp,
    });

    const signature = createBinanceSignature(params.toString(), provider.secretApiKey);
    params.append("signature", signature);

    const headers = {
      "X-MBX-APIKEY": provider.apiKey,
    };

    const response = await axios.delete(provider.baseUrl + endpoint, { headers, params });
    return response.data;
  } catch (error) {
    console.error("Error canceling Binance order:", error.response ? error.response.data : error.message);
    return null;
  }
}

/**
 * Get account balances/profile info
 * @param {Object} user
 * @param {Object} provider
 * @returns {Object|null} Account info including balances.
 */
async function getProfile(user, provider) {
  try {
    const endpoint = "/api/v3/account";
    const timestamp = Date.now();
    const params = new URLSearchParams({
      timestamp,
    });

    const signature = createBinanceSignature(params.toString(), provider.secretApiKey);
    params.append("signature", signature);

    const headers = {
      "X-MBX-APIKEY": provider.apiKey,
    };

    const response = await axios.get(provider.baseUrl + endpoint, { headers, params });
    return response.data;
  } catch (error) {
    console.error("Error fetching Binance profile:", error.response ? error.response.data : error.message);
    return null;
  }
}

/**
 * Get user holdings (filtered balances).
 * @param {Object} user
 * @param {Object} provider
 * @returns {Array|null} Array of assets with non-zero balances.
 */
async function getHoldings(user, provider) {
  const profile = await getProfile(user, provider);
  if (!profile) return null;

  // Extract only balances with non-zero amount
  const holdings = profile.balances.filter(b => parseFloat(b.free) > 0 || parseFloat(b.locked) > 0);
  return holdings;
}

/**
 * Get recent spot transactions (trade history).
 * @param {Object} user
 * @param {Object} provider
 * @param {String} symbol - optional for NIN.Trade, if you want to filter by symbol, but for binance is mandatory!
 * @returns {Array|null}
 */
async function getSpotTransactions(user, provider, symbol = null) {
  try {
    const endpoint = "/api/v3/myTrades";
    const timestamp = Date.now();
    const params = new URLSearchParams({
      timestamp,
    });

    if (symbol) {
      params.append("symbol", symbol);
    }

    const signature = createBinanceSignature(params.toString(), provider.secretApiKey);
    params.append("signature", signature);

    const headers = {
      "X-MBX-APIKEY": provider.apiKey,
    };

    const response = await axios.get(provider.baseUrl + endpoint, { headers, params });
    return response.data;
  } catch (error) {
    console.error("Error fetching Binance trades:", error.response ? error.response.data : error.message);
    return null;
  }
}

/**
 * Get market data (prices, volume, etc.).
 * @param {Object} user
 * @param {Object} provider
 * @param {String} [symbol] Optional symbol to get ticker info for.
 * @returns {Object|null} Ticker price data or an array of tickers if no symbol provided.
 */
async function getMarketData(user, provider, symbol = null) {
  try {
    let endpoint = "/api/v3/ticker/24hr";
    const params = {};
    if (symbol) {
      params.symbol = symbol;
    }
    const response = await axios.get(provider.baseUrl + endpoint, { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching Binance market data:", error.response ? error.response.data : error.message);
    return null;
  }
}

module.exports = {
  placeTrade,
  cancelTrade,
  getProfile,
  getHoldings,
  getSpotTransactions,
  getMarketData,
};
