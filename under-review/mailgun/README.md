# Mailgun Email Transport - DISABLED

**Status:** ❌ DISABLED  
**Date:** 2026-02-16  
**Reason:** Security vulnerabilities in `nodemailer-mailgun-transport` dependencies

---

## Overview

Mailgun support has been temporarily disabled due to security vulnerabilities in the dependency chain:

- **Package:** `nodemailer-mailgun-transport@1.4.0`
- **Vulnerabilities:** 5 (1 critical, 2 high, 2 moderate)
  - **Critical:** Improper parsing of octal bytes in netmask (GHSA-4c7m-wxvm-r7gc)
  - **High:** Code Injection in pac-resolver (GHSA-9j49-mfvp-vmhm) - 2 instances
  - **Moderate:** netmask octal input mishandling - 2 instances

**Dependency chain:**
```
nodemailer-mailgun-transport 
  └─ mailgun-js
      └─ proxy-agent
          └─ pac-proxy-agent
              └─ pac-resolver
                  └─ netmask (VULNERABLE)
```

---

## What Was Mailgun Used For?

Mailgun was one of **three email transport options** in Konga:

1. ✅ **SMTP** (still available) - Standard SMTP server
2. ✅ **sendmail** (still available) - Local sendmail command
3. ❌ **Mailgun** (DISABLED) - Mailgun Web API

### Features That Used Mailgun:

**Optional Email Notifications:**
- User registration/activation emails ("Welcome to Konga")
- Kong Node health check alerts
- API health check alerts  
- Upstream health check alerts

**Impact:** If Mailgun was not configured, this change has **ZERO impact** on your deployment.

---

## Supported Email Transports

After this change, two email transport options remain:

### 1. SMTP Transport (Recommended)

Configure via Admin UI or directly in database:

```javascript
{
  name: "smtp",
  settings: {
    host: 'smtp.example.com',
    port: 587,
    auth: {
      user: 'your-email@example.com',
      pass: 'your-password'
    },
    secure: false  // true for port 465
  }
}
```

### 2. sendmail Transport

Uses local sendmail command:

```javascript
{
  name: "sendmail",
  settings: {
    sendmail: true
  }
}
```

---

## Files Preserved

All Mailgun-related code has been preserved in this directory:

| File | Description |
|------|-------------|
| [mailgun-transport-config.js](./mailgun-transport-config.js) | EmailTransport model configuration |
| [mailgun-transport-handler.js](./mailgun-transport-handler.js) | Code snippets from event handlers |
| [README.md](./README.md) | This file - complete documentation |

---

## Code Changes Made

### Files Modified:

1. **api/models/EmailTransport.js**
   - Removed mailgun transport configuration from settings array
   - Added comment indicating removal

2. **api/events/user-events.js**
   - Removed `require('nodemailer-mailgun-transport')`
   - Removed mailgun case from switch statement
   - Added guard to prevent mailgun usage

3. **api/events/node-health-checks.js**
   - Same changes as user-events.js

4. **api/events/api-health-checks.js**
   - Same changes as user-events.js

5. **api/events/upstream-health-checks.js**
   - Same changes as user-events.js

6. **package.json**
   - Removed `nodemailer-mailgun-transport` dependency

---

## Migration Guide

### For Existing Mailgun Users:

If you were using Mailgun email transport, you need to switch to SMTP or sendmail:

#### Option 1: Switch to SMTP

1. Log into Konga Admin UI
2. Go to Settings → Email Transport
3. Select "SMTP" transport
4. Configure your SMTP server details
5. Test email sending

#### Option 2: Switch to sendmail

1. Ensure sendmail is installed on your server
2. Log into Konga Admin UI
3. Go to Settings → Email Transport
4. Select "sendmail" transport
5. Test email sending

#### Option 3: Use Mailgun via SMTP

Mailgun also supports SMTP! Configure SMTP transport with Mailgun's SMTP credentials:

```javascript
{
  host: 'smtp.mailgun.org',
  port: 587,
  auth: {
    user: 'postmaster@your-domain.mailgun.org',
    pass: 'your-mailgun-smtp-password'
  },
  secure: false
}
```

Get credentials from: https://app.mailgun.com/app/sending/domains

---

## Re-enablement Criteria

Mailgun support will be re-enabled when:

1. ✅ `nodemailer-mailgun-transport` is updated to a secure version
2. ✅ All dependencies (mailgun-js, proxy-agent, pac-resolver, netmask) are patched
3. ✅ npm audit shows 0 vulnerabilities in the dependency chain
4. ✅ Thorough testing confirms no regressions

**Check Status:**
```bash
npm info nodemailer-mailgun-transport
npm audit --package nodemailer-mailgun-transport
```

---

## Re-enablement Instructions

When security issues are resolved:

### Step 1: Install Updated Package

```bash
npm install nodemailer-mailgun-transport@latest --save
npm audit  # Verify no vulnerabilities
```

### Step 2: Restore Code

1. **api/models/EmailTransport.js**
   - Add back mailgun configuration from `mailgun-transport-config.js`

2. **Event Handlers** (4 files)
   - Add: `var mg = require('nodemailer-mailgun-transport');`
   - Add mailgun case to switch statements (see `mailgun-transport-handler.js`)

### Step 3: Test

```bash
npm test  # Run test suite
# Manual test: Configure Mailgun in UI and send test email
```

### Step 4: Documentation

Update `toss/Security-Status-Tracker.md` with re-enablement details.

---

## Alternative: Modern Mailgun SDK

Consider using the official Mailgun SDK instead:

**Package:** `mailgun.js` (official, actively maintained)

**Advantages:**
- Official Mailgun SDK
- Better security maintenance
- More features
- Active development

**Migration Required:**
- Code changes to use mailgun.js API directly
- Update createTransporter() logic
- Test email sending

---

## Security Context

**Vulnerabilities in nodemailer-mailgun-transport@1.4.0:**

```
Critical: netmask - Improper parsing of octal bytes
  Path: nodemailer-mailgun-transport > mailgun-js > 
        proxy-agent > pac-proxy-agent > pac-resolver > netmask
  CVE: GHSA-4c7m-wxvm-r7gc

High: Code Injection in pac-resolver (2x)
  Path: nodemailer-mailgun-transport > mailgun-js > 
        proxy-agent > pac-proxy-agent > pac-resolver
  CVE: GHSA-9j49-mfvp-vmhm

Moderate: netmask octal input mishandling (2x)
  Package: netmask
```

**Impact if Exploited:**
- Remote Code Execution (RCE) possible via crafted proxy configuration
- IP address parsing vulnerabilities
- Security bypass in network filtering

**Mitigation:**
- Mailgun support completely removed
- No vulnerable code executed
- SMTP transport remains secure alternative

---

## Testing

After re-enablement, test:

### 1. Basic Functionality

```bash
npm test  # All 62 tests should pass
```

### 2. Email Transport Configuration

- [ ] Can configure Mailgun transport in UI
- [ ] Can select Mailgun as default transport
- [ ] API key and domain validation works

### 3. Email Sending

- [ ] User registration emails send successfully
- [ ] Health check alert emails work
- [ ] Email logs show no errors

### 4. Security

```bash
npm audit  # Should show 0 vulnerabilities
```

---

## Questions?

For questions or issues, see:
- Main project documentation: [../toss/README.md](../../toss/README.md)
- Security tracker: [../toss/Security-Status-Tracker.md](../../toss/Security-Status-Tracker.md)

---

**Last Updated:** 2026-02-16  
**Status:** DISABLED - awaiting security patches  
**Estimated Re-enablement:** Unknown (depends on upstream fixes)
