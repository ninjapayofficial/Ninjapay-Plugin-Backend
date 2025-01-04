// plugins/risk-engine-plugin/routes/riskEngine.js
const express = require("express");
const router = express.Router();

/**
 * GET /transactions/anomalies?userId=XYZ
 *  1) Fetch user transactions (trades, deposits, withdraws)
 *  2) Run basic anomaly checks
 *  3) Return suspicious transactions
 */
router.get("/transactions/anomalies", async (req, res) => {
  const { userId } = req.query;
  if (!userId) {
    return res.status(400).json({ error: "Missing 'userId' query param." });
  }

  try {
    // =========================================
    // 1) Fetch transactions from DB or plugin
    // =========================================
    // For demonstration, let's mock it:
    const userTransactions = await mockFetchUserTransactions(userId);

    if (!userTransactions || userTransactions.length === 0) {
      return res.json({ anomalies: [], message: "No transactions found." });
    }

    // =========================================
    // 2) Basic anomaly detection
    //    2a) Rule-based checks
    //    2b) Statistical checks (optional)
    // =========================================
    const anomalies = detectAnomalies(userTransactions);

    return res.json({
      userId,
      totalTransactions: userTransactions.length,
      anomaliesCount: anomalies.length,
      anomalies,
    });
  } catch (err) {
    console.error("RiskEngine Error:", err);
    return res
      .status(500)
      .json({ error: "Failed to process risk engine checks" });
  }
});

/**
 * Example function that fetches transactions.
 * In production, you'd query your DB or call other plugin APIs.
 */
async function mockFetchUserTransactions(userId) {
  // Return a mock array of trade, deposit, withdraw
  // Timestamps are out of order just for demonstration
  return [
    {
      userId,
      type: "deposit", // or withdraw, trade
      amount: 5000,
      currency: "INR",
      timestamp: "2023-12-01T10:05:00Z",
    },
    {
      userId,
      type: "trade",
      amount: 25000,
      currency: "INR",
      timestamp: "2023-12-02T12:00:00Z",
    },
    {
      userId,
      type: "withdraw",
      amount: 1000000, // suspiciously large
      currency: "INR",
      timestamp: "2023-12-03T09:15:00Z",
    },
    {
      userId,
      type: "deposit",
      amount: 100,
      currency: "INR",
      timestamp: "2023-12-03T09:20:00Z",
    },
    {
      userId,
      type: "trade",
      amount: 100,
      currency: "INR",
      timestamp: "2023-12-03T09:25:00Z",
    },
    // ... More data ...
  ];
}

/**
 * Detect anomalies in a list of transactions.
 * - Basic rule-based checks: e.g. large deposit/withdraw
 * - Basic statistical approach (Z-score) if needed
 */
function detectAnomalies(transactions) {
  const anomalies = [];

  // 1) Large transaction rule (e.g., > 5,00,000)
  const LARGE_TX_THRESHOLD = 500000; // adjust to your business logic

  // 2) Frequency-based checks
  const FREQUENCY_WINDOW_MS = 5 * 60 * 1000; // 5 minutes
  // e.g. more than 3 transactions in 5 minutes => suspicious

  // 3) Optionally a Z-score approach across amounts
  const amounts = transactions.map((t) => t.amount);
  const mean = average(amounts);
  const stdDev = standardDeviation(amounts, mean);
  const zThreshold = 2.5; // e.g. 2.5 is suspicious

  // We’ll keep a sorted version for frequency checks
  const sortedTx = [...transactions].sort(
    (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
  );

  // Check each transaction
  for (let i = 0; i < sortedTx.length; i++) {
    const tx = sortedTx[i];
    // eslint-disable-next-line no-unused-vars
    const { amount, type } = tx;
    let flaggedReasons = [];

    // ---------- RULE 1: Large Tx ----------
    if (Math.abs(amount) > LARGE_TX_THRESHOLD) {
      flaggedReasons.push("Transaction amount exceeds threshold");
    }

    // ---------- RULE 2: High frequency in short window ----------
    // Look at how many transactions occurred in last 5 minutes
    let recentCount = 0;
    const txTime = new Date(tx.timestamp).getTime();
    // Scan backward
    for (let j = i - 1; j >= 0; j--) {
      const olderTxTime = new Date(sortedTx[j].timestamp).getTime();
      if (txTime - olderTxTime <= FREQUENCY_WINDOW_MS) {
        recentCount++;
      } else {
        break;
      }
    }
    if (recentCount >= 3) {
      flaggedReasons.push("High transaction frequency in short timeframe");
    }

    // ---------- RULE 3: Z-score on amounts ----------
    const zScore = stdDev === 0 ? 0 : (amount - mean) / stdDev;
    if (Math.abs(zScore) > zThreshold) {
      flaggedReasons.push(`Z-score outlier (z=${zScore.toFixed(2)})`);
    }

    // If any reasons flagged, push to anomalies
    if (flaggedReasons.length > 0) {
      anomalies.push({
        ...tx,
        flaggedReasons,
      });
    }
  }

  return anomalies;
}

/**
 * Helpers: average, standard deviation
 */
function average(array) {
  const sum = array.reduce((acc, val) => acc + val, 0);
  return sum / array.length;
}
function standardDeviation(array, mean) {
  const squareDiffs = array.map((val) => (val - mean) ** 2);
  const avgSquareDiff = average(squareDiffs);
  return Math.sqrt(avgSquareDiff);
}

module.exports = router;
