// routes/tradeRoutes.js
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const binanceTradeService = require("../services/binanceTradeService");

// If you have multiple trade services in the future, you could require them here
// and use conditional logic, similar to how paymentRoutes is structured.

router.use(authMiddleware);

/**
 * Place a trade (Buy/Sell)
 * POST /trade
 * Request body: { symbol: "BTCUSDT", side: "BUY" or "SELL", amount, price (optional), webhookUrl (optional) }
 */
router.post("/trade", authMiddleware, async (req, res) => {
  const provider = req.provider;
  const user = req.user;
  const { symbol, side, amount, price, webhookUrl } = req.body;

  if (!provider) {
    return res.status(400).send("No trade provider connected.");
  }

  if (provider.provider === "binance") {
    const result = await binanceTradeService.placeTrade(user, provider, symbol, side, amount, price, webhookUrl);
    if (result) return res.status(200).json(result);
    return res.status(500).send("Failed to place trade.");
  }

  return res.status(400).send("Unsupported provider.");
});

/**
 * Cancel a trade
 * POST /cancel-trade
 * Request body: { symbol: "BTCUSDT", orderId: "123456" }
 */
router.post("/cancel-trade", authMiddleware, async (req, res) => {
  const provider = req.provider;
  const user = req.user;
  const { symbol, orderId } = req.body;

  if (!provider) {
    return res.status(400).send("No trade provider connected.");
  }

  if (provider.provider === "binance") {
    const result = await binanceTradeService.cancelTrade(user, provider, symbol, orderId);
    if (result) return res.status(200).json(result);
    return res.status(500).send("Failed to cancel trade.");
  }

  return res.status(400).send("Unsupported provider.");
});

/**
 * Get profile/balance
 * GET /balance
 */
router.get("/balance", authMiddleware, async (req, res) => {
  const provider = req.provider;
  const user = req.user;

  if (!provider) {
    return res.status(400).send("No trade provider connected.");
  }

  if (provider.provider === "binance") {
    const profile = await binanceTradeService.getProfile(user, provider);
    if (profile) return res.status(200).json(profile);
    return res.status(500).send("Failed to retrieve profile.");
  }

  return res.status(400).send("Unsupported provider.");
});

/**
 * @route GET /trade/profile
 * @desc Get account profile and balances from Binance
 * @access Protected (requires authMiddleware)
 */
router.get('/profile', authMiddleware, async (req, res) => {
    const user = req.user;
    const provider = req.provider;
  
    if (!provider) {
      return res.status(400).json({ error: 'No funding provider connected.' });
    }
    if (provider.provider === "binance") {
    const profile = await binanceTradeService.getProfile(user, provider);
    if (profile) {
      res.json(profile);
    } else {
      res.status(500).json({ error: 'Failed to fetch profile from Binance.' });
    }
     }
  });

/**
 * Get holdings
 * GET /holdings
 */
router.get("/holdings", authMiddleware, async (req, res) => {
  const provider = req.provider;
  const user = req.user;

  if (!provider) {
    return res.status(400).send("No trade provider connected.");
  }

  if (provider.provider === "binance") {
    const holdings = await binanceTradeService.getHoldings(user, provider);
    if (holdings) return res.status(200).json(holdings);
    return res.status(500).send("Failed to fetch holdings.");
  }

  return res.status(400).send("Unsupported provider.");
});

/**
 * Get recent spot transactions (trade history)
 * GET /spot-transactions
 * Optional query param: symbol=BTCUSDT
 */
router.get("/spot-transactions", authMiddleware, async (req, res) => {
  const provider = req.provider;
  const user = req.user;
  const { symbol } = req.query;

  if (!provider) {
    return res.status(400).send("No trade provider connected.");
  }

  if (provider.provider === "binance") {
    const transactions = await binanceTradeService.getSpotTransactions(user, provider, symbol);
    if (transactions) return res.status(200).json(transactions);
    return res.status(500).send("Failed to fetch spot transactions.");
  }

  return res.status(400).send("Unsupported provider.");
});

/**
 * Get market data
 * GET /market
 * Optional query param: symbol=BTCUSDT
 */
router.get("/market", authMiddleware, async (req, res) => {
  const provider = req.provider;
  const user = req.user;
  const { symbol } = req.query;

  if (!provider) {
    return res.status(400).send("No trade provider connected.");
  }

  if (provider.provider === "binance") {
    const marketData = await binanceTradeService.getMarketData(user, provider, symbol);
    if (marketData) return res.status(200).json(marketData);
    return res.status(500).send("Failed to fetch market data.");
  }

  return res.status(400).send("Unsupported provider.");
});

module.exports = router;
