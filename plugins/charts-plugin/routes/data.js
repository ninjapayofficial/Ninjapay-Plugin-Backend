const express = require("express");
const fetch = require("node-fetch");

const router = express.Router();

// We’ll use daily candlesticks. Polygon’s Aggregates (Bars) endpoint:
// GET /v2/aggs/ticker/{ticker}/range/{multiplier}/{timespan}/{from}/{to}

router.get("/data", async (req, res) => {
  const symbol = req.query.symbol;
  if (!symbol) {
    return res.status(400).json({ error: "No symbol provided" });
  }

  // eslint-disable-next-line no-undef
  const apiKey = process.env.POLYGON_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Polygon API key not configured" });
  }

  // Set a default date range (e.g., last 180 days). You can customize this.
  const now = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 180);

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

    

    // Return the HTML to HTMX to update the chart container
    res.json(results)
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch data from Polygon" });
  }
});

// router.get("/data-symbol", async (req, res) => {
//   const symbol = req.query.symbol;
//   if (!symbol) {
//     return res.status(400).json({ error: "No symbol provided" });
//   }

//   // eslint-disable-next-line no-undef
//   const apiKey = process.env.POLYGON_API_KEY;
//   if (!apiKey) {
//     return res.status(500).json({ error: "Polygon API key not configured" });
//   }

//   // Set a default date range (e.g., last 180 days). You can customize this.
//   const now = new Date();
//   const from = new Date();
//   from.setDate(from.getDate() - 180);

//   // Format dates as YYYY-MM-DD for Polygon
//   const formatDate = (d) => d.toISOString().split('T')[0];

//   const url = `https://api.polygon.io/v2/aggs/ticker/${symbol.toUpperCase()}/range/1/day/${formatDate(from)}/${formatDate(now)}?adjusted=true&sort=asc&limit=120&apiKey=${apiKey}`;

//   try {
//     const response = await fetch(url);
//     if (!response.ok) {
//       const text = await response.text();
//       return res.status(response.status).json({ error: text });
//     }

//     const data = await response.json();
//     if (!data.results || data.results.length === 0) {
//       return res.json([]); // No data, return empty array
//     }

//     // Polygon aggregate bar format:
//     // {
//     //   "v": 31501, // Volume
//     //   "vw": 237.35, // Volume Weighted Average Price
//     //   "o": 237.25, // Open Price
//     //   "c": 238.00, // Close Price
//     //   "h": 238.50, // High Price
//     //   "l": 236.75, // Low Price
//     //   "t": 1637174400000, // Timestamp in ms
//     //   "n": 15 // number of trades
//     // }

//     // Convert Polygon data to Lightweight Charts format:
//     // { time: 'YYYY-MM-DD', open, high, low, close, volume }
//     const results = data.results.map(bar => {
//       const date = new Date(bar.t);
//       const isoDate = date.toISOString().split("T")[0];
//       return {
//         time: isoDate,
//         open: bar.o,
//         high: bar.h,
//         low: bar.l,
//         close: bar.c,
//         volume: bar.v
//       };
//     });

//     // Render the HTML for the chart with updated data
//     const chartHtml = generateChartHtml(results); // Generate HTML for the updated chart

//     // Return the HTML to HTMX to update the chart container
//     res.send(chartHtml);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Failed to fetch data from Polygon" });
//   }
// });

// // Function to generate the chart HTML
// function generateChartHtml(data) {
//   return `
//     <div id="chart-container" style="position: relative; width: 100%; height: 600px;"></div>
//     <script>
//         const chartContainer = document.getElementById('chart-container');
//         const chart = LightweightCharts.createChart(chartContainer, {
//             width: chartContainer.clientWidth,
//             height: 600,
//             layout: {
//                 background: {
//                     color: '#0b0e11'
//                 },
//                 textColor: '#e0e0e0',
//             },
//             timeScale: {
//                 borderColor: '#2f3336',
//                 barSpacing: 15
//             },
//             rightPriceScale: {
//                 borderColor: '#2f3336',
//             },
//             grid: {
//                 vertLines: { color: '#2f3336', style: 1 },
//                 horzLines: { color: '#2f3336', style: 1 },
//             },
//             crosshair: {
//                 mode: CrosshairMode.Normal,
//                 vertLine: { visible: true, style: 2, color: '#9194a3', labelVisible: false },
//                 horzLine: { visible: true, style: 2, color: '#9194a3', labelVisible: false },
//             },
//         });

//         const series = chart.addCandlestickSeries();
//         series.setData(${JSON.stringify(data)});
//     </script>
//   `;
// }

// module.exports = router;
