// // plugins/charts-plugin/views/main.js

// /* eslint-disable no-unused-vars */
// /* global LightweightCharts */
// document.addEventListener('DOMContentLoaded', async () => {
//     const { createChart, CrosshairMode, LineStyle, PriceScaleMode } = LightweightCharts;

//     // ========== DOM Elements ==========
//     const chartContainer = document.getElementById('chart-container');
//     const actionsDiv = document.getElementById('actions');
//     const ohlcInfoDiv = document.getElementById('ohlc-info');
//     const toolbar = document.getElementById('toolbar');
//     const drawingToolbar = document.getElementById('drawing-toolbar');

//     // Toolbar Buttons
//     const candleBtn = document.getElementById('candle-btn');
//     const lineBtn = document.getElementById('line-btn');
//     const areaBtn = document.getElementById('area-btn');
//     const drawBtn = document.getElementById('draw-btn');
//     const closeDrawBtn = document.getElementById('close-draw-btn');

//     // Detect symbol from URL (optional)
//     const pathSegments = window.location.pathname.split('/');
//     let symbol = pathSegments[pathSegments.length - 1] || null;

//     // ========== Fetch or Default Data ==========
//     let data;
//     if (symbol) {
//         try {
//             const response = await fetch(`/plugins/charts-plugin/api/data?symbol=${symbol}`);
//             if (!response.ok) {
//                 throw new Error('Network response was not ok');
//             }
//             data = await response.json();
//             if (!Array.isArray(data) || data.length === 0) {
//                 console.log('No data found for symbol:', symbol);
//                 data = [];
//             }
//         } catch (err) {
//             console.error('Error fetching data for symbol:', err);
//             data = [];
//         }
//     } else {
//         // Default dataset
//         data = [
//             { time: '2022-10-19', open: 100, high: 110, low: 95,  close: 105, volume: 5000 },
//             { time: '2022-10-20', open: 105, high: 112, low: 104, close: 110, volume: 7000 },
//             { time: '2022-10-21', open: 110, high: 115, low: 108, close: 112, volume: 6500 },
//             { time: '2022-10-22', open: 112, high: 120, low: 110, close: 119, volume: 10000 },
//             { time: '2022-10-23', open: 119, high: 121, low: 118, close: 120, volume: 8500 },
//             { time: '2022-10-24', open: 120, high: 125, low: 115, close: 122, volume: 12000 },
//             { time: '2022-10-25', open: 122, high: 123, low: 119, close: 121, volume: 9000 },
//             { time: '2022-10-26', open: 121, high: 130, low: 120, close: 128, volume: 15000 },
//             { time: '2022-10-27', open: 128, high: 135, low: 127, close: 133, volume: 17000 },
//             { time: '2022-10-28', open: 133, high: 140, low: 132, close: 138, volume: 20000 },
//         ];
//     }

//     // ========== Create Single Chart ==========
//     const chart = createChart(chartContainer, {
//         width: chartContainer.clientWidth,
//         height: 600,
//         layout: {
//             background: { color: '#0b0e11' },
//             textColor: '#e0e0e0',
//         },
//         timeScale: {
//             borderColor: '#2f3336',
//             barSpacing: 15,
//         },
//         rightPriceScale: {
//             borderColor: '#2f3336',
//         },
//         grid: {
//             vertLines: { color: '#2f3336', style: 1 },
//             horzLines: { color: '#2f3336', style: 1 },
//         },
//         crosshair: {
//             mode: CrosshairMode.Normal,
//             vertLine: { visible: true, style: LineStyle.Solid, width: 8, color: '#9194a3', labelVisible: true },
//             horzLine: { visible: true, style: 2, color: '#9194a3', labelVisible: false },
//         },
//     });

//     // ---- Price Scales & Regions ----
//     // 1) Candles on the default 'right' scale => top 70%
//     chart.priceScale('right').applyOptions({
//         scaleMargins: { top: 0, bottom: 0.3 }, // 0..70%
//         borderColor: '#2f3336',
//     });

//     // 2) Volume on 'my-overlay', also top 70%
//     chart.priceScale('my-overlay').applyOptions({
//         scaleMargins: { top: 0, bottom: 0.3 }, // 0..70%
//         borderColor: '#2f3336',
//         priceFormat: { type: 'volume' },
//     });

