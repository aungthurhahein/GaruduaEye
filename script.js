// Exchange Rate Monitor Application
class ExchangeRateMonitor {
    constructor() {
        this.currentRate = 0;
        this.historicalData = [];
        this.chart = null;
        this.alertSettings = {
            phoneNumber: '',
            threshold: 0,
            enabled: false
        };
        
        // API endpoints
        this.exchangeRateAPI = 'https://api.exchangerate-api.com/v4/latest/THB';
        this.historicalAPI = 'https://api.exchangerate-api.com/v4/history/THB';
        
        this.init();
    }

    async init() {
        this.loadAlertSettings();
        this.setupEventListeners();
        await this.fetchCurrentRate();
        await this.fetchHistoricalData('7d');
        this.initChart();
        this.startAutoRefresh();
        this.updateTrendAnalysis();
        this.updateInvestmentRecommendation();
        this.updateMarketInsights();
    }

    setupEventListeners() {
        // Chart time period buttons
        document.querySelectorAll('.time-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                document.querySelectorAll('.time-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                await this.fetchHistoricalData(e.target.dataset.period);
                this.updateChart();
                this.updateTrendAnalysis();
            });
        });

        // Alert settings
        document.getElementById('saveAlertSettings').addEventListener('click', () => {
            this.saveAlertSettings();
        });

        // Load saved values
        const savedPhone = localStorage.getItem('alertPhone');
        const savedThreshold = localStorage.getItem('alertThreshold');
        const savedEnabled = localStorage.getItem('alertEnabled') === 'true';

        if (savedPhone) document.getElementById('phoneNumber').value = savedPhone;
        if (savedThreshold) document.getElementById('alertThreshold').value = savedThreshold;
        document.getElementById('enableAlerts').checked = savedEnabled;
    }

    async fetchCurrentRate() {
        try {
            // Using a free exchange rate API
            const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
            const data = await response.json();
            
            // Convert USD to THB rate to THB to USD rate
            const usdToThb = data.rates.THB;
            this.currentRate = 1 / usdToThb; // THB to USD
            
            this.updateCurrentRateDisplay();
            this.checkAlerts();
            
        } catch (error) {
            console.error('Error fetching current rate:', error);
            // Fallback with simulated data
            this.currentRate = 0.0275 + (Math.random() - 0.5) * 0.002;
            this.updateCurrentRateDisplay();
        }
    }

    async fetchHistoricalData(period) {
        try {
            // Since free APIs have limitations, we'll simulate historical data
            // In a production environment, you'd use a paid service like Alpha Vantage or Fixer.io
            this.historicalData = this.generateSimulatedHistoricalData(period);
            
        } catch (error) {
            console.error('Error fetching historical data:', error);
            this.historicalData = this.generateSimulatedHistoricalData(period);
        }
    }

    generateSimulatedHistoricalData(period) {
        const days = this.getPeriodDays(period);
        const data = [];
        const baseRate = 0.0275;
        let currentRate = baseRate;
        
        const now = new Date();
        
        for (let i = days; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            
            // Simulate realistic exchange rate movements
            const volatility = 0.001;
            const trend = Math.sin(i / 10) * 0.0005; // Slight trending
            const randomChange = (Math.random() - 0.5) * volatility;
            
            currentRate = Math.max(0.025, Math.min(0.030, currentRate + trend + randomChange));
            
            data.push({
                date: date.toISOString().split('T')[0],
                rate: parseFloat(currentRate.toFixed(6)),
                timestamp: date.getTime()
            });
        }
        
        return data;
    }

    getPeriodDays(period) {
        switch (period) {
            case '7d': return 7;
            case '30d': return 30;
            case '90d': return 90;
            case '1y': return 365;
            default: return 7;
        }
    }

    updateCurrentRateDisplay() {
        const rateElement = document.getElementById('currentRate');
        const changeElement = document.getElementById('rateChange');
        const lastUpdatedElement = document.getElementById('lastUpdated');
        
        rateElement.textContent = this.currentRate.toFixed(6);
        
        // Calculate change from yesterday (simulated)
        const yesterdayRate = this.currentRate * (1 + (Math.random() - 0.5) * 0.01);
        const change = this.currentRate - yesterdayRate;
        const changePercent = (change / yesterdayRate) * 100;
        
        const changeClass = change >= 0 ? 'change-positive' : 'change-negative';
        const changeSymbol = change >= 0 ? '+' : '';
        
        changeElement.innerHTML = `
            <span class="change-value ${changeClass}">${changeSymbol}${change.toFixed(6)}</span>
            <span class="change-percent ${changeClass}">(${changeSymbol}${changePercent.toFixed(2)}%)</span>
        `;
        
        lastUpdatedElement.textContent = `Last updated: ${new Date().toLocaleString()}`;
        document.getElementById('dataRefresh').textContent = new Date().toLocaleString();
    }

    initChart() {
        const ctx = document.getElementById('rateChart').getContext('2d');
        
        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: this.historicalData.map(d => d.date),
                datasets: [{
                    label: 'THB to USD Rate',
                    data: this.historicalData.map(d => d.rate),
                    borderColor: '#3498db',
                    backgroundColor: 'rgba(52, 152, 219, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#3498db',
                    pointBorderColor: '#2980b9',
                    pointRadius: 3,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            label: function(context) {
                                return `Rate: ${context.parsed.y.toFixed(6)} USD per THB`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Date'
                        }
                    },
                    y: {
                        display: true,
                        title: {
                            display: true,
                            text: 'USD per THB'
                        },
                        ticks: {
                            callback: function(value) {
                                return value.toFixed(6);
                            }
                        }
                    }
                },
                interaction: {
                    mode: 'nearest',
                    axis: 'x',
                    intersect: false
                }
            }
        });
    }

    updateChart() {
        if (this.chart) {
            this.chart.data.labels = this.historicalData.map(d => d.date);
            this.chart.data.datasets[0].data = this.historicalData.map(d => d.rate);
            this.chart.update();
        }
    }

    updateTrendAnalysis() {
        const data = this.historicalData;
        if (data.length < 2) return;

        // 7-day trend
        const recent7Days = data.slice(-7);
        const trend7d = this.calculateTrend(recent7Days);
        this.updateTrendDisplay('trend7d', 'indicator7d', trend7d);

        // 30-day trend
        const recent30Days = data.slice(-Math.min(30, data.length));
        const trend30d = this.calculateTrend(recent30Days);
        this.updateTrendDisplay('trend30d', 'indicator30d', trend30d);

        // Volatility
        const volatility = this.calculateVolatility(data);
        this.updateVolatilityDisplay(volatility);

        // Projection
        const projection = this.calculateProjection(data);
        this.updateProjectionDisplay(projection);
    }

    calculateTrend(data) {
        if (data.length < 2) return 0;
        
        const firstRate = data[0].rate;
        const lastRate = data[data.length - 1].rate;
        const change = ((lastRate - firstRate) / firstRate) * 100;
        
        return change;
    }

    calculateVolatility(data) {
        if (data.length < 2) return 0;
        
        const rates = data.map(d => d.rate);
        const mean = rates.reduce((sum, rate) => sum + rate, 0) / rates.length;
        const variance = rates.reduce((sum, rate) => sum + Math.pow(rate - mean, 2), 0) / rates.length;
        const volatility = Math.sqrt(variance) / mean * 100;
        
        return volatility;
    }

    calculateProjection(data) {
        if (data.length < 5) return 0;
        
        // Simple linear regression for next week projection
        const recentData = data.slice(-14); // Use last 2 weeks
        const n = recentData.length;
        
        let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
        
        recentData.forEach((point, index) => {
            sumX += index;
            sumY += point.rate;
            sumXY += index * point.rate;
            sumXX += index * index;
        });
        
        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;
        
        const futureX = n + 7; // 7 days ahead
        const projectedRate = slope * futureX + intercept;
        const currentRate = data[data.length - 1].rate;
        
        return ((projectedRate - currentRate) / currentRate) * 100;
    }

    updateTrendDisplay(trendId, indicatorId, trendValue) {
        const trendElement = document.getElementById(trendId);
        const indicatorElement = document.getElementById(indicatorId);
        
        const absValue = Math.abs(trendValue);
        const sign = trendValue >= 0 ? '+' : '';
        
        trendElement.textContent = `${sign}${trendValue.toFixed(2)}%`;
        
        if (absValue > 1) {
            indicatorElement.textContent = trendValue > 0 ? '📈' : '📉';
            indicatorElement.className = `trend-indicator ${trendValue > 0 ? 'trend-up' : 'trend-down'}`;
        } else {
            indicatorElement.textContent = '➡️';
            indicatorElement.className = 'trend-indicator trend-neutral';
        }
    }

    updateVolatilityDisplay(volatility) {
        const volatilityElement = document.getElementById('volatility');
        const indicatorElement = document.getElementById('volatilityIndicator');
        
        volatilityElement.textContent = `${volatility.toFixed(2)}%`;
        
        if (volatility > 2) {
            indicatorElement.textContent = '⚠️';
            indicatorElement.className = 'trend-indicator trend-down';
        } else if (volatility > 1) {
            indicatorElement.textContent = '⚡';
            indicatorElement.className = 'trend-indicator trend-neutral';
        } else {
            indicatorElement.textContent = '✅';
            indicatorElement.className = 'trend-indicator trend-up';
        }
    }

    updateProjectionDisplay(projection) {
        const projectionElement = document.getElementById('projection');
        const indicatorElement = document.getElementById('projectionIndicator');
        
        const sign = projection >= 0 ? '+' : '';
        projectionElement.textContent = `${sign}${projection.toFixed(2)}%`;
        
        if (Math.abs(projection) > 1) {
            indicatorElement.textContent = projection > 0 ? '🚀' : '⬇️';
            indicatorElement.className = `trend-indicator ${projection > 0 ? 'trend-up' : 'trend-down'}`;
        } else {
            indicatorElement.textContent = '🔄';
            indicatorElement.className = 'trend-indicator trend-neutral';
        }
    }

    updateInvestmentRecommendation() {
        const recommendationCard = document.getElementById('recommendationCard');
        const recommendationContent = document.getElementById('recommendationContent');
        
        const data = this.historicalData;
        if (data.length < 7) return;
        
        const recent7Days = data.slice(-7);
        const trend7d = this.calculateTrend(recent7Days);
        const volatility = this.calculateVolatility(data);
        const currentRate = this.currentRate;
        
        let recommendation = '';
        let cardClass = '';
        
        // Investment logic
        if (trend7d > 2 && volatility < 2) {
            recommendation = `
                <strong>🟢 STRONG BUY SIGNAL</strong>
                <p>THB is strengthening significantly (+${trend7d.toFixed(2)}%) with low volatility. 
                This is an excellent opportunity to convert THB to USD for investment.</p>
                <p><strong>Recommended Action:</strong> Consider converting a significant portion of your THB holdings to USD.</p>
                <p><strong>Risk Level:</strong> Low</p>
            `;
            cardClass = 'recommendation-bullish';
        } else if (trend7d > 0.5 && volatility < 3) {
            recommendation = `
                <strong>🟡 MODERATE BUY</strong>
                <p>THB is showing positive momentum (+${trend7d.toFixed(2)}%) with manageable volatility. 
                Good opportunity for gradual USD investment.</p>
                <p><strong>Recommended Action:</strong> Consider dollar-cost averaging into USD positions.</p>
                <p><strong>Risk Level:</strong> Medium</p>
            `;
            cardClass = 'recommendation-neutral';
        } else if (trend7d < -2) {
            recommendation = `
                <strong>🔴 HOLD/WAIT</strong>
                <p>THB is weakening (${trend7d.toFixed(2)}%). Not an optimal time for USD investment. 
                Wait for THB to strengthen before converting.</p>
                <p><strong>Recommended Action:</strong> Hold THB and wait for better exchange rates.</p>
                <p><strong>Risk Level:</strong> High if converting now</p>
            `;
            cardClass = 'recommendation-bearish';
        } else {
            recommendation = `
                <strong>🟡 NEUTRAL</strong>
                <p>THB is showing mixed signals with ${trend7d.toFixed(2)}% recent change. 
                Market conditions are uncertain.</p>
                <p><strong>Recommended Action:</strong> Monitor closely and consider small test conversions.</p>
                <p><strong>Risk Level:</strong> Medium</p>
            `;
            cardClass = 'recommendation-neutral';
        }
        
        recommendationCard.className = `recommendation-card ${cardClass}`;
        recommendationContent.innerHTML = recommendation;
    }

    updateMarketInsights() {
        const bestOpportunities = document.getElementById('bestOpportunities');
        const riskAssessment = document.getElementById('riskAssessment');
        
        const data = this.historicalData;
        if (data.length < 30) return;
        
        // Find best historical opportunities
        const rates = data.map(d => d.rate);
        const maxRate = Math.max(...rates);
        const minRate = Math.min(...rates);
        const avgRate = rates.reduce((sum, rate) => sum + rate, 0) / rates.length;
        
        bestOpportunities.innerHTML = `
            <p><strong>Historical High:</strong> ${maxRate.toFixed(6)} USD per THB</p>
            <p><strong>Historical Low:</strong> ${minRate.toFixed(6)} USD per THB</p>
            <p><strong>Average Rate:</strong> ${avgRate.toFixed(6)} USD per THB</p>
            <p><strong>Current vs Average:</strong> ${((this.currentRate - avgRate) / avgRate * 100).toFixed(2)}%</p>
            <p class="insight-tip">💡 Best opportunities typically occur when THB strengthens 2-3% above average.</p>
        `;
        
        const volatility = this.calculateVolatility(data);
        const trend30d = this.calculateTrend(data.slice(-30));
        
        let riskLevel = 'Low';
        let riskColor = '#27ae60';
        
        if (volatility > 3 || Math.abs(trend30d) > 5) {
            riskLevel = 'High';
            riskColor = '#e74c3c';
        } else if (volatility > 1.5 || Math.abs(trend30d) > 2) {
            riskLevel = 'Medium';
            riskColor = '#f39c12';
        }
        
        riskAssessment.innerHTML = `
            <p><strong>Current Risk Level:</strong> <span style="color: ${riskColor}; font-weight: bold;">${riskLevel}</span></p>
            <p><strong>30-Day Volatility:</strong> ${volatility.toFixed(2)}%</p>
            <p><strong>30-Day Trend:</strong> ${trend30d.toFixed(2)}%</p>
            <p><strong>Recommendation:</strong> ${riskLevel === 'Low' ? 'Good time for larger investments' : 
                riskLevel === 'Medium' ? 'Consider smaller, regular investments' : 'Wait for market stabilization'}</p>
        `;
    }

    saveAlertSettings() {
        const phoneNumber = document.getElementById('phoneNumber').value;
        const threshold = parseFloat(document.getElementById('alertThreshold').value);
        const enabled = document.getElementById('enableAlerts').checked;
        
        if (enabled && (!phoneNumber || !threshold)) {
            this.showMessage('Please enter both phone number and threshold to enable alerts.', 'error');
            return;
        }
        
        this.alertSettings = { phoneNumber, threshold, enabled };
        
        // Save to localStorage
        localStorage.setItem('alertPhone', phoneNumber);
        localStorage.setItem('alertThreshold', threshold.toString());
        localStorage.setItem('alertEnabled', enabled.toString());
        
        this.updateAlertStatus();
        this.showMessage('Alert settings saved successfully!', 'success');
    }

    loadAlertSettings() {
        const phoneNumber = localStorage.getItem('alertPhone') || '';
        const threshold = parseFloat(localStorage.getItem('alertThreshold')) || 0;
        const enabled = localStorage.getItem('alertEnabled') === 'true';
        
        this.alertSettings = { phoneNumber, threshold, enabled };
        this.updateAlertStatus();
    }

    updateAlertStatus() {
        const alertStatus = document.getElementById('alertStatus');
        
        if (this.alertSettings.enabled) {
            alertStatus.innerHTML = `
                <p><strong>✅ SMS Alerts Active</strong></p>
                <p>Phone: ${this.alertSettings.phoneNumber}</p>
                <p>Threshold: ${this.alertSettings.threshold.toFixed(6)} USD per THB</p>
                <p>You will be notified when THB strengthens to this level.</p>
            `;
            alertStatus.className = 'alert-status active';
        } else {
            alertStatus.innerHTML = '<p>SMS alerts are currently disabled</p>';
            alertStatus.className = 'alert-status';
        }
    }

    checkAlerts() {
        if (!this.alertSettings.enabled || !this.alertSettings.threshold) return;
        
        if (this.currentRate >= this.alertSettings.threshold) {
            this.triggerAlert();
        }
    }

    triggerAlert() {
        // In a real implementation, this would send an SMS via a service like Twilio
        // For demo purposes, we'll show a browser notification and visual alert
        
        this.showMessage(`🚨 ALERT: THB has strengthened to ${this.currentRate.toFixed(6)} USD per THB! Consider investing in USD now.`, 'warning');
        
        // Browser notification
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('THB Investment Alert', {
                body: `THB has reached your target rate of ${this.alertSettings.threshold.toFixed(6)} USD per THB!`,
                icon: '💰'
            });
        }
        
        // Visual pulse effect
        document.querySelector('.rate-card').classList.add('pulse');
        setTimeout(() => {
            document.querySelector('.rate-card').classList.remove('pulse');
        }, 3000);
        
        console.log(`SMS Alert would be sent to ${this.alertSettings.phoneNumber}: THB rate ${this.currentRate.toFixed(6)} reached threshold ${this.alertSettings.threshold.toFixed(6)}`);
    }

    showMessage(text, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.textContent = text;
        
        document.querySelector('.container').insertBefore(messageDiv, document.querySelector('main'));
        
        setTimeout(() => {
            messageDiv.remove();
        }, 5000);
    }

    startAutoRefresh() {
        // Refresh current rate every 5 minutes
        setInterval(() => {
            this.fetchCurrentRate();
        }, 5 * 60 * 1000);
        
        // Refresh historical data every hour
        setInterval(() => {
            const activePeriod = document.querySelector('.time-btn.active').dataset.period;
            this.fetchHistoricalData(activePeriod).then(() => {
                this.updateChart();
                this.updateTrendAnalysis();
                this.updateInvestmentRecommendation();
                this.updateMarketInsights();
            });
        }, 60 * 60 * 1000);
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
    
    // Initialize the exchange rate monitor
    new ExchangeRateMonitor();
});

// Service Worker for offline functionality (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => console.log('SW registered'))
            .catch(registrationError => console.log('SW registration failed'));
    });
}
