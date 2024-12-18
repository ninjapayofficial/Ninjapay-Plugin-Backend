/* global LightweightCharts */
// plugins/candle-chart-plugin/views/index.js
// Ensure the file name here matches the one referenced in your HTML script tag.
// Assuming your HTML is `<script src="main.js"></script>`, call this file `main.js`.
document.addEventListener('DOMContentLoaded', () => {
    const { createChart } = LightweightCharts;
    const chartContainer = document.getElementById('chart-container');
    const actionsDiv = document.getElementById('actions');
    const ohlcInfoDiv = document.getElementById('ohlc-info');

    // Example data
    const data = [
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

    // Create chart
    const chart = createChart(chartContainer, {
        width: chartContainer.clientWidth,
        height: 600,
        layout: {
            backgroundColor: '#0b0e11',
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

    const candleSeries = chart.addCandlestickSeries({
        upColor: '#26a69a',
        downColor: '#ef5350',
        borderDownColor: '#ef5350',
        borderUpColor: '#26a69a',
        wickDownColor: '#ef5350',
        wickUpColor: '#26a69a'
    });
    candleSeries.setData(data);

    // Compute SMA (for demonstration)
    function sma(data, length) {
        const result = [];
        for (let i = 0; i < data.length; i++) {
            if (i < length - 1) {
                result.push({ time: data[i].time, value: null });
            } else {
                const slice = data.slice(i - length + 1, i + 1);
                const avg = slice.reduce((sum, d) => sum + d.close, 0) / length;
                result.push({ time: data[i].time, value: avg });
            }
        }
        return result;
    }

    const ma7Data = sma(data, 7);
    const ma25Data = sma(data, 25);
    const ma99Data = sma(data, 99);

    const ma7 = chart.addLineSeries({ color: '#f1c40f', lineWidth: 2 });
    ma7.setData(ma7Data);

    const ma25 = chart.addLineSeries({ color: '#9b59b6', lineWidth: 2 });
    ma25.setData(ma25Data);

    const ma99 = chart.addLineSeries({ color: '#e74c3c', lineWidth: 2 });
    ma99.setData(ma99Data);

    // Keep track of last known param to maintain the popup when mouse leaves chart
    let lastCandle = null; 
    let lastPrice = null;
    let lastParamPoint = null;

    chart.subscribeCrosshairMove(param => {
        if (!param.time) {
            // If we have no param.time (mouse off chart) do not hide the popup
            // Instead, just don't update. The popup stays at last known data.
            return;
        }

        const price = candleSeries.coordinateToPrice(param.point.y);
        if (price === null) {
            return;
        }

        // Candle data at hovered time
        const candle = data.find(d => d.time === param.time);
        if (!candle) {
            return;
        }

        // Get MAs
        const ma7Val = ma7Data.find(d => d.time === param.time)?.value ?? '—';
        const ma25Val = ma25Data.find(d => d.time === param.time)?.value ?? '—';
        const ma99Val = ma99Data.find(d => d.time === param.time)?.value ?? '—';

        // Update OHLC info
        ohlcInfoDiv.innerHTML = `
            <p><strong>${param.time}</strong></p>
            <p>O: ${candle.open.toFixed(2)} H: ${candle.high.toFixed(2)} L: ${candle.low.toFixed(2)} C: ${candle.close.toFixed(2)}</p>
            <p>Vol: ${candle.volume}</p>
            <p>MA(7): ${ma7Val.toFixed ? ma7Val.toFixed(2) : ma7Val} | MA(25): ${ma25Val.toFixed ? ma25Val.toFixed(2) : ma25Val} | MA(99): ${ma99Val.toFixed ? ma99Val.toFixed(2) : ma99Val}</p>
        `;
        ohlcInfoDiv.style.display = 'block';

        // Update and show the popup - never hide automatically
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
        const containerWidth = chartContainer.clientWidth;
        const x = containerWidth - popupWidth - 10;
        const y = param.point.y + 10;

        actionsDiv.style.left = x + 'px';
        actionsDiv.style.top = y + 'px';

        // Update last known values
        lastCandle = candle;
        lastPrice = price;
        lastParamPoint = param.point;
    });

    window.addEventListener('resize', () => {
        chart.applyOptions({ width: chartContainer.clientWidth });
    });

    // Instructions
    const instructions = document.createElement('div');
    instructions.style.position = 'absolute';
    instructions.style.top = '10px';
    instructions.style.right = '10px';
    instructions.style.color = '#aaa';
    instructions.style.fontSize = '12px';
    instructions.innerHTML = 'Scroll to zoom, drag to pan';
    chartContainer.appendChild(instructions);
});
