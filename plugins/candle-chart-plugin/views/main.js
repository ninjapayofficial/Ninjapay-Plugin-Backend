/* global LightweightCharts */
// plugins/candle-chart-plugin/views/index.js
// Ensure the file name here matches the one referenced in your HTML script tag.
// Assuming your HTML is `<script src="main.js"></script>`, call this file `main.js`.
document.addEventListener('DOMContentLoaded', () => {
    const { createChart } = LightweightCharts;
    const chartContainer = document.getElementById('chart-container');
    const actionsDiv = document.getElementById('actions');

    const chart = createChart(chartContainer, {
        width: chartContainer.clientWidth,
        height: 400,
        layout: {
            backgroundColor: '#ffffff',
            textColor: '#333333',
        },
        timeScale: {
            borderColor: '#D1D4DC',
        },
        rightPriceScale: {
            borderColor: '#D1D4DC',
        },
        crosshair: {
            vertLine: { visible: true, labelVisible: false },
            horzLine: { visible: true, labelVisible: false },
        },
    });

    const candleSeries = chart.addCandlestickSeries();

    const data = [
        { time: '2022-10-19', open: 100, high: 110, low: 95, close: 105 },
        { time: '2022-10-20', open: 105, high: 112, low: 104, close: 110 },
        { time: '2022-10-21', open: 110, high: 115, low: 108, close: 112 },
        { time: '2022-10-22', open: 112, high: 120, low: 110, close: 119 },
        { time: '2022-10-23', open: 119, high: 121, low: 118, close: 120 },
    ];

    candleSeries.setData(data);

    window.addEventListener('resize', () => {
        chart.applyOptions({ width: chartContainer.clientWidth });
    });

    // We will show the popup once and never hide it automatically
    chart.subscribeCrosshairMove(param => {
        // If no param.point, we just don't update. But we won't hide the popup.
        if (!param.point) {
            return;
        }

        const price = candleSeries.coordinateToPrice(param.point.y);
        if (price === null) {
            return;
        }

        // Update popup content
        actionsDiv.innerHTML = `
            <p>Price: ${price.toFixed(2)}</p>
            <button id="buy-button">Buy</button>
            <button id="sell-button">Sell</button>
            <button id="close-button">Close</button>
        `;

        const buyButton = document.getElementById('buy-button');
        const sellButton = document.getElementById('sell-button');
        const closeButton = document.getElementById('close-button');

        buyButton.onclick = () => { alert('Buy at ' + price); };
        sellButton.onclick = () => { alert('Sell at ' + price); };
        closeButton.onclick = () => { actionsDiv.style.display = 'none'; };

        // Show the popup
        actionsDiv.style.display = 'block';

        // Position the popup on the right side of the chart
        const popupWidth = actionsDiv.offsetWidth;
        const containerWidth = chartContainer.clientWidth;
        const x = containerWidth - popupWidth - 10; // 10px from the right edge
        const y = param.point.y + 10;

        actionsDiv.style.left = x + 'px';
        actionsDiv.style.top = y + 'px';
    });
});
