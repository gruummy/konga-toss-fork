/**
 * Mailgun Email Transport Configuration
 * 
 * DISABLED - Moved to under-review due to security vulnerabilities
 * Date: 2026-02-16
 * 
 * This configuration was part of api/models/EmailTransport.js
 * To re-enable: Add this object back to the defaultModel.settings array
 */

module.exports = {
    "name": "mailgun",
    "description": "Send emails through Mailgun's Web API",
    "schema": [
        {
            name: "api_key",
            model: "auth.api_key",
            description: "The API key that you got from www.mailgun.com/cp",
            type: "text",
            required: true
        },
        {
            name: "domain",
            model: "auth.domain",
            description: "One of your domain names listed at your https://mailgun.com/app/domains",
            type: "text",
            required: true
        }
    ],
    "settings": {
        auth: {
            api_key: '',
            domain: ''
        }
    }
};
