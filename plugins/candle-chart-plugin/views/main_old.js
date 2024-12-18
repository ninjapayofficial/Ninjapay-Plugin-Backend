// /* global LightweightCharts */
// // plugins/candle-chart-plugin/views/index.js
// // Ensure the file name here matches the one referenced in your HTML script tag.
// // Assuming your HTML is `<script src="main.js"></script>`, call this file `main.js`.
// document.addEventListener('DOMContentLoaded', () => {
//     const { createChart } = LightweightCharts;
//     const chartContainer = document.getElementById('chart-container');
//     const actionsDiv = document.getElementById('actions');

//     // Enable pointer events so popup can be interacted with
//     actionsDiv.style.pointerEvents = 'auto';

//     let isHoveringPopup = false;

//     // Track when the mouse enters/leaves the popup
//     actionsDiv.addEventListener('mouseenter', () => {
//         isHoveringPopup = true;
//     });
//     actionsDiv.addEventListener('mouseleave', () => {
//         isHoveringPopup = false;
//         // If not over chart and not over popup, hide popup
//         if (!lastParamPoint && !isHoveringPopup) {
//             actionsDiv.style.display = 'none';
//         }
//     });

//     const chart = createChart(chartContainer, {
//         width: chartContainer.clientWidth,
//         height: 400,
//         layout: {
//             backgroundColor: '#ffffff',
//             textColor: '#333333',
//         },
//         timeScale: {
//             borderColor: '#D1D4DC',
//         },
//         rightPriceScale: {
//             borderColor: '#D1D4DC',
//         },
//     });

//     const candleSeries = chart.addCandlestickSeries();

//     const data = [
//         { time: '2022-10-19', open: 100, high: 110, low: 95, close: 105 },
//         { time: '2022-10-20', open: 105, high: 112, low: 104, close: 110 },
//         { time: '2022-10-21', open: 110, high: 115, low: 108, close: 112 },
//         { time: '2022-10-22', open: 112, high: 120, low: 110, close: 119 },
//         { time: '2022-10-23', open: 119, high: 121, low: 118, close: 120 },
//     ];

//     candleSeries.setData(data);

//     window.addEventListener('resize', () => {
//         chart.applyOptions({ width: chartContainer.clientWidth });
//     });

//     let lastParamPoint = null;

//     chart.subscribeCrosshairMove(param => {
//         // Update the lastParamPoint to know if mouse is over chart
//         lastParamPoint = param.point;

//         // If mouse not over chart and not over popup, hide it
//         if (!param.point && !isHoveringPopup) {
//             actionsDiv.style.display = 'none';
//             return;
//         }

//         // If mouse not over chart but over popup, do nothing (keep popup visible)
//         if (!param.point && isHoveringPopup) {
//             return;
//         }

//         // Mouse is over the chart
//         const price = candleSeries.coordinateToPrice(param.point.y);
//         if (price === null) {
//             // No valid price at this Y coordinate
//             if (!isHoveringPopup) {
//                 actionsDiv.style.display = 'none';
//             }
//             return;
//         }

//         // Update popup content
//         actionsDiv.innerHTML = `
//             <p>Price: ${price.toFixed(2)}</p>
//             <button id="buy-button">Buy</button>
//             <button id="sell-button">Sell</button>
//         `;

//         const buyButton = document.getElementById('buy-button');
//         const sellButton = document.getElementById('sell-button');

//         buyButton.addEventListener('click', () => {
//             alert('Buy at ' + price);
//         });

//         sellButton.addEventListener('click', () => {
//             alert('Sell at ' + price);
//         });

//         // Position popup anchored near the right side
//         const chartRect = chartContainer.getBoundingClientRect();
//         const popupWidth = actionsDiv.offsetWidth;
//         const x = chartRect.right - popupWidth - 10; // 10px padding from right edge
//         const y = chartRect.top + param.point.y;

//         actionsDiv.style.top = (y + 10) + 'px';
//         actionsDiv.style.left = x + 'px';
//         actionsDiv.style.display = 'block';
//     });
// });
