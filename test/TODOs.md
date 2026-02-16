# Test TODOs - Konga Email & Notification Testing

**Status:** Not yet implemented  
**Priority:** Medium (Email features are optional but should be tested)  
**Created:** 2026-02-16

---

## Overview

Currently, Konga has **0 tests** for email functionality despite having 4 email-sending features across the application. This document outlines the test coverage gaps and implementation plan for comprehensive email testing.

---

## 🎯 Testing Goals

1. **Unit Tests:** Test email logic in isolation (no actual email sending)
2. **Integration Tests:** Test with mock SMTP server (MailHog, Ethereal)
3. **E2E Tests:** Test complete email flow from trigger to delivery
4. **Coverage Target:** 80%+ for email-related code

---

## 📧 Email Features Requiring Tests

### 1. User Activation Emails
**File:** [api/events/user-events.js](../api/events/user-events.js)  
**Function:** `notify(user, req)`

**Test Coverage Needed:**
- [ ] Email is sent when user registers
- [ ] Activation link is correctly generated
- [ ] Email contains correct user data
- [ ] Email format (HTML) is valid
- [ ] Sender address is correctly set
- [ ] Base URL is correctly determined (from settings or req)
- [ ] Error handling when transport fails

---

### 2. Kong Node Health Check Alerts
**File:** [api/events/node-health-checks.js](../api/events/node-health-checks.js)  
**Function:** `notify(node)`

**Test Coverage Needed:**
- [ ] Email is sent when node goes down
- [ ] Email contains correct node information
- [ ] Email is sent to all admin users
- [ ] Notification rate-limiting works (30 min interval)
- [ ] Email is not sent when node recovers
- [ ] Email contains last checked timestamp
- [ ] Email contains failure reason (unreachable, DB down)
- [ ] HTML notification format is correct

---

### 3. API Health Check Alerts
**File:** [api/events/api-health-checks.js](../api/events/api-health-checks.js)  
**Function:** `notify(hc)`

**Test Coverage Needed:**
- [ ] Email is sent when API health check fails
- [ ] Email contains correct endpoint information
- [ ] Email is sent to all admin users
- [ ] Notification rate-limiting works (15 min interval)
- [ ] Email contains failure count
- [ ] Email contains last check timestamp
- [ ] Email contains HTTP status/error details

---

### 4. Upstream Health Check Alerts
**File:** [api/events/upstream-health-checks.js](../api/events/upstream-health-checks.js)  
**Function:** `notify(hc, unhealthyTargets)`

**Test Coverage Needed:**
- [ ] Email is sent when upstream targets become unhealthy
- [ ] Email contains list of unhealthy targets
- [ ] Email is sent to all admin users
- [ ] Notification rate-limiting works (15 min interval)
- [ ] Email contains Kong connection information
- [ ] Email distinguishes between UNHEALTHY and DNS_ERROR states

---

## 🛠️ SMTP Test Tools

### Option 1: MailHog (Recommended)
**Why:** Simple, lightweight, web UI, Docker-friendly

```yaml
# docker-compose-test.yml
version: '3.8'
services:
  mailhog:
    image: mailhog/mailhog:latest
    ports:
      - "1025:1025"  # SMTP
      - "8025:8025"  # Web UI
```

**Configuration:**
```javascript
// test/config/email-test.js
module.exports = {
  smtp: {
    host: 'localhost',
    port: 1025,
    auth: false
  }
};
```

