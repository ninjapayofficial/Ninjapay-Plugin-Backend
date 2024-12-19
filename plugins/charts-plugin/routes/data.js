
// plugins/charts-plugin/routes/data.js

const express = require("express");
// eslint-disable-next-line no-unused-vars
const fetch = require("node-fetch");

const router = express.Router();


// Dummy route for now!
// router.get("/data", async (req, res) => {
//     const symbol = req.query.symbol;
//     if (!symbol) {
//       return res.status(400).json({ error: "No symbol provided" });
//     }

//     // TODO: Fetch data for the given symbol. For example:
//     // You could fetch from a financial API or your database.
//     // For now, let's return some dummy data similar to your static one.
//     const dummyData = [
//       { time: '2022-10-19', open: 150, high: 155, low: 148, close: 152, volume: 10000 },
//       { time: '2022-10-20', open: 152, high: 160, low: 151, close: 158, volume: 12000 },
//       // ... and so on
//     ];
//     res.json(dummyData);
//   });

// We’ll use daily candlesticks. Polygon’s Aggregates (Bars) endpoint:
// GET /v2/aggs/ticker/{ticker}/range/{multiplier}/{timespan}/{from}/{to}

router.get("/data", async (req, res) => {
  const symbol = req.query.symbol;
  if (!symbol) {
    return res.status(400).json({ error: "No symbol provided" });
  }

  const apiKey = process.env.POLYGON_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Polygon API key not configured" });
  }

  // Set a default date range (e.g., last 30 days). You can customize this.
  const now = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 30);

  // Format dates as YYYY-MM-DD for Polygon
  const formatDate = (d) => d.toISOString().split('T')[0];

  const url = `https://api.polygon.io/v2/aggs/ticker/${symbol.toUpperCase()}/range/1/day/${formatDate(from)}/${formatDate(now)}?adjusted=true&sort=asc&limit=120&apiKey=${apiKey}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).json({ error: text });
    }

    const data = await response.json();
    console.log(data);
    if (!data.results || data.results.length === 0) {
      return res.json([]); // No data, return empty array
    }

    // Polygon aggregate bar format:
    // {
    //   "v": 31501, // Volume
    //   "vw": 237.35, // Volume Weighted Average Price
    //   "o": 237.25, // Open Price
    //   "c": 238.00, // Close Price
    //   "h": 238.50, // High Price
    //   "l": 236.75, // Low Price
    //   "t": 1637174400000, // Timestamp in ms
    //   "n": 15 // number of trades
    // }

    // Convert Polygon data to Lightweight Charts format:
    // { time: 'YYYY-MM-DD', open, high, low, close, volume }
    const results = data.results.map(bar => {
      const date = new Date(bar.t);
      const isoDate = date.toISOString().split("T")[0]; 
      return {
        time: isoDate,
        open: bar.o,
        high: bar.h,
        low: bar.l,
        close: bar.c,
        volume: bar.v
      };
    });

    res.json(results);
    console.log("lightweight:", results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch data from Polygon" });
  }
});

module.exports = router;
