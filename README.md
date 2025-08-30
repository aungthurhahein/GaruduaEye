# THB to USD Exchange Rate Monitor

A comprehensive web application for monitoring Thai Baht (THB) to US Dollar (USD) exchange rates with investment-focused features including historical analysis, trend projections, and SMS alerts.

## Features

### 📊 Real-time Exchange Rate Monitoring
- Live THB to USD exchange rate updates
- Automatic refresh every 5 minutes
- Visual indicators for rate changes

### 📈 Historical Data & Visualization
- Interactive charts with multiple time periods (7 days, 30 days, 90 days, 1 year)
- Historical performance analysis
- Trend visualization with Chart.js

### 🔮 Trend Analysis & Projections
- 7-day and 30-day trend calculations
- Volatility analysis
- Next week projection using linear regression
- Risk assessment indicators

### 💡 Investment Recommendations
- Intelligent buy/hold/wait signals based on market conditions
- Risk level assessments
- Actionable investment advice

### 📱 SMS Alert System
- Customizable threshold alerts
- SMS notifications when THB strengthens
- Browser notifications support
- Twilio integration for reliable SMS delivery

### 📊 Market Insights
- Historical high/low analysis
- Average rate comparisons
- Best investment opportunity identification
- Risk level assessments

## Quick Start

### 1. Frontend Only (Basic Features)
Simply open `index.html` in your web browser to use the basic monitoring features without SMS alerts.

### 2. Full Setup with SMS Alerts

#### Prerequisites
- Node.js (version 14 or higher)
- npm or yarn package manager
- Twilio account (for SMS alerts)

#### Installation

1. **Clone or download the project files**
   ```bash
   cd thb-usd-monitor
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure SMS alerts (optional)**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` file with your Twilio credentials:
   ```env
   TWILIO_ACCOUNT_SID=your_account_sid_here
   TWILIO_AUTH_TOKEN=your_auth_token_here
   TWILIO_PHONE_NUMBER=+1234567890
   ```

4. **Start the SMS service**
   ```bash
   npm start
   ```
   
   For development with auto-restart:
   ```bash
   npm run dev
   ```

5. **Open the web application**
   Open `index.html` in your web browser or serve it through a web server.

## Setting Up Twilio for SMS Alerts

1. **Create a Twilio Account**
   - Visit [https://www.twilio.com/](https://www.twilio.com/)
   - Sign up for a free account
   - Verify your phone number

2. **Get Your Credentials**
   - Go to Twilio Console Dashboard
   - Copy your Account SID and Auth Token
   - Get a Twilio phone number

3. **Configure Environment Variables**
   - Update the `.env` file with your Twilio credentials
   - Restart the SMS service

## Usage Guide

### Setting Up Alerts

1. **Enter Your Phone Number**
   - Use international format (e.g., +66812345678 for Thailand)
   - Ensure the number is verified with Twilio (for trial accounts)

2. **Set Alert Threshold**
   - Enter the USD per THB rate that triggers an alert
   - Example: 0.0280 means you'll be alerted when 1 THB = 0.0280 USD

3. **Enable Alerts**
   - Check the "Enable SMS Alerts" checkbox
   - Click "Save Alert Settings"

### Understanding the Dashboard

#### Current Rate Section
- **Rate Display**: Current THB to USD exchange rate
- **Change Indicators**: Daily change in absolute value and percentage
- **Last Updated**: Timestamp of the last rate update

#### Investment Recommendation
- **🟢 Strong Buy**: THB strengthening significantly with low volatility
- **🟡 Moderate Buy/Neutral**: Mixed signals or moderate trends
- **🔴 Hold/Wait**: THB weakening, not optimal for USD investment

#### Trend Analysis
- **7-Day/30-Day Trend**: Percentage change over the period
- **Volatility**: Market stability indicator
- **Projection**: Predicted rate change for the next week

#### Market Insights
- **Historical Analysis**: High, low, and average rates
- **Risk Assessment**: Current market risk level
- **Investment Timing**: Recommendations based on historical patterns

## Technical Details

### Architecture
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Charts**: Chart.js for data visualization
- **Backend**: Node.js with Express.js
- **SMS Service**: Twilio API
- **Data Storage**: LocalStorage for settings, In-memory for alerts

### API Endpoints

The SMS service provides the following endpoints:

- `POST /api/send-alert` - Send SMS alert
- `POST /api/register-alert` - Register/update alert settings
- `POST /api/check-alerts` - Check and trigger alerts
- `GET /api/alerts-status` - Get active alerts status
- `GET /api/health` - Service health check

### Exchange Rate Data

The application uses free exchange rate APIs with fallback to simulated data for demonstration purposes. For production use, consider upgrading to:

- [Alpha Vantage](https://www.alphavantage.co/)
- [Fixer.io](https://fixer.io/)
- [ExchangeRate-API](https://exchangerate-api.com/)

## Investment Strategy Tips

### When to Convert THB to USD

1. **Strong Buy Signals**
   - THB strengthening >2% in 7 days
   - Low volatility (<2%)
   - Rate above historical average

2. **Moderate Buy Signals**
   - THB strengthening 0.5-2% in 7 days
   - Moderate volatility (2-3%)
   - Stable trend patterns

3. **Hold/Wait Signals**
   - THB weakening >2%
   - High volatility (>3%)
   - Uncertain market conditions

### Risk Management

- **Dollar-Cost Averaging**: Make regular small conversions instead of large one-time conversions
- **Set Targets**: Use alerts to catch favorable rates automatically
- **Monitor Trends**: Don't rely solely on current rates; consider 30-day trends
- **Diversify Timing**: Spread conversions across different market conditions

## Troubleshooting

### SMS Alerts Not Working

1. **Check Twilio Configuration**
   - Verify Account SID and Auth Token
   - Ensure Twilio phone number is correct
   - Check account balance (for paid accounts)

2. **Phone Number Issues**
   - Use international format (+country code)
   - Verify number with Twilio (trial accounts)
   - Check for typos in the phone number

3. **Service Issues**
   - Ensure SMS service is running (`npm start`)
   - Check console logs for error messages
   - Verify network connectivity

### Exchange Rate Data Issues

1. **API Limitations**
   - Free APIs have rate limits
   - Some APIs require registration
   - Consider upgrading to paid services for production

2. **Network Issues**
   - Check internet connectivity
   - Verify API endpoints are accessible
   - Look for CORS issues in browser console

## Customization

### Modifying Alert Logic
Edit the `checkAlerts()` method in `script.js` to customize when alerts are triggered.

### Adding New Chart Periods
Modify the `getPeriodDays()` method and add new buttons in the HTML.

### Changing Investment Recommendations
Update the `updateInvestmentRecommendation()` method to adjust the logic for buy/sell/hold signals.

## Security Considerations

- Never commit `.env` file to version control
- Use environment variables for sensitive data
- Implement rate limiting for production APIs
- Validate all user inputs
- Use HTTPS in production

## License

MIT License - feel free to use and modify for your investment needs.

## Disclaimer

This application is for educational and informational purposes only. It does not constitute financial advice. Always consult with qualified financial advisors before making investment decisions. Exchange rates are volatile and past performance does not guarantee future results.

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review console logs for error messages
3. Ensure all dependencies are properly installed
4. Verify Twilio configuration if using SMS alerts

---

**Happy Investing! 📈💰**