**Advantages:**
- ✅ Web UI to inspect emails (http://localhost:8025)
- ✅ REST API to fetch emails programmatically
- ✅ No authentication required
- ✅ Easy Docker setup

---

### Option 2: Ethereal Email
**Why:** No setup, free online service

```javascript
// test/helpers/ethereal-setup.js
const nodemailer = require('nodemailer');

async function createTestAccount() {
  let testAccount = await nodemailer.createTestAccount();
  return {
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass
    }
  };
}
```

**Advantages:**
- ✅ No Docker required
- ✅ Instant setup
- ✅ View emails at ethereal.email
- ❌ Requires internet connection

---

### Option 3: smtp-tester (npm package)
**Why:** Programmatic, no external dependencies

```bash
npm install --save-dev smtp-tester
```

```javascript
// test/helpers/smtp-mock.js
const smtpTester = require('smtp-tester');

const mailServer = smtpTester.init(1025);

mailServer.bind((addr, id, email) => {
  // email.body, email.headers
});
```

**Advantages:**
- ✅ Fully programmatic
- ✅ No external services
- ✅ Fast
- ❌ No web UI

---

## 📝 Test Implementation Plan

### Phase 1: Test Infrastructure Setup (2-4 hours)

**Tasks:**
- [ ] Add MailHog to docker-compose-test.yml
- [ ] Create test/config/email-test.js with SMTP config
- [ ] Create test/helpers/email-helper.js with utility functions:
  ```javascript
  // test/helpers/email-helper.js
  module.exports = {
    // Wait for email to arrive
    async waitForEmail(timeout = 5000) { },
    
    // Fetch emails from MailHog API
    async getEmails() { },
    
    // Clear all emails
    async clearEmails() { },
    
    // Get latest email
    async getLatestEmail() { },
    
    // Assert email was sent
    async assertEmailSent(to, subject) { }
  };
  ```
- [ ] Update test/bootstrap.test.js to configure email test transport
- [ ] Add test/README.md with email testing instructions

---

### Phase 2: Unit Tests (4-6 hours)

#### 2.1 EmailTransport Model Tests
**File:** `test/unit/models/EmailTransport.test.js`

```javascript
describe('EmailTransport Model', function() {
  it('should have SMTP transport configuration');
  it('should have Mailgun transport configuration');
  it('should validate required fields');
  it('should only allow one active transport');
});
```

---

#### 2.2 User Events Tests
**File:** `test/unit/events/user-events.test.js`

```javascript
describe('User Events', function() {
  describe('notify()', function() {
    it('should generate correct activation link');
    it('should use settings.basePath if provided');
    it('should fallback to req host if no basePath');
    it('should send email with correct recipient');
    it('should send email with correct subject');
    it('should include activation token in link');
    it('should handle transporter creation errors gracefully');
  });
  
  describe('createTransporter()', function() {
    it('should create SMTP transporter');
    it('should create Mailgun transporter');
    it('should return null if no transport configured');
  });
});
```

---

#### 2.3 Health Check Events Tests
**File:** `test/unit/events/node-health-checks.test.js`

```javascript
describe('Node Health Checks', function() {
  describe('notify()', function() {
    it('should send email to all admin users');
    it('should include node name in email');
    it('should include failure reason in email');
    it('should respect notification interval (30 min)');
    it('should not send duplicate notifications');
    it('should handle missing admin users gracefully');
  });
  
  describe('makeHTMLNotification()', function() {
    it('should generate valid HTML');
    it('should include all node details');
    it('should format timestamps correctly');
  });
});
```

---

### Phase 3: Integration Tests (6-8 hours)

#### 3.1 User Activation Flow
**File:** `test/integration/email/user-activation.test.js`

```javascript
const emailHelper = require('../../helpers/email-helper');

describe('User Activation Email Integration', function() {
  beforeEach(async function() {
    await emailHelper.clearEmails();
  });
  
  it('should send activation email when user registers', async function() {
    // Create user via API
    const res = await request(sails.hooks.http.app)
      .post('/api/user')
      .send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      });
    
    // Wait for email
    const email = await emailHelper.waitForEmail(5000);
    
    // Assert email properties
    expect(email.to).to.include('test@example.com');
    expect(email.subject).to.equal('Welcome to Konga');
    expect(email.html).to.include('/auth/activate/');
    expect(email.html).to.include(res.body.activationToken);
  });
  
  it('should use configured sender name and address', async function() {
    // Configure settings
    await sails.models.settings.update({}, {
      data: {
        email_default_sender_name: 'Konga Admin',
        email_default_sender: 'admin@konga.local'
      }
    });
    
    // Trigger email
    // ...
    
    const email = await emailHelper.getLatestEmail();
    expect(email.from).to.include('Konga Admin');
    expect(email.from).to.include('admin@konga.local');
  });
});
```

---

#### 3.2 Health Check Alerts
**File:** `test/integration/email/health-check-alerts.test.js`

```javascript
describe('Health Check Alert Integration', function() {
  it('should send email when Kong node goes down', async function() {
    // Create node with invalid URL
    const node = await sails.models.kongnode.create({
      name: 'test-node',
      kong_admin_url: 'http://invalid-host:8001',
      health_checks_enabled: true
    });
    
    // Trigger health check
    await NodeHealthChecks.start(node);
    
    // Wait for check to fail and email to send
    await new Promise(resolve => setTimeout(resolve, 65000)); // >1 minute
    
    const email = await emailHelper.getLatestEmail();
    expect(email.subject).to.include('node is down');
    expect(email.html).to.include('test-node');
  });
  
  it('should not spam emails (respect 30 min interval)', async function() {
    // Trigger multiple failures
    // ...
    
    const emails = await emailHelper.getEmails();
    expect(emails.length).to.equal(1); // Only one email despite multiple failures
  });
});
```

---

### Phase 4: E2E Tests (4-6 hours)

#### 4.1 Complete User Registration Flow
**File:** `test/e2e/user-registration-flow.test.js`

```javascript
describe('E2E: User Registration with Email Activation', function() {
  it('should complete full registration and activation flow', async function() {
    // 1. Register user
    const registerRes = await request(sails.hooks.http.app)
      .post('/register')
      .send({
        username: 'e2e-user',
        email: 'e2e@example.com',
        password: 'Test123!@#'
      });
    
    expect(registerRes.status).to.equal(200);
    
    // 2. Check email was sent
    const email = await emailHelper.waitForEmail();
    expect(email.to).to.include('e2e@example.com');
    
    // 3. Extract activation link
    const linkMatch = email.html.match(/href="([^"]*\/auth\/activate\/[^"]*)"/);
    expect(linkMatch).to.exist;
    const activationLink = linkMatch[1];
    
    // 4. User should not be active yet
    let user = await sails.models.user.findOne({
      username: 'e2e-user'
    });
    expect(user.active).to.be.false;
    
    // 5. Click activation link (simulate)
    const activateRes = await request(sails.hooks.http.app)
      .get(new URL(activationLink).pathname);
    
    expect(activateRes.status).to.equal(200);
    
    // 6. User should now be active
    user = await sails.models.user.findOne({
      username: 'e2e-user'
    });
    expect(user.active).to.be.true;
    
    // 7. User can now login
    const loginRes = await request(sails.hooks.http.app)
      .post('/login')
      .send({
        identifier: 'e2e-user',
        password: 'Test123!@#'
      });
    
    expect(loginRes.status).to.equal(200);
    expect(loginRes.body.token).to.exist;
  });
});
```

---

#### 4.2 Complete Health Monitoring Flow
**File:** `test/e2e/health-monitoring-flow.test.js`

```javascript
describe('E2E: Health Monitoring with Email Alerts', function() {
  it('should monitor Kong node and send alert when down', async function() {
    // Setup: Create admin user with email
    const admin = await createAdminUser({
      email: 'admin@test.com'
    });
    
    // Setup: Configure email transport
    await configureEmailTransport();
    
    // Setup: Enable email notifications
    await enableHealthCheckNotifications();
    
    // Action: Add Kong node with bad URL
    const node = await addKongNode({
      name: 'failing-node',
      kong_admin_url: 'http://localhost:9999', // Non-existent
      health_checks_enabled: true
    });
    
    // Wait for health check cron to run
    await waitForHealthCheck(65000); // >1 minute
    
    // Assert: Email was sent to admin
    const emails = await emailHelper.getEmails();
    expect(emails).to.have.lengthOf(1);
    expect(emails[0].to).to.include('admin@test.com');
    expect(emails[0].subject).to.include('node is down');
    
    // Assert: Node health status is updated in database
    const updatedNode = await sails.models.kongnode.findOne({
      id: node.id
    });
    expect(updatedNode.health_check_details.isHealthy).to.be.false;
  });
});
```

---

## 🧪 Test Utilities to Create

### 1. Email Helper
**File:** `test/helpers/email-helper.js`

```javascript
const axios = require('axios');

module.exports = {
  MAILHOG_API: 'http://localhost:8025/api/v2',
  
  async getEmails() {
    const res = await axios.get(`${this.MAILHOG_API}/messages`);
    return res.data.items || [];
  },
  
  async getLatestEmail() {
    const emails = await this.getEmails();
    return emails.length > 0 ? emails[0] : null;
  },
  
  async clearEmails() {
    await axios.delete(`${this.MAILHOG_API}/messages`);
  },
  
  async waitForEmail(timeout = 5000) {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      const email = await this.getLatestEmail();
      if (email) return email;
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    throw new Error('No email received within timeout');
  },
  
  async assertEmailSent(to, subject) {
    const emails = await this.getEmails();
    const found = emails.find(email => 
      email.To.includes(to) && email.Content.Headers.Subject.includes(subject)
    );
    if (!found) {
      throw new Error(`No email sent to ${to} with subject "${subject}"`);
    }
    return found;
  }
};
```

---

### 2. Test Admin User Helper
**File:** `test/helpers/admin-user-helper.js`

```javascript
module.exports = {
  async createAdminUser(data = {}) {
    const user = await sails.models.user.create({
      username: data.username || 'test-admin',
      email: data.email || 'admin@test.com',
      firstName: data.firstName || 'Test',
      lastName: data.lastName || 'Admin',
      admin: true,
      active: true,
      ...data
    }).fetch();
    
    // Create passport
    await sails.models.passport.create({
      user: user.id,
      protocol: 'local',
      password: data.password || 'admin123'
    });
    
    return user;
  },
  
  async getAdminEmails() {
    const admins = await sails.models.user.find({
      admin: true,
      active: true
    });
    return admins.map(user => user.email);
  }
};
```

---

### 3. Email Transport Config Helper
**File:** `test/helpers/email-transport-helper.js`

```javascript
module.exports = {
  async configureTestSMTP() {
    // Configure test SMTP transport
    await sails.models.emailtransport.destroy({});
    
    const transport = await sails.models.emailtransport.create({
      name: 'smtp',
      description: 'Test SMTP (MailHog)',
      active: true,
      settings: {
        host: 'localhost',
        port: 1025,
        secure: false,
        auth: false
      }
    }).fetch();
    
    await sails.models.settings.update({}, {
      data: {
        default_transport: 'smtp',
        email_default_sender: 'test@konga.local',
        email_default_sender_name: 'Konga Test',
        email_notifications: true,
        notify_when: {
          node_down: { active: true },
          api_down: { active: true }
        }
      }
    });
    
    return transport;
  }
};
```

---

## 📦 Required Dependencies

Add to `package.json` (devDependencies):

```json
{
  "devDependencies": {
    "axios": "^1.6.0",
    "smtp-tester": "^1.0.0"
  }
}
```

---

## 🐳 Docker Compose for Testing

**File:** `docker-compose-test.yml`

```yaml
version: '3.8'

services:
  mailhog:
    image: mailhog/mailhog:latest
    container_name: konga-mailhog
    ports:
      - "1025:1025"  # SMTP port
      - "8025:8025"  # Web UI
    networks:
      - konga-test

  postgres-test:
    image: postgres:13
    container_name: konga-postgres-test
    environment:
      POSTGRES_DB: konga_test
      POSTGRES_USER: konga
      POSTGRES_PASSWORD: test123
    ports:
      - "5433:5432"
    networks:
      - konga-test

networks:
  konga-test:
    driver: bridge
```

**Usage:**
```bash
# Start test services
docker-compose -f docker-compose-test.yml up -d

# Run tests
NODE_ENV=test npm test

# View emails in browser
open http://localhost:8025

# Stop test services
docker-compose -f docker-compose-test.yml down
```

---

## 📋 Test Execution Plan

### Manual Testing (Before Automation)
1. Start MailHog: `docker-compose -f docker-compose-test.yml up mailhog`
2. Start Konga with test DB: `NODE_ENV=test node app.js`
3. Configure SMTP in UI (localhost:1025)
4. Trigger each email feature manually
5. Verify emails in MailHog UI (http://localhost:8025)

### Automated Testing (After Implementation)
```bash
# Run all tests including email tests
npm test

# Run only email tests
npm test -- --grep "email|notification|alert"

# Run with coverage
npm run test:coverage
```

---

## ✅ Success Criteria

- [ ] All email features have unit tests
- [ ] All email features have integration tests
- [ ] At least 1 E2E test per major email flow
- [ ] Test coverage >80% for email-related files
- [ ] MailHog setup documented
- [ ] Tests run in CI/CD pipeline
- [ ] No flaky tests (consistent pass/fail)

---

## 🎯 Priority Order

**High Priority (Critical Functionality):**
1. Node Health Check Alerts (most important for ops)
2. Email Transport Configuration Tests

**Medium Priority:**
3. API Health Check Alerts
4. Upstream Health Check Alerts

**Low Priority (Optional Features):**
5. User Activation Emails (if self-registration is disabled)

---

## 📚 Additional Resources

- [MailHog Documentation](https://github.com/mailhog/MailHog)
- [Ethereal Email](https://ethereal.email/)
- [nodemailer Testing Guide](https://nodemailer.com/about/testing/)
- [Mocha Testing Best Practices](https://mochajs.org/#best-practices)

---

## 📝 Notes

- Email tests may be slower than unit tests (wait for SMTP)
- Consider timeout configuration for email tests (at least 10 seconds)
- Mock external services (Mailgun) in unit tests, use real SMTP (MailHog) in integration tests
- Clean up test emails between tests to avoid interference
- Test email HTML rendering in different clients (future improvement)

---

**Status:** Ready for implementation  
**Estimated Effort:** 16-24 hours  
**Impact:** High (closes major testing gap)  
**Next Step:** Setup MailHog and create first integration test

