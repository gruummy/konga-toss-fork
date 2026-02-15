# MongoDB Adapter - Under Review

**Status:** 🔴 DISABLED  
**Package:** `sails-mongo` ^0.12.3  
**Date Disabled:** 2026-02-15

---

## Reason for Disabling

The `sails-mongo` adapter version 0.12.3 has multiple security vulnerabilities and is severely outdated (released ~2016). It is part of the legacy Sails.js 0.12 ecosystem and cannot be safely updated without upgrading to Sails.js 1.x first.

**Security Issues:**
- Multiple high severity CVEs in MongoDB driver dependencies
- Outdated mongodb driver (2.x from 2016)
- No longer actively maintained for Sails 0.12
- Significant contributor to overall vulnerability count
- Deprecated connection methods (no longer compatible with modern MongoDB 4.x/5.x)

---

## Original Configuration

**Connection Config (from `config/connections.js`):**
```javascript
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

**Environment Variables:**
- `DB_ADAPTER=mongo`
- `DB_HOST` (default: localhost)
- `DB_PORT` (default: 27017)
- `DB_USER` (optional)
- `DB_PASSWORD` (optional)
- `DB_DATABASE` (default: konga_database)
- `DB_URI` (alternative: mongodb:// connection string)

---

## Preserved Code

**Files in this directory:**
- `connections-mongodb.js` - Original connection configuration snippet

**Original Repository Locations:**
- Package dependency: [package.json:L49](../../package.json) - Removed from dependencies
- Connection config: [config/connections.js:L53-L65](../../config/connections.js) - Removed, now shows disabled message
- Initialization code: None (MongoDB adapter handled initialization automatically)
- Initialization switch: [makedb/index.js:L16](../../makedb/index.js) - Replaced with error guard
- Session store config: [config/session.js:L60-L77](../../config/session.js) - Commented out (optional feature)

**Note:** MongoDB did not have a dedicated makedb initialization file (initialization was handled automatically by the adapter)

---

## Migration to PostgreSQL

If you were using MongoDB, migrate to PostgreSQL instead:

### Why PostgreSQL Over MongoDB for Konga?

**Konga's Data Model:**
- Konga primarily stores **structured, relational data** (Kong nodes, services, routes, consumers)
- Most queries are simple CRUD operations
- Transactional consistency is important
- No need for MongoDB's document flexibility

**PostgreSQL Advantages:**
- JSONB support (can store JSON documents if needed)
- Better query optimizer for relational data
- ACID compliance (important for Kong admin operations)
- More mature tooling and backup solutions
- Better security posture

### Migration Steps

#### 1. Install PostgreSQL
```bash
# Using Docker
docker run --name konga-postgres \
  -e POSTGRES_PASSWORD=admin1! \
  -e POSTGRES_DB=konga_database \
  -p 5432:5432 \
  -d postgres:13

# Or install locally
# Ubuntu: sudo apt install postgresql
# Mac: brew install postgresql
```

#### 2. Update Environment Variables
```bash
export DB_ADAPTER=postgres
export DB_HOST=localhost
export DB_PORT=5432
export DB_USER=postgres
export DB_PASSWORD=admin1!
export DB_DATABASE=konga_database
```

#### 3. Data Migration (if needed)
```javascript
// MongoDB to PostgreSQL migration is complex
// Option 1: Manual export/import
mongoexport --db konga_database --collection users --out users.json
// Then write a Node.js script to import into PostgreSQL

// Option 2: Fresh start (recommended for testing)
// Let Konga auto-create schema in PostgreSQL
// Manually recreate Kong nodes, users, etc.
```

---

## Re-enablement Requirements

Before MongoDB can be re-enabled:

### Prerequisites
1. ✅ Sails.js upgraded to 1.x (enables sails-mongo 3.x+)
2. ✅ Modern sails-mongo package available and security-audited
3. ✅ Compatible with MongoDB 4.x/5.x servers
4. ✅ Security audit shows 0 critical/high vulnerabilities
5. ✅ Integration tests written and passing
6. ✅ Business case justification (why not use PostgreSQL?)

### Modern Package Information
- **sails-mongo 3.x:** Requires Sails.js 1.x
- **GitHub:** https://github.com/balderdashy/sails-mongo
- **Status:** Maintained for Sails 1.x, but less active than PostgreSQL adapter

### Estimated Timeline
- Phase 4 (Sails.js 1.x migration): 3-6 months
- MongoDB re-enablement: Additional 1-2 months after Sails upgrade
- **Lower priority** than other features (PostgreSQL covers use cases)

---

## Known Issues with Legacy Adapter

**sails-mongo 0.12.3 problems:**
- Uses ancient mongodb driver (2.x from 2016)
- No MongoDB 4.x/5.x compatibility
- Deprecated connection authentication methods
- Memory leaks under load
- Poor error handling
- Incompatible with Sails.js 1.x
- No support for modern MongoDB features (transactions, change streams)

**Why not just upgrade sails-mongo?**
- sails-mongo 3.x requires Sails.js 1.x (breaking change)
- Our current Sails.js 0.12 is incompatible
- Must upgrade entire framework first

---

## Session Store (Separate Concern)

**Note:** MongoDB was also used as an **optional session store** in `config/session.js`.

**Original session config:**
```javascript
// adapter: 'mongo',
// host: 'localhost',
// port: 27017,
// db: 'konga',
// collection: 'sessions',
// Or use connection string:
// url: 'mongodb://user:pass@host:port/database/collection',
```

**Alternative session stores:**
- **Redis** (recommended for production): Fast, efficient, built for sessions
- **PostgreSQL**: Can reuse database connection
- **In-memory**: Development only (default)

**Migration:**
```bash
# Use Redis for sessions (recommended)
npm install connect-redis@3.4.2 redis@2.8.0

# config/session.js
adapter: 'redis',
host: 'localhost',
port: 6379,
db: 0
```

---

## Testing Locally (NOT RECOMMENDED)

If you absolutely must test with MongoDB locally:

```bash
# 1. Install MongoDB server
docker run --name mongo -d -p 27017:27017 mongo:4.4

# 2. Install the vulnerable package (SECURITY RISK!)
npm install sails-mongo@0.12.3

# 3. Copy connection config back
# Copy contents of connections-mongodb.js to config/connections.js

# 4. Set environment
export DB_ADAPTER=mongo
export DB_HOST=localhost
export DB_PORT=27017
export DB_DATABASE=konga_database

# 5. Start Konga
npm start

# IMPORTANT: Do not commit these changes!
# IMPORTANT: This is for local testing only, NOT production!
```

---

## Contact

Questions about MongoDB disabling or migration support:
- See main README at `under-review/README.md`
- Check security tracker at `toss/Security-Status-Tracker.md`

---

**Last Updated:** 2026-02-15  
**Next Review:** After Sails.js 1.x migration (low priority)
