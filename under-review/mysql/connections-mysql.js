# MySQL Connection Configuration (Original)

**Source:** Originally in `config/connections.js`  
**Status:** DISABLED - preserved here for reference

```javascript
/**
 * MySQL is the world's most popular relational database.
 * http://en.wikipedia.org/wiki/MySQL
 *
 * Run:
 * npm install sails-mysql
 */
mysql: {
  adapter: 'sails-mysql',
  url: process.env.DB_URI || null,
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || null,
  database: process.env.DB_DATABASE || 'konga_database'
}
```

---

**To re-enable:** Copy this configuration block back to `config/connections.js`  
**Warning:** Only do this after satisfying all security requirements in README.md