//     // 3) RSI scale => bottom 30% (70..100)
//     chart.priceScale('rsi').applyOptions({
//         scaleMargins: { top: 0.7, bottom: 0 }, // 70..100%
//         borderColor: '#f39c12',
//         autoScale: false,             // turn off auto-scaling
//         mode: PriceScaleMode.Normal,  // normal scale
//         alignLabels: false,           // don't align with main scale
//         labelOffset: 100,             // push RSI labels far right to avoid overlap
//     });

//     // ========== Track series so we can clear if needed ==========
//     let allSeries = [];
//     let horizontalLines = [];

//     // ========== Basic Series Helpers ==========
//     function addCandleSeries(data) {
//         const candleSeries = chart.addCandlestickSeries({
//             priceScaleId: 'right',
//             upColor: '#2DBD85',
//             downColor: '#F6465D',
//             borderDownColor: '#ef5350',
//             borderUpColor: '#26a69a',
//             wickDownColor: '#ef5350',
//             wickUpColor: '#26a69a',
//         });
//         candleSeries.setData(data);
//         allSeries.push(candleSeries);
//         return candleSeries;
//     }

//     function addVolumeSeries(data) {
//         const volumeSeries = chart.addHistogramSeries({
//             priceScaleId: 'my-overlay',
//         });
//         const volData = data.map(d => {
//             const color = d.close > d.open ? '#2DBD85' : '#F6465D';
//             return { time: d.time, value: d.volume, color };
//         });
//         volumeSeries.setData(volData);
//         allSeries.push(volumeSeries);
//     }

//     function calculateSMA(dataArr, length) {
//         const sma = [];
//         for (let i = 0; i < dataArr.length; i++) {
//             if (i < length - 1) {
//                 sma.push({ time: dataArr[i].time, value: null });
//             } else {
//                 const slice = dataArr.slice(i - length + 1, i + 1);
//                 const avg = slice.reduce((sum, d) => sum + d.close, 0) / length;
//                 sma.push({ time: dataArr[i].time, value: avg });
//             }
//         }
//         return sma;
//     }

//     function addSMASeries(data, length, color) {
//         const smaData = calculateSMA(data, length).filter(d => d.value !== null);
//         const smaSeries = chart.addLineSeries({
//             priceScaleId: 'right',
//             color,
//             lineWidth: 2,
//         });
//         smaSeries.setData(smaData);
//         allSeries.push(smaSeries);
//     }

//     // ========== RSI Calculation & Series (Force 0..100) ==========
//     function calculateRSI(data, period = 14) {
//         if (data.length < period) return [];
//         let gains = 0, losses = 0;
//         for (let i = 1; i <= period; i++) {
//             const change = data[i].close - data[i - 1].close;
//             if (change > 0) gains += change; else losses -= change;
//         }
//         let avgGain = gains / period;
//         let avgLoss = losses / period;
//         let rs = (avgLoss === 0) ? 100 : (avgGain / avgLoss);
//         const rsi = [{
//             time: data[period].time,
//             value: 100 - (100 / (1 + rs))
//         }];

//         for (let i = period + 1; i < data.length; i++) {
//             const change = data[i].close - data[i - 1].close;
//             if (change > 0) {
//                 avgGain = ((avgGain * (period - 1)) + change) / period;
//                 avgLoss = (avgLoss * (period - 1)) / period;
//             } else {
//                 avgGain = (avgGain * (period - 1)) / period;
//                 avgLoss = ((avgLoss * (period - 1)) - change) / period;
//             }
//             rs = (avgLoss === 0) ? 100 : (avgGain / avgLoss);
//             rsi.push({
//                 time: data[i].time,
//                 value: 100 - (100 / (1 + rs))
//             });
//         }
//         return rsi;
//     }

//     // Lock RSI scale to 0..100
//     function addRSISeries(data, period = 14, color = '#ff9900') {
//         const rsiData = calculateRSI(data, period);
//         const rsiSeries = chart.addLineSeries({
//             priceScaleId: 'rsi',
//             color,
//             lineWidth: 2,
//             autoscaleInfoProvider: () => ({
//                 priceRange: {
//                     minValue: 0,
//                     maxValue: 100,
//                 },
//             }),
//         });
//         rsiSeries.setData(rsiData);
//         allSeries.push(rsiSeries);

