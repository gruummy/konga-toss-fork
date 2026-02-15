# MongoDB Connection Configuration (Original)

**Source:** Originally in `config/connections.js`  
**Status:** DISABLED - preserved here for reference

```javascript
/**
 * MongoDB is the leading NoSQL database.
 * http://en.wikipedia.org/wiki/MongoDB
 *
 * Run:
 * npm install sails-mongo
 */
mongo: {
  adapter: 'sails-mongo',
  url: process.env.DB_URI || null,
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 27017,
  user: process.env.DB_USER || null,
  password: process.env.DB_PASSWORD || null,
  database: process.env.DB_DATABASE || 'konga_database'
}
```

---

**To re-enable:** Copy this configuration block back to `config/connections.js`  
**Warning:** Only do this after satisfying all security requirements in README.md
