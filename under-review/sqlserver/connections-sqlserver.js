# SQL Server Connection Configuration (Original)

**Source:** Originally in `config/connections.js`  
**Status:** DISABLED - preserved here for reference

```javascript
/**
 * More adapters:
 * https://github.com/balderdashy/sails
 */
sqlserver: {
  adapter: 'sails-sqlserver',
  url: process.env.DB_URI || null,
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || null,
  password: process.env.DB_PASSWORD || null,
  port: process.env.DB_PORT || 49150,
  database: process.env.DB_DATABASE || 'konga_database'
}
```

---

**To re-enable:** Copy this configuration block back to `config/connections.js`  
**Warning:** Only do this after satisfying all security requirements in README.md  
**Recommendation:** Use PostgreSQL instead