//         // Overbought & Oversold lines
//         addHorizontalLineToRSI(70, '#ff0000'); // Overbought
//         addHorizontalLineToRSI(30, '#00ff00'); // Oversold
//     }

//     function addHorizontalLineToRSI(value, color) {
//         if (!data.length) return;
//         const lineSeries = chart.addLineSeries({
//             priceScaleId: 'rsi',
//             color,
//             lineWidth: 1,
//             lineStyle: LineStyle.Dotted,
//             autoscaleInfoProvider: () => ({
//                 priceRange: { minValue: 0, maxValue: 100 },
//             }),
//         });
//         lineSeries.setData([
//             { time: data[0].time, value },
//             { time: data[data.length - 1].time, value },
//         ]);
//         allSeries.push(lineSeries);
//     }

//     // ========== Clear Series ==========
//     function clearAllSeries() {
//         for (const s of allSeries) {
//             chart.removeSeries(s);
//         }
//         allSeries = [];
//         for (const hl of horizontalLines) {
//             chart.removeSeries(hl);
//         }
//         horizontalLines = [];
//     }

//     // ========== Chart Type (candlestick, line, area) ==========
//     function setChartType(type) {
//         clearAllSeries();

//         if (type === 'candlestick') {
//             addCandleSeries(data);
//         } else if (type === 'line') {
//             const ls = chart.addLineSeries({
//                 priceScaleId: 'right',
//                 color: '#ffffff',
//                 lineWidth: 2,
//             });
//             ls.setData(data.map(d => ({ time: d.time, value: d.close })));
//             allSeries.push(ls);
//         } else if (type === 'area') {
//             const as = chart.addAreaSeries({
//                 priceScaleId: 'right',
//                 topColor: 'rgba(67,83,254,0.7)',
//                 bottomColor: 'rgba(67,83,254,0.3)',
//                 lineColor: 'rgba(67,83,254,1)',
//                 lineWidth: 2,
//             });
//             as.setData(data.map(d => ({ time: d.time, value: d.close })));
//             allSeries.push(as);
//         }

//         addVolumeSeries(data);
//         addSMASeries(data, 14, '#f1c40f');
//         addSMASeries(data, 7, '#9b59b6');
//         addSMASeries(data, 25, '#e74c3c');
//         addRSISeries(data, 14, '#ff9900');

//         adjustVisibleRange();
//     }

//     // ========== Initial Load ==========
//     let candleSeries = addCandleSeries(data);
//     addVolumeSeries(data);
//     addSMASeries(data, 14, '#f1c40f');
//     addSMASeries(data, 7, '#9b59b6');
//     addSMASeries(data, 25, '#e74c3c');
//     addRSISeries(data, 14, '#ff9900');

//     // Show latest ~80 bars
//     function adjustVisibleRange() {
//         const visibleBars = 80;
//         const totalBars = data.length;
//         if (totalBars > visibleBars) {
//             chart.timeScale().setVisibleLogicalRange({
//                 from: totalBars - visibleBars,
//                 to: totalBars,
//             });
//         } else {
//             chart.timeScale().fitContent();
//         }
//     }
//     adjustVisibleRange();

//     // ========== Resize Handling ==========
//     window.addEventListener('resize', () => {
//         chart.applyOptions({ width: chartContainer.clientWidth });
//     });

//     // ========== Crosshair Handling ==========
//     let latestPrice = data.length > 0 ? data[data.length - 1].close : null;

//     chart.subscribeCrosshairMove(param => {
//         if (!param.point) return;
//         const price = candleSeries.coordinateToPrice(param.point.y);
//         if (price === null || latestPrice === null) return;

//         let candle = null;
//         if (param.time) {
//             candle = data.find(d => d.time === param.time);
//         }
//         // % from latest
//         const percentChange = ((price - latestPrice) / latestPrice) * 100;
//         const sign = percentChange >= 0 ? '+' : '';
//         const formattedPC = `(${sign}${percentChange.toFixed(2)}%)`;
//         const percentColor = percentChange >= 0 ? '#16a085' : '#c0392b';

