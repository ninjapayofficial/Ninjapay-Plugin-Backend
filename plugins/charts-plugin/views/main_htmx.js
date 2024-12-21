// plugins/charts-plugin/views/main.js

/* eslint-disable no-unused-vars */
/* global LightweightCharts */
document.addEventListener('DOMContentLoaded', async () => {
    const { createChart, CrosshairMode } = LightweightCharts;
    const chartContainer = document.getElementById('chart-container');
    const actionsDiv = document.getElementById('actions');
    const ohlcInfoDiv = document.getElementById('ohlc-info');

    // Detect symbol from URL
    const pathSegments = window.location.pathname.split('/');
    let symbol = pathSegments[pathSegments.length - 1];
    if (!symbol) {
        symbol = null;
    }

    let data;
    if (symbol) {
        try {
            const response = await fetch(`/plugins/charts-plugin/api/data?symbol=${symbol}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            data = await response.json();
            // If no data returned, handle gracefully
            if (!Array.isArray(data) || data.length === 0) {
                console.log('No data found for symbol:', symbol);
                data = [];
            }
        } catch (err) {
            console.error('Error fetching data for symbol:', err);
            // Fallback to default data if needed
            data = [];
        }
    } else {
        // No symbol, use default data
        data = [
            { time: '2022-10-19', open: 100, high: 110, low: 95, close: 105, volume: 5000 },
            { time: '2022-10-20', open: 105, high: 112, low: 104, close: 110, volume: 7000 },
            { time: '2022-10-21', open: 110, high: 115, low: 108, close: 112, volume: 6500 },
            { time: '2022-10-22', open: 112, high: 120, low: 110, close: 119, volume: 10000 },
            { time: '2022-10-23', open: 119, high: 121, low: 118, close: 120, volume: 8500 },
            { time: '2022-10-24', open: 120, high: 125, low: 115, close: 122, volume: 12000 },
            { time: '2022-10-25', open: 122, high: 123, low: 119, close: 121, volume: 9000 },
            { time: '2022-10-26', open: 121, high: 130, low: 120, close: 128, volume: 15000 },
            { time: '2022-10-27', open: 128, high: 135, low: 127, close: 133, volume: 17000 },
            { time: '2022-10-28', open: 133, high: 140, low: 132, close: 138, volume: 20000 },
        ];
    }

    const chart = createChart(chartContainer, {
        width: chartContainer.clientWidth,
        height: 600,
        layout: {
            background: {
                color: '#0b0e11' // Dark background
            },
            textColor: '#e0e0e0',
        },
        timeScale: {
            borderColor: '#2f3336',
            barSpacing: 15, // Increase barSpacing to zoom in
            // Optional: Add more configurations as needed
        },
        rightPriceScale: {
            borderColor: '#2f3336',
        },
        grid: {
            vertLines: { color: '#2f3336', style: 1 },
            horzLines: { color: '#2f3336', style: 1 },
        },
        crosshair: {
            mode: CrosshairMode.Normal,
            vertLine: { visible: true, style: 2, color: '#9194a3', labelVisible: false },
            horzLine: { visible: true, style: 2, color: '#9194a3', labelVisible: false },
        },
    });

    // Keep track of all series here
    let allSeries = [];
    let horizontalLines = []; // store references to horizontal line series

    function addCandleSeries(data) {
        const s = chart.addCandlestickSeries({
            upColor: '#2DBD85',
            downColor: '#F6465D',
            borderDownColor: '#ef5350',
            borderUpColor: '#26a69a',
            wickDownColor: '#ef5350',
            wickUpColor: '#26a69a'
        });
        s.setData(data);
        allSeries.push(s);
        return s;
    }

    function addVolumeSeries(data) {
        const volumeSeries = chart.addHistogramSeries({
            priceScaleId: 'my-overlay'
        });
        const priceScale = chart.priceScale('my-overlay');
        priceScale.applyOptions({
            priceFormat: { type: 'volume' },
            priceScaleId: '',
            scaleMargins: { top: 0.8, bottom: 0 }
        });
        const volumeData = data.map(d => {
            const color = d.close > d.open ? '#2DBD85' : '#F6465D';
            return { time: d.time, value: d.volume, color: color };
        });
        volumeSeries.setData(volumeData);
        allSeries.push(volumeSeries);
    }

    function calculateSMA(dataArr, length) {
        const sma = [];
        for (let i = 0; i < dataArr.length; i++) {
            if (i < length - 1) {
                sma.push({ time: dataArr[i].time, value: null });
            } else {
                const slice = dataArr.slice(i - length + 1, i + 1);
                const avg = slice.reduce((sum, d) => sum + d.close, 0) / length;
                sma.push({ time: dataArr[i].time, value: avg });
            }
        }
        return sma;
    }

    function addSMASeries(data, length = 14, color) {
        const smaData = calculateSMA(data, length);
        const smaSeries = chart.addLineSeries({
            color: color,
            lineWidth: 2
        });
        smaSeries.setData(smaData);
        allSeries.push(smaSeries);
    }

    document.addEventListener("htmx:afterRequest", (event) => {
        if (event.detail.target.id === "chart-container") {
            try {
                // The response from HTMX will be in the event.detail.xhr.responseText
                const newData = event.detail.xhr.responseText ? JSON.parse(event.detail.xhr.responseText) : [];
     
                if (!Array.isArray(newData) || newData.length === 0) {
                    console.log("No data available for the selected symbol.");
                    return;
                }
    
                // Clear existing chart series
                clearAllSeries();
    
                // Add new candlestick series
                const candleSeries = chart.addCandlestickSeries({
                    upColor: "#26a69a",
                    downColor: "#ef5350",
                    borderUpColor: "#26a69a",
                    borderDownColor: "#ef5350",
                    wickUpColor: "#26a69a",
                    wickDownColor: "#ef5350",
                });
                candleSeries.setData(newData);
    
                // Add volume series
                addVolumeSeries(newData);
    
                // Add SMA series
                addSMASeries(newData, 14, "#f1c40f");
                addSMASeries(newData, 7, "#9b59b6");
                addSMASeries(newData, 25, "#e74c3c");
    
                // Adjust chart view
                chart.timeScale().fitContent();
                console.log("Chart updated successfully!");
            } catch (error) {
                console.error("Error processing response:", error);
            }
        }
    });
    
    
    
    
    

    // Initial load of series
    const candleSeries = addCandleSeries(data);
    addVolumeSeries(data);
    addSMASeries(data, 14, '#f1c40f');
    addSMASeries(data, 7, '#9b59b6');
    addSMASeries(data, 25, '#e74c3c');

    // Adjust the visible range to focus on the latest data
    const visibleBars = 50; // Number of recent bars to display
    const totalBars = data.length;

    if (totalBars > visibleBars) {
        chart.timeScale().setVisibleLogicalRange({
            from: totalBars - visibleBars,
            to: totalBars,
        });
    } else {
        chart.timeScale().fitContent(); // Fallback if data is less than visibleBars
    }

    window.addEventListener('resize', () => {
        chart.applyOptions({ width: chartContainer.clientWidth });
    });

    let currentCrosshairPrice = null;
    const latestPrice = data.length > 0 ? data[data.length - 1].close : null;

    chart.subscribeCrosshairMove(param => {
        if (!param.point) return;
        const price = candleSeries.coordinateToPrice(param.point.y);
        if (price === null || latestPrice === null) return;
        currentCrosshairPrice = price;

        let candle = null;
        if (param.time) {
            candle = data.find(d => d.time === param.time);
        }

        // Calculate percentage change
        const percentChange = ((price - latestPrice) / latestPrice) * 100;
        const formattedPercentChange = percentChange >= 0
            ? `(+${percentChange.toFixed(2)}%)`
            : `(${percentChange.toFixed(2)}%)`;

        // Determine color based on positive or negative change
        const percentColor = percentChange >= 0 ? '#16a085' : '#c0392b';

        if (candle) {
            ohlcInfoDiv.innerHTML = `
                <p><strong>${param.time}</strong></p>
                <p>O: ${candle.open.toFixed(2)} H: ${candle.high.toFixed(2)} L: ${candle.low.toFixed(2)} C: ${candle.close.toFixed(2)}</p>
                <p>Vol: ${candle.volume}</p>
            `;
        } else {
            ohlcInfoDiv.innerHTML = `
                <p>No candle data at this time</p>
                <p>Price (Y): ${price.toFixed(2)}</p>
            `;
        }
        ohlcInfoDiv.style.display = 'block';

        // **Updated Actions Popup with [+] Button Next to Price and Percentage**
        actionsDiv.innerHTML = `
            <div style="display: flex; align-items: center;"> 
                <button id="toggle-actions" style="
                    background: #88a1ac; 
                    color: #fff; 
                    width: 18px; 
                    height: 18px; 
                    border-radius: 50%; 
                    text-align: center; 
                    padding: 0; 
                    font-size: 12px;
                    line-height: 18px;
                    cursor: pointer;
                    border: none;
                ">+</button>
                <div id="action-buttons" style="display: none; margin-left: 5px; flex-direction: column;">
                    <button id="buy-button" style="margin-bottom: 5px; background: #16a085; color: #fff;">
                        Buy at $${price.toFixed(2)}
                    </button>
                    <button id="sell-button" style="margin-bottom: 5px; background: #c0392b; color: #fff;">
                        Sell at $${price.toFixed(2)}
                    </button>
                    <button id="draw-button" style="background: #2980b9; color: #fff;">
                        Draw
                    </button>
                </div>
                <p style="margin: 0; margin-left: 5px; font-size:10px; color: black;">
                    $${price.toFixed(2)} <span style="color: ${percentColor};">${formattedPercentChange}</span>
                </p>
            </div>
        `;

        // **Event Listener for [+] Button to Toggle Action Buttons**
        const toggleActionsBtn = document.getElementById('toggle-actions');
        const actionButtonsDiv = document.getElementById('action-buttons');

        if (toggleActionsBtn) {
            toggleActionsBtn.onclick = () => {
                if (actionButtonsDiv.style.display === 'none') {
                    actionButtonsDiv.style.display = 'flex';
                } else {
                    actionButtonsDiv.style.display = 'none';
                }
            };
        }

        // **Event Listeners for Buy, Sell, and Draw Buttons**
        const buyButton = document.getElementById('buy-button');
        const sellButton = document.getElementById('sell-button');
        const drawButton = document.getElementById('draw-button');

        if (buyButton) {
            buyButton.onclick = () => alert(`Buy at $${price.toFixed(2)}`);
        }

        if (sellButton) {
            sellButton.onclick = () => alert(`Sell at $${price.toFixed(2)}`);
        }

        if (drawButton) {
            drawButton.onclick = () => {
                if (data.length < 1) return;
                const lineSeries = chart.addLineSeries({
                    color: '#ffffff',
                    lineWidth: 1
                });
                // Create a horizontal line by setting two points at the same price
                const firstTime = data[0].time;
                const lastTime = data[data.length - 1].time;
                lineSeries.setData([
                    { time: firstTime, value: price },
                    { time: lastTime, value: price }
                ]);
                horizontalLines.push(lineSeries);
                alert(`Horizontal line drawn at $${price.toFixed(2)}`);
            };
        }

        actionsDiv.style.display = 'block';

        // **Position the Actions Popup**
        const popupWidth = actionsDiv.offsetWidth;
        const popupHeight = actionsDiv.offsetHeight;
        const containerWidth = chartContainer.clientWidth;
        const x = containerWidth - popupWidth - 10;
        const y = param.point.y - (popupHeight / 2);

        actionsDiv.style.left = `${x}px`;
        actionsDiv.style.top = `${y}px`;
    });

    const instructions = document.createElement('div');
    instructions.style.position = 'absolute';
    instructions.style.top = '10px';
    instructions.style.right = '10px';
    instructions.style.color = '#aaa';
    instructions.style.fontSize = '12px';
    instructions.innerHTML = 'Scroll to zoom, drag to pan';
    chartContainer.appendChild(instructions);

    const candleBtn = document.getElementById('candle-btn');
    const lineBtn = document.getElementById('line-btn');
    const areaBtn = document.getElementById('area-btn');

    function clearAllSeries() {
        // Remove each series
        for (let i = 0; i < allSeries.length; i++) {
            chart.removeSeries(allSeries[i]);
        }
        // Also remove horizontal lines
        for (let j = 0; j < horizontalLines.length; j++) {
            chart.removeSeries(horizontalLines[j]);
        }
        allSeries = [];
        horizontalLines = [];
    }

    function setChartType(type) {
        clearAllSeries(); // remove current series

        let mainSeries;
        if (type === 'candlestick') {
            mainSeries = chart.addCandlestickSeries({
                upColor: '#26a69a',
                downColor: '#ef5350',
                borderDownColor: '#ef5350',
                borderUpColor: '#26a69a',
                wickDownColor: '#ef5350',
                wickUpColor: '#26a69a'
            });
            mainSeries.setData(data);
            allSeries.push(mainSeries);
        } else if (type === 'line') {
            mainSeries = chart.addLineSeries({ color: '#ffffff', lineWidth: 2 });
            const lineData = data.map(d => ({ time: d.time, value: d.close }));
            mainSeries.setData(lineData);
            allSeries.push(mainSeries);
        } else if (type === 'area') {
            mainSeries = chart.addAreaSeries({ 
                topColor: 'rgba(67,83,254,0.7)', 
                bottomColor: 'rgba(67,83,254,0.3)', 
                lineColor: 'rgba(67,83,254,1)', 
                lineWidth: 2 
            });
            const areaData = data.map(d => ({ time: d.time, value: d.close }));
            mainSeries.setData(areaData);
            allSeries.push(mainSeries);
        }

        // Re-add volume
        const volumeSeries = chart.addHistogramSeries({
            priceScaleId: 'my-overlay'
        });
        const priceScale = chart.priceScale('my-overlay');
        priceScale.applyOptions({
            priceFormat: { type: 'volume' },
            priceScaleId: '',
            scaleMargins: { top: 0.8, bottom: 0 }
        });
        const volumeData = data.map(d => {
            const color = d.close > d.open ? '#26a69a' : '#ef5350';
            return { time: d.time, value: d.volume, color: color };
        });
        volumeSeries.setData(volumeData);
        allSeries.push(volumeSeries);

        // Re-add SMA
        addSMASeries(data, 14, '#f1c40f');
        addSMASeries(data, 7, '#9b59b6');
        addSMASeries(data, 25, '#e74c3c');

        // Adjust the visible range to focus on the latest data
        const visibleBars = 50; // Number of recent bars to display
        const totalBars = data.length;

        if (totalBars > visibleBars) {
            chart.timeScale().setVisibleLogicalRange({
                from: totalBars - visibleBars,
                to: totalBars,
            });
        } else {
            chart.timeScale().fitContent(); // Fallback if data is less than visibleBars
        }

        // Re-draw previously drawn horizontal lines if you want that persistence (not required)
        // In this example, we cleared them, so no re-draw.
    }  

    candleBtn.addEventListener('click', () => setChartType('candlestick'));
    lineBtn.addEventListener('click', () => setChartType('line'));
    areaBtn.addEventListener('click', () => setChartType('area'));

    // Simple Drawing Overlay (unchanged)
    const drawingCanvas = document.createElement('canvas');
    drawingCanvas.style.position = 'absolute';
    drawingCanvas.style.top = '0';
    drawingCanvas.style.left = '0';
    drawingCanvas.style.pointerEvents = 'none';
    chartContainer.appendChild(drawingCanvas);

    function resizeCanvas() {
        drawingCanvas.width = chartContainer.clientWidth;
        drawingCanvas.height = 600;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const ctx = drawingCanvas.getContext('2d');
    let isDrawing = false;
    let startX, startY;

    chartContainer.addEventListener('mousedown', (e) => {
        isDrawing = true;
        const rect = drawingCanvas.getBoundingClientRect();
        startX = e.clientX - rect.left;
        startY = e.clientY - rect.top;
    });

    chartContainer.addEventListener('mousemove', (e) => {
        if (!isDrawing) return;
        const rect = drawingCanvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        ctx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
        ctx.beginPath();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.moveTo(startX, startY);
        ctx.lineTo(x, y);
        ctx.stroke();
    });

    chartContainer.addEventListener('mouseup', () => {
        isDrawing = false;
    });

    // Symbol Loader Logic
    // document.getElementById('load-symbol').addEventListener('click', () => {
    //     const symbol = document.getElementById('symbol-input').value;
    //     if (symbol) {
    //         fetch(`/plugins/charts-plugin/api/data-symbol?symbol=${symbol}`)
    //             .then(response => response.json())
    //             .then(data => {
    //                 console.log(data);  // Check the fetched data
    //                 // Update the chart with new data
    //             })
    //             .catch(error => console.error('Error fetching data:', error));
    //     }
    // });
    
    // // document.addEventListener("DOMContentLoaded", () => {
    //     const symbolInput = document.getElementById('symbol-input');
    //     const loadSymbolBtn = document.getElementById('load-symbol');
        
    //     if (loadSymbolBtn && symbolInput) {
    //         loadSymbolBtn.addEventListener('click', () => {
    //             const newSymbol = symbolInput.value.trim();
    //             if (symbol) {
    //                 fetch(`/plugins/charts-plugin/api/data-symbol?symbol=${symbol}`)
    //                     .then(response => response.json())
    //                     .then(data => {
    //                         console.log(data);  // Check the fetched data
    //                         // Update the chart with new data
    //                     })
    //                     .catch(error => console.error('Error fetching data:', error));
    //             }
    //         });
    //     } else {
    //         console.error("Symbol input or load button not found in the DOM.");
    //     }
    // // });

    // document.addEventListener('DOMContentLoaded', () => {
        const loadSymbolBtn = document.getElementById('load-symbol');
        const symbolInput = document.getElementById('symbol-input');
    
        loadSymbolBtn.addEventListener('click', () => {
            const symbol = symbolInput.value.trim();
            
            if (!symbol) {
                console.log("Please enter a symbol.");
                return;  // Don't make a request if no symbol is entered
            }
    
            // Now manually make the fetch request to the backend
            const url = `/plugins/charts-plugin/api/data-symbol?symbol=${symbol}`;
    
            // Fetch the data
            fetch(url)
                .then(response => response.json())
                .then(data => {
                    console.log("Fetched Data: ", data);
    
                    // Check if the data is valid
                    if (!Array.isArray(data) || data.length === 0) {
                        console.log("No data available for the selected symbol.");
                        return;
                    }
    
                    // Update the chart with the new data
                    clearAllSeries();
                    addCandleSeries(data);
                    addVolumeSeries(data);
                    addSMASeries(data, 14, '#f1c40f');
                    addSMASeries(data, 7, '#9b59b6');
                    addSMASeries(data, 25, '#e74c3c');
    
                    // Fit the chart content
                    chart.timeScale().fitContent();
                    console.log("Chart updated successfully!");
                })
                .catch(error => {
                    console.error('Error fetching data:', error);
                });
        });
    // });
    
    

    // // -----------------------
    // // ADDING THE DELTA TOOLTIP PRIMITIVE
    // // -----------------------
    // // Assuming you have the DeltaTooltipPrimitive code as shown in the reference:
    // // https://github.com/tradingview/lightweight-charts/tree/master/plugin-examples
    // // Attach the primitive to the main candle series (or any other series).
    // const deltaTooltip = new DeltaTooltipPrimitive({
    //     lineColor: 'rgba(0, 0, 0, 0.2)',
    // });

    // // Attach the primitive to the candle series
    // candleSeries.attachPrimitive(deltaTooltip);
});
