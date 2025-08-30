// SMS Alert Service for THB to USD Exchange Rate Monitor
// This is a Node.js backend service that handles SMS alerts via Twilio

const express = require('express');
const cors = require('cors');
const twilio = require('twilio');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Twilio configuration
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

let client;
if (accountSid && authToken) {
    client = twilio(accountSid, authToken);
}

// Store active alerts (in production, use a database)
const activeAlerts = new Map();

// SMS Alert endpoint
app.post('/api/send-alert', async (req, res) => {
    try {
        const { phoneNumber, message, rate, threshold } = req.body;
        
        if (!phoneNumber || !message) {
            return res.status(400).json({ 
                success: false, 
                error: 'Phone number and message are required' 
            });
        }

        // Check if Twilio is configured
        if (!client) {
            console.log('SMS Alert (Demo Mode):', {
                to: phoneNumber,
                message: message,
                rate: rate,
                threshold: threshold
            });
            
            return res.json({ 
                success: true, 
                message: 'Alert logged (Demo mode - Twilio not configured)',
                demo: true
            });
        }

        // Send SMS via Twilio
        const smsMessage = await client.messages.create({
            body: message,
            from: twilioPhoneNumber,
            to: phoneNumber
        });

        console.log('SMS sent successfully:', smsMessage.sid);
        
        res.json({ 
            success: true, 
            message: 'SMS alert sent successfully',
            messageSid: smsMessage.sid
        });

    } catch (error) {
        console.error('Error sending SMS:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to send SMS alert',
            details: error.message
        });
    }
});

// Register alert endpoint
app.post('/api/register-alert', (req, res) => {
    try {
        const { phoneNumber, threshold, enabled } = req.body;
        
        if (!phoneNumber || !threshold) {
            return res.status(400).json({ 
                success: false, 
                error: 'Phone number and threshold are required' 
            });
        }

        const alertId = `${phoneNumber}_${threshold}`;
        
        if (enabled) {
            activeAlerts.set(alertId, {
                phoneNumber,
                threshold,
                createdAt: new Date(),
                triggered: false
            });
            
            console.log('Alert registered:', { phoneNumber, threshold });
        } else {
            activeAlerts.delete(alertId);
            console.log('Alert removed:', { phoneNumber, threshold });
        }

        res.json({ 
            success: true, 
            message: enabled ? 'Alert registered successfully' : 'Alert removed successfully',
            activeAlerts: activeAlerts.size
        });

    } catch (error) {
        console.error('Error registering alert:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to register alert',
            details: error.message
        });
    }
});

// Check and trigger alerts endpoint
app.post('/api/check-alerts', async (req, res) => {
    try {
        const { currentRate } = req.body;
        
        if (!currentRate) {
            return res.status(400).json({ 
                success: false, 
                error: 'Current rate is required' 
            });
        }

        const triggeredAlerts = [];
        
        for (const [alertId, alert] of activeAlerts.entries()) {
            if (!alert.triggered && currentRate >= alert.threshold) {
                // Trigger alert
                const message = `🚨 THB Investment Alert: THB has strengthened to ${currentRate.toFixed(6)} USD per THB, reaching your target threshold of ${alert.threshold.toFixed(6)}. Consider investing in USD now!`;
                
                try {
                    if (client) {
                        await client.messages.create({
                            body: message,
                            from: twilioPhoneNumber,
                            to: alert.phoneNumber
                        });
                    }
                    
                    alert.triggered = true;
                    alert.triggeredAt = new Date();
                    
                    triggeredAlerts.push({
                        phoneNumber: alert.phoneNumber,
                        threshold: alert.threshold,
                        currentRate: currentRate
                    });
                    
                    console.log('Alert triggered for:', alert.phoneNumber);
                    
                } catch (smsError) {
                    console.error('Error sending alert SMS:', smsError);
                }
            }
        }

        res.json({ 
            success: true, 
            triggeredAlerts: triggeredAlerts.length,
            alerts: triggeredAlerts
        });

    } catch (error) {
        console.error('Error checking alerts:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to check alerts',
            details: error.message
        });
    }
});

// Reset triggered alerts (for testing)
app.post('/api/reset-alerts', (req, res) => {
    try {
        for (const alert of activeAlerts.values()) {
            alert.triggered = false;
            delete alert.triggeredAt;
        }
        
        res.json({ 
            success: true, 
            message: 'All alerts reset successfully',
            activeAlerts: activeAlerts.size
        });
        
    } catch (error) {
        console.error('Error resetting alerts:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to reset alerts',
            details: error.message
        });
    }
});

// Get active alerts status
app.get('/api/alerts-status', (req, res) => {
    try {
        const alerts = Array.from(activeAlerts.values()).map(alert => ({
            phoneNumber: alert.phoneNumber.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2'), // Mask phone number
            threshold: alert.threshold,
            triggered: alert.triggered,
            createdAt: alert.createdAt,
            triggeredAt: alert.triggeredAt
        }));
        
        res.json({ 
            success: true, 
            totalAlerts: activeAlerts.size,
            alerts: alerts,
            twilioConfigured: !!client
        });
        
    } catch (error) {
        console.error('Error getting alerts status:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to get alerts status',
            details: error.message
        });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        success: true, 
        message: 'SMS service is running',
        timestamp: new Date().toISOString(),
        twilioConfigured: !!client,
        activeAlerts: activeAlerts.size
    });
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Unhandled error:', error);
    res.status(500).json({ 
        success: false, 
        error: 'Internal server error',
        details: error.message
    });
});

// Start server
app.listen(port, () => {
    console.log(`SMS Alert Service running on port ${port}`);
    console.log(`Twilio configured: ${!!client}`);
    
    if (!client) {
        console.log('⚠️  Twilio not configured. SMS alerts will run in demo mode.');
        console.log('To enable SMS alerts, set these environment variables:');
        console.log('- TWILIO_ACCOUNT_SID');
        console.log('- TWILIO_AUTH_TOKEN');
        console.log('- TWILIO_PHONE_NUMBER');
    }
});

module.exports = app;