//         if (candle) {
//             ohlcInfoDiv.innerHTML = `
//                 <p><strong>${new Date(candle.time).toLocaleString()}</strong></p>
//                 <p>O: ${candle.open.toFixed(2)} H: ${candle.high.toFixed(2)} L: ${candle.low.toFixed(2)} C: ${candle.close.toFixed(2)}</p>
//                 <p>Vol: ${candle.volume}</p>
//             `;
//         } else {
//             ohlcInfoDiv.innerHTML = `
//                 <p>No candle data at this time</p>
//                 <p>Price (Y): ${price.toFixed(2)}</p>
//             `;
//         }
//         ohlcInfoDiv.style.display = 'block';

//         // Actions popup
//         actionsDiv.innerHTML = `
//             <div style="display: flex; align-items: center;"> 
//                 <button id="toggle-actions" style="
//                     background: #88a1ac; 
//                     color: #fff; 
//                     width: 18px; 
//                     height: 18px; 
//                     border-radius: 50%; 
//                     text-align: center; 
//                     padding: 0; 
//                     font-size: 12px;
//                     line-height: 18px;
//                     cursor: pointer;
//                     border: none;
//                 ">+</button>
//                 <div id="action-buttons" style="display: none; margin-left: 5px; flex-direction: column;">
//                     <button id="buy-button" style="margin-bottom: 5px; background: #16a085; color: #fff;">
//                         Buy at $${price.toFixed(2)}
//                     </button>
//                     <button id="sell-button" style="margin-bottom: 5px; background: #c0392b; color: #fff;">
//                         Sell at $${price.toFixed(2)}
//                     </button>
//                     <button id="draw-button" style="background: #2980b9; color: #fff;">
//                         Draw
//                     </button>
//                 </div>
//                 <p style="margin: 0; margin-left: 5px; font-size:10px; color: black;">
//                     ${price.toFixed(2)} <span style="color: ${percentColor};">${formattedPC}</span>
//                 </p>
//             </div>
//         `;

//         const toggleActionsBtn = document.getElementById('toggle-actions');
//         const actionButtonsDiv = document.getElementById('action-buttons');
//         if (toggleActionsBtn) {
//             toggleActionsBtn.onclick = () => {
//                 actionButtonsDiv.style.display =
//                     (actionButtonsDiv.style.display === 'none') ? 'flex' : 'none';
//             };
//         }

//         const buyButton = document.getElementById('buy-button');
//         const sellButton = document.getElementById('sell-button');
//         const drawButton = document.getElementById('draw-button');

//         if (buyButton) {
//             buyButton.onclick = () => alert(`Buy at $${price.toFixed(2)}`);
//         }
//         if (sellButton) {
//             sellButton.onclick = () => alert(`Sell at $${price.toFixed(2)}`);
//         }
//         if (drawButton) {
//             drawButton.onclick = () => {
//                 if (!data.length) return;
//                 const lineSeries = chart.addLineSeries({
//                     priceScaleId: 'right',
//                     color: '#ffffff',
//                     lineWidth: 1,
//                 });
//                 // horizontal line => two points with same value
//                 const firstTime = data[0].time;
//                 const lastTime = data[data.length - 1].time;
//                 lineSeries.setData([
//                     { time: firstTime, value: price },
//                     { time: lastTime, value: price }
//                 ]);
//                 horizontalLines.push(lineSeries);
//                 alert(`Horizontal line drawn at $${price.toFixed(2)}`);
//             };
//         }

//         actionsDiv.style.display = 'block';

//         // Position the popup near the crosshair
//         const popupWidth = actionsDiv.offsetWidth;
//         const popupHeight = actionsDiv.offsetHeight;
//         const containerWidth = chartContainer.clientWidth;
//         const x = containerWidth - popupWidth - 10;
//         const y = param.point.y - (popupHeight / 2);

//         actionsDiv.style.left = `${x}px`;
//         actionsDiv.style.top = `${y}px`;
//     });

//     // Add small instructions text
//     const instructions = document.createElement('div');
//     instructions.style.position = 'absolute';
//     instructions.style.top = '10px';
//     instructions.style.right = '10px';
//     instructions.style.color = '#aaa';
//     instructions.style.fontSize = '12px';
//     instructions.innerHTML = 'Scroll to zoom, drag to pan';
//     chartContainer.appendChild(instructions);

