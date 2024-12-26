// plugins/charts-plugin/views/main.js

/* eslint-disable no-unused-vars */
/* global LightweightCharts */
document.addEventListener('DOMContentLoaded', async () => {
    const { createChart, CrosshairMode } = LightweightCharts;

    // ========== DOM Elements ==========
    const chartContainer = document.getElementById('chart-container');
    const rsiChartContainer = document.getElementById('rsi-chart-container'); // <--- New container for RSI

    const actionsDiv = document.getElementById('actions');
    const ohlcInfoDiv = document.getElementById('ohlc-info');
    const toolbar = document.getElementById('toolbar');
    const drawingToolbar = document.getElementById('drawing-toolbar');

    // Toolbar Buttons
    const candleBtn = document.getElementById('candle-btn');
    const lineBtn = document.getElementById('line-btn');
    const areaBtn = document.getElementById('area-btn');
    const drawBtn = document.getElementById('draw-btn');
    const closeDrawBtn = document.getElementById('close-draw-btn');

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
            if (!Array.isArray(data) || data.length === 0) {
                console.log('No data found for symbol:', symbol);
                data = [];
            }
        } catch (err) {
            console.error('Error fetching data for symbol:', err);
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

    // ========== MAIN CHART ==========
    const chart = createChart(chartContainer, {
        width: chartContainer.clientWidth,
        height: 600, // or set a fixed height if desired
        layout: {
            background: { color: '#0b0e11' }, // Dark background
            textColor: '#e0e0e0',
        },
        timeScale: {
            borderColor: '#2f3336',
            barSpacing: 15,
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

    // ========== NEW RSI CHART (SEPARATE) ==========
    const rsiChart = createChart(rsiChartContainer, {
        width: rsiChartContainer.clientWidth,
        height: 200,
        layout: {
            background: { color: '#0b0e11' },
            textColor: '#e0e0e0',
        },
        timeScale: {
            borderColor: '#2f3336',
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


    // Keep track of all series on the main chart
    let allSeries = [];
    let horizontalLines = []; // store references to horizontal line series (main chart)

    // ========== Basic Series Helpers ==========
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
        const smaData = calculateSMA(data, length).filter(d => d.value !== null);
        const smaSeries = chart.addLineSeries({
            color: color,
            lineWidth: 2
        });
        smaSeries.setData(smaData);
        allSeries.push(smaSeries);
    }

    // ========== RSI Calculation ==========
    function calculateRSI(data, period = 14) {
        let rsi = [];
        if (data.length < period) {
            // Not enough data to calculate RSI
            return rsi;
        }

        let gains = 0;
        let losses = 0;

        // Calculate initial average gain and loss
        for (let i = 1; i <= period; i++) {
            let change = data[i].close - data[i - 1].close;
            if (change > 0) {
                gains += change;
            } else {
                losses -= change; // losses are stored as positive
            }
        }

        let avgGain = gains / period;
        let avgLoss = losses / period;
        let rs = avgLoss === 0 ? 100 : avgGain / avgLoss;

        // First valid RSI value
        rsi.push({
            time: data[period].time,
            value: 100 - (100 / (1 + rs))
        });

        // Calculate RSI for the rest of the data
        for (let i = period + 1; i < data.length; i++) {
            let change = data[i].close - data[i - 1].close;
            if (change > 0) {
                avgGain = ((avgGain * (period - 1)) + change) / period;
                avgLoss = (avgLoss * (period - 1)) / period;
            } else {
                avgGain = (avgGain * (period - 1)) / period;
                avgLoss = ((avgLoss * (period - 1)) - change) / period;
            }
            rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
            rsi.push({
                time: data[i].time,
                value: 100 - (100 / (1 + rs))
            });
        }

        return rsi;
    }

    // ========== RSI on the Separate Chart ==========
    function addRSISeriesToRSIChart(data, period = 14, color = '#ff9900') {
        // Compute RSI data
        const rsiData = calculateRSI(data, period);

        // Create a new line series on the rsiChart
        const rsiSeries = rsiChart.addLineSeries({
            color: color,
            lineWidth: 2
        });

        rsiSeries.setData(rsiData);

        // Add Overbought (70) & Oversold (30) lines on the RSI chart
        addHorizontalLineToRSI(70, '#ff0000'); // Overbought
        addHorizontalLineToRSI(30, '#00ff00'); // Oversold
    }

    function addHorizontalLineToRSI(value, color = '#ffffff') {
        if (data.length < 1) return;
        const lineSeries = rsiChart.addLineSeries({
            color: color,
            lineWidth: 1,
            lineStyle: LightweightCharts.LineStyle.Dotted,
        });
        lineSeries.setData([
            { time: data[0].time, value: value },
            { time: data[data.length - 1].time, value: value },
        ]);
    }

    // ========== Clear Series Helpers ==========
    function clearAllSeries() {
        // Remove each series from main chart
        for (let i = 0; i < allSeries.length; i++) {
            chart.removeSeries(allSeries[i]);
        }
        // Also remove horizontal lines from main chart
        for (let j = 0; j < horizontalLines.length; j++) {
            chart.removeSeries(horizontalLines[j]);
        }
        allSeries = [];
        horizontalLines = [];

        // Clear RSI chart series
        rsiChart.remove();
        // Recreate a fresh RSI chart so lines are cleared
        // (Alternatively, you can store references to each RSI series and remove them individually.)
        const newRsiChart = createChart(rsiChartContainer, rsiChart.options());
        // We must reassign rsiChart, so future RSI additions go to the new chart.
        Object.assign(rsiChart, newRsiChart);
    }

    // ========== Set Chart Type ==========
    function setChartType(type) {
        clearAllSeries(); // remove current series from main chart & rebuild RSI chart

        // MAIN chart rebuild
        if (type === 'candlestick') {
            addCandleSeries(data);
        } else if (type === 'line') {
            const mainSeries = chart.addLineSeries({ color: '#ffffff', lineWidth: 2 });
            const lineData = data.map(d => ({ time: d.time, value: d.close }));
            mainSeries.setData(lineData);
            allSeries.push(mainSeries);
        } else if (type === 'area') {
            const mainSeries = chart.addAreaSeries({ 
                topColor: 'rgba(67,83,254,0.7)', 
                bottomColor: 'rgba(67,83,254,0.3)', 
                lineColor: 'rgba(67,83,254,1)', 
                lineWidth: 2 
            });
            const areaData = data.map(d => ({ time: d.time, value: d.close }));
            mainSeries.setData(areaData);
            allSeries.push(mainSeries);
        }

        // Re-add volume to main chart
        addVolumeSeries(data);

        // Re-add SMAs
        addSMASeries(data, 14, '#f1c40f');
        addSMASeries(data, 7, '#9b59b6');
        addSMASeries(data, 25, '#e74c3c');

        // Re-add RSI in the separate rsiChart
        addRSISeriesToRSIChart(data, 14, '#ff9900');

        // Adjust the visible range to focus on the latest data (main chart)
        const visibleBars = 50; 
        const totalBars = data.length;
        if (totalBars > visibleBars) {
            chart.timeScale().setVisibleLogicalRange({
                from: totalBars - visibleBars,
                to: totalBars,
            });
        } else {
            chart.timeScale().fitContent();
        }
    }

    // ========== Initial Load of Series ==========
    let candleSeries = addCandleSeries(data);
    addVolumeSeries(data);
    addSMASeries(data, 14, '#f1c40f');
    addSMASeries(data, 7, '#9b59b6');
    addSMASeries(data, 25, '#e74c3c');
    addRSISeriesToRSIChart(data, 14, '#ff9900'); // RSI in separate chart

    // Focus on the latest data
    const visibleBars = 50;
    const totalBars = data.length;
    if (totalBars > visibleBars) {
        chart.timeScale().setVisibleLogicalRange({
            from: totalBars - visibleBars,
            to: totalBars,
        });
    } else {
        chart.timeScale().fitContent();
    }

    // ========== Resize Handling ==========
    window.addEventListener('resize', () => {
        chart.applyOptions({ width: chartContainer.clientWidth });
        rsiChart.applyOptions({ width: rsiChartContainer.clientWidth });
    });


    // ========== Crosshair Handling (Main Chart) ==========
    let currentCrosshairPrice = null;
    let latestPrice = data.length > 0 ? data[data.length - 1].close : null;

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
        const percentColor = percentChange >= 0 ? '#16a085' : '#c0392b';

        if (candle) {
            ohlcInfoDiv.innerHTML = `
                <p><strong>${new Date(candle.time).toLocaleString()}</strong></p>
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

        // Actions popup
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
                    ${price.toFixed(2)} <span style="color: ${percentColor};">${formattedPercentChange}</span>
                </p>
            </div>
        `;

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

    // Small help text
    const instructions = document.createElement('div');
    instructions.style.position = 'absolute';
    instructions.style.top = '10px';
    instructions.style.right = '10px';
    instructions.style.color = '#aaa';
    instructions.style.fontSize = '12px';
    instructions.innerHTML = 'Scroll to zoom, drag to pan';
    chartContainer.appendChild(instructions);

    // ========== Event Listeners for Chart Type Buttons ==========
    candleBtn.addEventListener('click', () => setChartType('candlestick'));
    lineBtn.addEventListener('click', () => setChartType('line'));
    areaBtn.addEventListener('click', () => setChartType('area'));

    // ========== Drawing Mode Setup ==========
    const drawingCanvas = document.createElement('canvas');
    drawingCanvas.style.position = 'absolute';
    drawingCanvas.style.top = '0';
    drawingCanvas.style.left = '0';
    drawingCanvas.style.width = '100%';
    drawingCanvas.style.height = '100%';
    drawingCanvas.style.zIndex = '10'; // Ensure it's above the chart
    drawingCanvas.style.pointerEvents = 'none'; // Disabled by default
    chartContainer.appendChild(drawingCanvas);

    // Resize the canvas to match the chart size
    function resizeCanvas() {
        drawingCanvas.width = chartContainer.clientWidth;
        drawingCanvas.height = chartContainer.clientHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const ctx = drawingCanvas.getContext('2d');
    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;
    let isDrawingMode = false;

    // Enable Drawing Mode
    drawBtn.addEventListener('click', () => {
        if (isDrawingMode) return;
        isDrawingMode = true;
        drawingCanvas.style.pointerEvents = 'auto';
        chartContainer.classList.add('chart-drawing-mode');
        drawingToolbar.style.display = 'block';
    });

    // Close Drawing Mode
    closeDrawBtn.addEventListener('click', () => {
        if (!isDrawingMode) return;
        isDrawingMode = false;
        drawingCanvas.style.pointerEvents = 'none';
        chartContainer.classList.remove('chart-drawing-mode');
        drawingToolbar.style.display = 'none';
        ctx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height); 
    });

    // Start drawing
    drawingCanvas.addEventListener('mousedown', (e) => {
        if (!isDrawingMode) return;
        isDrawing = true;
        const rect = drawingCanvas.getBoundingClientRect();
        lastX = e.clientX - rect.left;
        lastY = e.clientY - rect.top;
    });

    // Draw on mouse move
    drawingCanvas.addEventListener('mousemove', (e) => {
        if (!isDrawing) return;
        const rect = drawingCanvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(x, y);
        ctx.stroke();

        lastX = x;
        lastY = y;
    });

    // Stop drawing
    drawingCanvas.addEventListener('mouseup', () => {
        if (!isDrawingMode) return;
        isDrawing = false;
    });

    // Optionally, handle mouse leave to stop drawing
    drawingCanvas.addEventListener('mouseleave', () => {
        if (!isDrawingMode) return;
        isDrawing = false;
    });

    // ========== Symbol Loader Logic ==========
    const loadSymbolBtn = document.getElementById('load-symbol');
    const symbolInput = document.getElementById('symbol-input');

    loadSymbolBtn.addEventListener('click', () => {
        const symbol = symbolInput.value.trim();
        if (!symbol) {
            console.log("Please enter a symbol.");
            return;
        }

        const url = `/plugins/charts-plugin/api/data?symbol=${symbol}`;
        fetch(url)
            .then(response => response.json())
            .then(newData => {
                data = newData;
                if (!Array.isArray(data) || data.length === 0) {
                    console.log("No data available for the selected symbol.");
                    return;
                }
                clearAllSeries();
                candleSeries = addCandleSeries(data);
                addVolumeSeries(data);
                addSMASeries(data, 14, '#f1c40f');
                addSMASeries(data, 7, '#9b59b6');
                addSMASeries(data, 25, '#e74c3c');
                addRSISeriesToRSIChart(data, 14, '#ff9900');
                latestPrice = data.length > 0 ? data[data.length - 1].close : null;

                const visibleBars = 50;
                const totalBars = data.length;
                if (totalBars > visibleBars) {
                    chart.timeScale().setVisibleLogicalRange({
                        from: totalBars - visibleBars,
                        to: totalBars,
                    });
                } else {
                    chart.timeScale().fitContent();
                }
            })
            .catch(error => {
                console.error('Error fetching data:', error);
            });
    });
    

    // Get references to the time scales
    const mainTimeScale = chart.timeScale();
    const rsiTimeScale = rsiChart.timeScale();

    // Flags to prevent infinite ping-pong updates
    let updatingMainChart = false;
    let updatingRsiChart = false;

    // MAIN -> RSI
    mainTimeScale.subscribeVisibleLogicalRangeChange((newRange) => {
        if (updatingMainChart) return; // skip if this is triggered by RSI -> Main

        if (!newRange) return; // can be null if no data
        let { from, to } = newRange;
        // If the range is inverted, swap it
        if (from > to) {
            [from, to] = [to, from];
        }

        // Now update RSI
        updatingRsiChart = true;
        rsiTimeScale.setVisibleLogicalRange({ from, to });
        updatingRsiChart = false;
    });

    // RSI -> MAIN
    rsiTimeScale.subscribeVisibleLogicalRangeChange((newRange) => {
        if (updatingRsiChart) return;

        if (!newRange) return;
        let { from, to } = newRange;
        if (from > to) {
            [from, to] = [to, from];
        }

        updatingMainChart = true;
        mainTimeScale.setVisibleLogicalRange({ from, to });
        updatingMainChart = false;
    });


    

    // -----------------------
    // ADDING THE DELTA TOOLTIP PRIMITIVE (Commented Out)
    // -----------------------
    // Assuming you have the DeltaTooltipPrimitive code as shown in the reference:
    // https://github.com/tradingview/lightweight-charts/tree/master/plugin-examples
    // Attach the primitive to the main candle series (or any other series).
    // const deltaTooltip = new DeltaTooltipPrimitive({
    //     lineColor: 'rgba(0, 0, 0, 0.2)',
    // });

    // // Attach the primitive to the candle series
    // candleSeries.attachPrimitive(deltaTooltip);
});
