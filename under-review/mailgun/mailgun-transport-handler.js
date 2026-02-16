/**
 * Mailgun Transport Handler Code Snippets
 * 
 * DISABLED - Moved to under-review due to security vulnerabilities
 * Date: 2026-02-16
 * 
 * These code snippets were used in multiple event handlers:
 * - api/events/user-events.js
 * - api/events/node-health-checks.js
 * - api/events/api-health-checks.js
 * - api/events/upstream-health-checks.js
 */

// ============================================================
// REQUIRE STATEMENT (used at top of event files)
// ============================================================
// var mg = require('nodemailer-mailgun-transport');


// ============================================================
// TRANSPORT CREATION (used in createTransporter function)
// ============================================================
/*
switch(settings[0].data.default_transport) {
    case "smtp":
        result.transporter = nodemailer.createTransport(transport.settings);
        break;
    case "mailgun":
        result.transporter = nodemailer.createTransport(mg(transport.settings));
        break;
}
*/


// ============================================================
// RE-ENABLEMENT INSTRUCTIONS
// ============================================================
/*
To re-enable Mailgun support:

1. Update package.json:
   npm install nodemailer-mailgun-transport@latest --save

2. Check for security vulnerabilities:
   npm audit

3. If mailgun-js dependencies are secure, proceed:

4. In each event handler, add back the require:
   var mg = require('nodemailer-mailgun-transport');

5. In createTransporter() switch statement, add:
   case "mailgun":
       result.transporter = nodemailer.createTransport(mg(transport.settings));
       break;

6. In api/models/EmailTransport.js, add mailgun config back to settings array

7. Run tests:
   npm test

8. Test email sending with Mailgun transport
*/

module.exports = {
    // Preserved for documentation only
};
