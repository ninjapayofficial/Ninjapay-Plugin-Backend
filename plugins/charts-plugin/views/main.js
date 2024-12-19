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

    // If you need to change it later:
    chart.applyOptions({
        layout: {
            backgroundColor: '#0b0e11'
        }
    });

    const candleSeries = chart.addCandlestickSeries({
        upColor: '#26a69a',
        downColor: '#ef5350',
        borderDownColor: '#ef5350',
        borderUpColor: '#26a69a',
        wickDownColor: '#ef5350',
        wickUpColor: '#26a69a'
    });
    candleSeries.setData(data);

    window.addEventListener('resize', () => {
        chart.applyOptions({ width: chartContainer.clientWidth });
    });

    chart.subscribeCrosshairMove(param => {
        if (!param.point) return;
        const price = candleSeries.coordinateToPrice(param.point.y);
        if (price === null) return;

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
                <button id="close-button" style="background: #555; color: #fff;">Close</button>
            </div>
        `;
        document.getElementById('buy-button').onclick = () => alert('Buy at ' + price.toFixed(2));
        document.getElementById('sell-button').onclick = () => alert('Sell at ' + price.toFixed(2));
        document.getElementById('close-button').onclick = () => { actionsDiv.style.display = 'none'; };

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
});
