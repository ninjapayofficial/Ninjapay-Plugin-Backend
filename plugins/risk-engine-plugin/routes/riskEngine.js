/* eslint-disable no-unused-vars */
// plugins/risk-engine-plugin/routes/riskEngine.js
const express = require("express");
const router = express.Router();

/**
 * GET /transactions/anomalies?userId=XYZ
 *   - Gathers user profile & transaction data, then performs advanced checks:
 *     (1) User Profile (KYC, risk rating, account age)
 *     (2) Geolocation / IP changes
 *     (3) Device fingerprint collisions
 *     (4) Velocity checks
 *     (5) Historical pattern (compare to user’s own average)
 *     (6) AML watchlist
 *     (7) Peer comparisons
 */
router.get("/transactions/anomalies", async (req, res) => {
  const { userId } = req.query;
  if (!userId) {
    return res.status(400).json({ error: "Missing 'userId' query param." });
  }

  try {
    // 1) Fetch transactions for user
    const userTransactions = await mockFetchUserTransactions(userId);

    // 2) Fetch user profile
    const userProfile = await mockFetchUserProfile(userId);

    // 3) Fetch user login history (ip, device info)
    const loginHistory = await mockFetchUserLoginHistory(userId);

    // 4) Fetch AML / watchlists
    const watchlists = await mockFetchAMLWatchlists();

    // 5) Fetch peer data
    const peerData = await mockFetchPeerData(userProfile);

    if (!userTransactions || userTransactions.length === 0) {
      return res.json({
        anomalies: [],
        message: "No transactions found for this user.",
      });
    }

    // Run detection logic
    const anomalies = detectAnomalies(
      userTransactions,
      userProfile,
      loginHistory,
      watchlists,
      peerData,
    );

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
 * ------------
 * MOCK DATA FETCHERS
 * ------------
 * In production, replace with real DB queries / external calls.
 */

async function mockFetchUserTransactions(userId) {
  // Transaction types: deposit, withdraw, trade
  // Additional fields: currency, timestamp, location, deviceId, etc.
  return [
    {
      userId,
      type: "deposit",
      amount: 5000,
      currency: "INR",
      timestamp: "2023-12-01T10:05:00Z",
      ipAddress: "192.168.1.100",
      deviceId: "device-aaa",
    },
    {
      userId,
      type: "trade",
      amount: 25000,
      currency: "INR",
      timestamp: "2023-12-02T12:00:00Z",
      ipAddress: "192.168.1.101",
      deviceId: "device-bbb",
    },
    {
      userId,
      type: "withdraw",
      amount: 1000000, // suspiciously large
      currency: "INR",
      timestamp: "2023-12-03T09:15:00Z",
      ipAddress: "10.0.0.55", // potentially suspicious
      deviceId: "device-bbb",
    },
    {
      userId,
      type: "deposit",
      amount: 100,
      currency: "INR",
      timestamp: "2023-12-03T09:20:00Z",
      ipAddress: "192.168.1.101",
      deviceId: "device-bbb",
    },
    {
      userId,
      type: "trade",
      amount: 100,
      currency: "INR",
      timestamp: "2023-12-03T09:25:00Z",
      ipAddress: "192.168.1.101",
      deviceId: "device-bbb",
    },
    {
      userId,
      type: "withdraw",
      amount: 20000,
      currency: "INR",
      timestamp: "2023-12-03T09:27:00Z",
      ipAddress: "192.168.50.5", // new IP
      deviceId: "device-aaa", // old device
    },
  ];
}

async function mockFetchUserProfile(userId) {
  // E.g. from your Users table
  return {
    userId,
    kycStatus: "VERIFIED", // or 'UNVERIFIED'
    riskRating: 2, // 1 = low risk, 5 = high risk
    accountAgeDays: 120, // 120 days old
    region: "India",
    deviceIds: ["device-aaa", "device-bbb"], // devices associated with user
  };
}

async function mockFetchUserLoginHistory(userId) {
  // E.g. last 10 logins
  return [
    {
      userId,
      timestamp: "2023-12-01T10:00:00Z",
      ipAddress: "192.168.1.100",
      deviceId: "device-aaa",
      country: "India",
    },
    {
      userId,
      timestamp: "2023-12-02T11:50:00Z",
      ipAddress: "192.168.1.101",
      deviceId: "device-bbb",
      country: "India",
    },
    {
      userId,
      timestamp: "2023-12-03T09:10:00Z",
      ipAddress: "10.0.0.55",
      deviceId: "device-bbb",
      country: "SomeOtherCountry",
    },
    // ...
  ];
}

async function mockFetchAMLWatchlists() {
  return {
    blacklistedIPs: ["10.0.0.55", "123.45.67.89"],
    blacklistedDevices: ["device-xyz"],
    highRiskCountries: ["NorthKorea", "Iran", "SomeOtherCountry"],
  };
}

async function mockFetchPeerData(userProfile) {
  // Suppose we find average deposit/withdraw/trade amounts among peers with:
  //  - same region
  //  - similar account age
  //  - same KYC status
  // We just mock some stats:
  return {
    averageDeposit: 4000,
    averageWithdraw: 5000,
    averageTrade: 20000,
    depositStdDev: 1000,
    withdrawStdDev: 1500,
    tradeStdDev: 5000,
  };
}

/**
 * ------------
 * DETECTION LOGIC
 * ------------
 * We combine multiple checks:
 *   1) User profile checks (KYC, risk rating)
 *   2) Geolocation & IP checks
 *   3) Device fingerprint collisions
 *   4) Velocity checks
 *   5) Historical pattern vs. user's own transaction history
 *   6) AML watchlists
 *   7) Peer comparisons
 */
function detectAnomalies(
  transactions,
  userProfile,
  loginHistory,
  watchlists,
  peerData,
) {
  const anomalies = [];
  const {
    blacklistedIPs,
    blacklistedDevices,
    highRiskCountries,
  } = watchlists;

  // We’ll keep transactions sorted by time to do velocity checks
  const sortedTx = [...transactions].sort(
    (a, b) => new Date(a.timestamp) - new Date(b.timestamp),
  );

  // 1) Compute the user’s own historical average for each type
  const { userAvg, userStd } = computeUserHistoricalStats(sortedTx);

  // 2) For velocity checks, we pick a window
  const VELOCITY_WINDOW_MS = 5 * 60 * 1000; // e.g. 5 min window
  const MAX_TX_PER_5_MIN = 3; // example threshold

  // Large transaction threshold for quick rule-of-thumb
  const LARGE_TX_THRESHOLD = 500000; // e.g. 5 lakh

  for (let i = 0; i < sortedTx.length; i++) {
    const tx = sortedTx[i];
    const flaggedReasons = [];
    const txTime = new Date(tx.timestamp).getTime();

    // ============= (A) User Profile Checks =============
    // e.g. If KYC is UNVERIFIED but transaction is large
    if (
      userProfile.kycStatus !== "VERIFIED" &&
      Math.abs(tx.amount) > 50000
    ) {
      flaggedReasons.push("UNVERIFIED user with large transaction");
    }

    // If user risk rating is high (4 or 5), be extra cautious
    if (userProfile.riskRating >= 4 && Math.abs(tx.amount) > 20000) {
      flaggedReasons.push("High-risk user making large transaction");
    }

    // ============= (B) Geolocation / IP Checks =============
    //  e.g. if IP is blacklisted or from a high-risk country
    if (blacklistedIPs.includes(tx.ipAddress)) {
      flaggedReasons.push(`Transaction from blacklisted IP: ${tx.ipAddress}`);
    }
    // Cross-check country from loginHistory if timestamps are close
    const matchedLogin = loginHistory.find(
      (lh) =>
        lh.ipAddress === tx.ipAddress &&
        Math.abs(new Date(lh.timestamp).getTime() - txTime) < 30 * 60 * 1000,
    );
    if (matchedLogin && highRiskCountries.includes(matchedLogin.country)) {
      flaggedReasons.push(
        `Transaction from high-risk country: ${matchedLogin.country}`,
      );
    }

    // ============= (C) Device Fingerprint Checks =============
    //  e.g. device is blacklisted or not associated with user
    if (blacklistedDevices.includes(tx.deviceId)) {
      flaggedReasons.push(
        `Transaction from blacklisted device: ${tx.deviceId}`,
      );
    }
    // If device not in userProfile.deviceIds (unexpected device)
    if (!userProfile.deviceIds.includes(tx.deviceId)) {
      flaggedReasons.push(`Transaction from unrecognized device: ${tx.deviceId}`);
    }

    // ============= (D) Velocity Checks =============
    //  Count how many tx in last 5 min
    let recentCount = 1; // count current tx
    for (let j = i - 1; j >= 0; j--) {
      const olderTxTime = new Date(sortedTx[j].timestamp).getTime();
      if (txTime - olderTxTime <= VELOCITY_WINDOW_MS) {
        recentCount++;
      } else {
        break;
      }
    }
    if (recentCount > MAX_TX_PER_5_MIN) {
      flaggedReasons.push("High transaction frequency in 5-minute window");
    }

    // ============= (E) Historical Pattern (User’s Own Stats) =============
    const typeKey = tx.type; // deposit | withdraw | trade
    if (userAvg[typeKey] && userStd[typeKey]) {
      const mean = userAvg[typeKey];
      const stdDev = userStd[typeKey];
      const zScore = stdDev === 0 ? 0 : (tx.amount - mean) / stdDev;
      // For demonstration, threshold = 2.5
      if (Math.abs(zScore) > 2.5) {
        flaggedReasons.push(
          `User's transaction amount is outlier (z=${zScore.toFixed(2)}) vs. user history`,
        );
      }
    }

    // Quick large transaction rule-of-thumb
    if (Math.abs(tx.amount) > LARGE_TX_THRESHOLD) {
      flaggedReasons.push("Transaction amount exceeds quick threshold limit");
    }

    // ============= (F) AML Watchlists =============
    // We already checked blacklisted IP/device above.
    // Could also check user’s bank accounts or wallet addresses if we had them.
    // e.g. watchlists.blacklistedWallets.includes(tx.walletAddress)...

    // ============= (G) Peer Comparisons =============
    // Compare to average deposit/trade/withdraw among similar peers
    // For demonstration, we do a simple check if amount > mean + 3*stdDev
    if (peerData) {
      let peerMean, peerStdDev;
      if (tx.type === "deposit") {
        peerMean = peerData.averageDeposit;
        peerStdDev = peerData.depositStdDev;
      } else if (tx.type === "withdraw") {
        peerMean = peerData.averageWithdraw;
        peerStdDev = peerData.withdrawStdDev;
      } else if (tx.type === "trade") {
        peerMean = peerData.averageTrade;
        peerStdDev = peerData.tradeStdDev;
      }

      if (peerMean && peerStdDev) {
        const peerZ = (tx.amount - peerMean) / peerStdDev;
        if (peerZ > 3) {
          flaggedReasons.push(
            `Transaction significantly above peer average (z=${peerZ.toFixed(2)})`,
          );
        }
      }
    }

    // If any reasons flagged, record as anomaly
    if (flaggedReasons.length > 0) {
      anomalies.push({
        ...tx,
        flaggedReasons,
      });
    }
  } // end loop

  return anomalies;
}

/**
 * Compute user’s own average & stdDev per transaction type
 */
function computeUserHistoricalStats(transactions) {
  const sums = {};
  const counts = {};
  const userAvg = {};
  const userStd = {};

  // First pass: sum and count
  for (const tx of transactions) {
    const t = tx.type;
    if (!sums[t]) {
      sums[t] = 0;
      counts[t] = 0;
    }
    sums[t] += tx.amount;
    counts[t]++;
  }

  // Compute means
  for (const t of Object.keys(sums)) {
    userAvg[t] = sums[t] / counts[t];
  }

  // Second pass: compute variance
  const variances = {};
  for (const t of Object.keys(sums)) {
    variances[t] = 0;
  }
  for (const tx of transactions) {
    const t = tx.type;
    const diff = tx.amount - userAvg[t];
    variances[t] += diff * diff;
  }
  for (const t of Object.keys(variances)) {
    variances[t] = variances[t] / counts[t];
    userStd[t] = Math.sqrt(variances[t]);
  }

  return { userAvg, userStd };
}

module.exports = router;
