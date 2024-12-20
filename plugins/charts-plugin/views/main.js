// plugins/charts-plugin/views/main.js

// /* eslint-disable no-unused-vars */
/* global LightweightCharts */
document.addEventListener('DOMContentLoaded', async () => {
    const { createChart } = LightweightCharts;
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
        // No symbol, no data (or use some default)
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
                color: '#0b0e11'
            },
            textColor: '#e0e0e0',
        },
        timeScale: {
            borderColor: '#2f3336',
            // Increase barSpacing to zoom in
            barSpacing: 15
        },
        rightPriceScale: {
            borderColor: '#2f3336',
        },
        grid: {
            vertLines: { color: '#2f3336', style: 1 },
            horzLines: { color: '#2f3336', style: 1 },
        },
        crosshair: {
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

    // Initial load of series
    const candleSeries = addCandleSeries(data);
    addVolumeSeries(data);
    addSMASeries(data, 14, '#f1c40f');
    addSMASeries(data, 7, '#9b59b6');
    addSMASeries(data, 25, '#e74c3c');

    // Fit content to see everything clearly
    chart.timeScale().fitContent();

    window.addEventListener('resize', () => {
        chart.applyOptions({ width: chartContainer.clientWidth });
    });

    // eslint-disable-next-line no-unused-vars
    let currentCrosshairPrice = null;
    chart.subscribeCrosshairMove(param => {
        if (!param.point) return;
        const price = candleSeries.coordinateToPrice(param.point.y);
        if (price === null) return;
        currentCrosshairPrice = price;

        let candle = null;
        if (param.time) {
            candle = data.find(d => d.time === param.time);
        }

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

        actionsDiv.innerHTML = `
            <div style="display: flex; flex-direction: column; align-items: flex-end;">
                <p style="margin: 0; margin-bottom: 8px; color: black;">${price.toFixed(2)}</p>
                <button id="buy-button" style="margin-bottom: 5px; background: #16a085; color: #fff;">Buy</button>
                <button id="sell-button" style="margin-bottom: 5px; background: #c0392b; color: #fff;">Sell</button>
                <button id="draw-button" style="margin-bottom: 5px; background: #2980b9; color: #fff;">Draw</button>    
            </div>
        `;
        document.getElementById('buy-button').onclick = () => alert('Buy at ' + price.toFixed(2));
        document.getElementById('sell-button').onclick = () => alert('Sell at ' + price.toFixed(2));
        // document.getElementById('close-button').onclick = () => { actionsDiv.style.display = 'none'; };

        // Draw button: Place a horizontal line at this price
        document.getElementById('draw-button').onclick = () => {
            if (data.length < 1) return;
            const lineSeries = chart.addLineSeries({
                color: '#ffffff',
                lineWidth: 1
            });
            // create a horizontal line by setting two points at the same price
            const firstTime = data[0].time;
            const lastTime = data[data.length - 1].time;
            lineSeries.setData([
                { time: firstTime, value: price },
                { time: lastTime, value: price }
            ]);
            horizontalLines.push(lineSeries);
            alert('Horizontal line drawn at ' + price.toFixed(2));
        };

        actionsDiv.style.display = 'block';

        const popupWidth = actionsDiv.offsetWidth;
        const popupHeight = actionsDiv.offsetHeight;
        const containerWidth = chartContainer.clientWidth;
        const x = containerWidth - popupWidth - 10;
        const y = param.point.y - (popupHeight / 2);

        actionsDiv.style.left = x + 'px';
        actionsDiv.style.top = y + 'px';
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
        const smaData = calculateSMA(data, 14);
        const smaSeries = chart.addLineSeries({
            color: '#f1c40f',
            lineWidth: 2
        });
        smaSeries.setData(smaData);
        allSeries.push(smaSeries);

        // Fit again after re-building series
        chart.timeScale().fitContent();

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
    const symbolInput = document.getElementById('symbol-input');
    const loadSymbolBtn = document.getElementById('load-symbol');
    loadSymbolBtn.addEventListener('click', () => {
        const newSymbol = symbolInput.value.trim();
        if (newSymbol) {
            window.location.href = `/plugins/charts-plugin/${newSymbol}`;
        }
    });
});
