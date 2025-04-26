async function fetchOilPrices() {
    try {
        const response = await fetch('/api/oil-prices');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error);
        }

        // Update Brent prices
        if (data.brent && !data.brent.error) {
            document.getElementById('brent-price').textContent = `$${data.brent.price.toFixed(2)}`;
            updatePriceChange('brent-change', data.brent.change, data.brent.change_percent);
        } else {
            const error = data.brent?.error || 'No data available';
            document.getElementById('brent-price').textContent = 'N/A';
            document.getElementById('brent-change').textContent = error;
            document.getElementById('brent-change').className = 'text-warning';
        }

        // Update WTI prices
        if (data.wti && !data.wti.error) {
            document.getElementById('wti-price').textContent = `$${data.wti.price.toFixed(2)}`;
            updatePriceChange('wti-change', data.wti.change, data.wti.change_percent);
        } else {
            const error = data.wti?.error || 'No data available';
            document.getElementById('wti-price').textContent = 'N/A';
            document.getElementById('wti-change').textContent = error;
            document.getElementById('wti-change').className = 'text-warning';
        }

        // Update last updated time
        if (data.last_updated) {
            document.getElementById('last-updated').textContent = formatDate(new Date(data.last_updated));
        }
    } catch (error) {
        console.error('Error fetching oil prices:', error);
        const errorMessage = error.message || 'Failed to fetch oil prices';
        
        document.getElementById('brent-price').textContent = 'Error';
        document.getElementById('wti-price').textContent = 'Error';
        document.getElementById('brent-change').textContent = errorMessage;
        document.getElementById('wti-change').textContent = errorMessage;
        document.getElementById('brent-change').className = 'text-danger';
        document.getElementById('wti-change').className = 'text-danger';
        document.getElementById('last-updated').textContent = 'Error';
    }
}

function updatePriceChange(elementId, change, changePercent) {
    const element = document.getElementById(elementId);
    const isPositive = change >= 0;
    const sign = isPositive ? '+' : '';
    element.textContent = `${sign}$${change.toFixed(2)} (${sign}${changePercent.toFixed(2)}%)`;
    element.className = isPositive ? 'positive' : 'negative';
}

function formatDate(date) {
    return date.toLocaleString('ru-RU', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}

// Fetch prices when page loads
document.addEventListener('DOMContentLoaded', fetchOilPrices);

// Update prices every minute
setInterval(fetchOilPrices, 60000); 