//     // ========== Chart Type Buttons ==========
//     candleBtn.addEventListener('click', () => setChartType('candlestick'));
//     lineBtn.addEventListener('click', () => setChartType('line'));
//     areaBtn.addEventListener('click', () => setChartType('area'));

//     // ========== Drawing Mode Setup ==========
//     const drawingCanvas = document.createElement('canvas');
//     drawingCanvas.style.position = 'absolute';
//     drawingCanvas.style.top = '0';
//     drawingCanvas.style.left = '0';
//     drawingCanvas.style.width = '100%';
//     drawingCanvas.style.height = '100%';
//     drawingCanvas.style.zIndex = '10';
//     drawingCanvas.style.pointerEvents = 'none';
//     chartContainer.appendChild(drawingCanvas);

//     function resizeCanvas() {
//         drawingCanvas.width = chartContainer.clientWidth;
//         drawingCanvas.height = chartContainer.clientHeight;
//     }
//     resizeCanvas();
//     window.addEventListener('resize', resizeCanvas);

//     const ctx = drawingCanvas.getContext('2d');
//     let isDrawing = false;
//     let lastX = 0;
//     let lastY = 0;
//     let isDrawingMode = false;

//     // Enable drawing mode
//     drawBtn.addEventListener('click', () => {
//         if (isDrawingMode) return;
//         isDrawingMode = true;
//         drawingCanvas.style.pointerEvents = 'auto';
//         chartContainer.classList.add('chart-drawing-mode');
//         drawingToolbar.style.display = 'block';
//     });

//     // Close drawing mode
//     closeDrawBtn.addEventListener('click', () => {
//         if (!isDrawingMode) return;
//         isDrawingMode = false;
//         drawingCanvas.style.pointerEvents = 'none';
//         chartContainer.classList.remove('chart-drawing-mode');
//         drawingToolbar.style.display = 'none';
//         ctx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
//     });

//     // Drawing events
//     drawingCanvas.addEventListener('mousedown', (e) => {
//         if (!isDrawingMode) return;
//         isDrawing = true;
//         const rect = drawingCanvas.getBoundingClientRect();
//         lastX = e.clientX - rect.left;
//         lastY = e.clientY - rect.top;
//     });

//     drawingCanvas.addEventListener('mousemove', (e) => {
//         if (!isDrawing) return;
//         const rect = drawingCanvas.getBoundingClientRect();
//         const x = e.clientX - rect.left;
//         const y = e.clientY - rect.top;

//         ctx.strokeStyle = '#fff';
//         ctx.lineWidth = 2;
//         ctx.lineCap = 'round';
//         ctx.beginPath();
//         ctx.moveTo(lastX, lastY);
//         ctx.lineTo(x, y);
//         ctx.stroke();

//         lastX = x;
//         lastY = y;
//     });

//     drawingCanvas.addEventListener('mouseup', () => {
//         if (!isDrawingMode) return;
//         isDrawing = false;
//     });
//     drawingCanvas.addEventListener('mouseleave', () => {
//         if (!isDrawingMode) return;
//         isDrawing = false;
//     });

//     // ========== Symbol Loader Logic ==========
//     const loadSymbolBtn = document.getElementById('load-symbol');
//     const symbolInput = document.getElementById('symbol-input');

//     loadSymbolBtn.addEventListener('click', () => {
//         const newSymbol = symbolInput.value.trim();
//         if (!newSymbol) {
//             console.log("Please enter a symbol.");
//             return;
//         }
//         fetch(`/plugins/charts-plugin/api/data?symbol=${newSymbol}`)
//             .then(resp => resp.json())
//             .then(newData => {
//                 if (!Array.isArray(newData) || newData.length === 0) {
//                     console.log("No data for that symbol.");
//                     return;
//                 }
//                 data = newData;
//                 clearAllSeries();
//                 candleSeries = addCandleSeries(data);
//                 addVolumeSeries(data);
//                 addSMASeries(data, 14, '#f1c40f');
//                 addSMASeries(data, 7, '#9b59b6');
//                 addSMASeries(data, 25, '#e74c3c');
//                 addRSISeries(data, 14, '#ff9900');
//                 latestPrice = data[data.length - 1].close;
//                 adjustVisibleRange();
//             })
//             .catch(err => console.error('Error fetching data:', err));
//     });
// });

