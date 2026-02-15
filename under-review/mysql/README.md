# MySQL Adapter - Under Review

**Status:** 🔴 DISABLED  
**Package:** `sails-mysql` ^0.11.5  
**Date Disabled:** 2026-02-15

---

## Reason for Disabling

The `sails-mysql` adapter version 0.11.5 has multiple security vulnerabilities and is severely outdated (released ~2016). It is part of the legacy Sails.js 0.12 ecosystem and cannot be safely updated without upgrading to Sails.js 1.x first.

**Security Issues:**
- Multiple critical and high severity CVEs in dependencies
- Outdated mysql driver with known vulnerabilities
- No longer actively maintained
- Part of the 112 critical vulnerabilities in baseline assessment

---

## Original Configuration

**Connection Config (from `config/connections.js`):**
```javascript
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

**Environment Variables:**
- `DB_ADAPTER=mysql`
- `DB_HOST` (default: localhost)
- `DB_PORT` (default: 3306)
- `DB_USER` (default: root)
- `DB_PASSWORD`
- `DB_DATABASE` (default: konga_database)
- `DB_URI` (alternative: full connection string)

---

## Preserved Code

**Files in this directory:**
- `makedb-mysql.js` - Original MySQL database initialization code
- `connections-mysql.js` - Original connection configuration snippet

**Original Repository Locations:**
- Package dependency: [package.json:L51](../../package.json) - Removed from dependencies
- Connection config: [config/connections.js:L36-L50](../../config/connections.js) - Removed, now shows disabled message
- Initialization code: `makedb/dbs/mysql.js` - Deleted from repository
  - Original file created: 2017-10-06
  - Deleted: 2026-02-15 (Phase 2)
  - Preserved at: `under-review/mysql/makedb-mysql.js`
- Initialization switch: [makedb/index.js:L14-L15](../../makedb/index.js) - Replaced with error guard

---

## Migration to PostgreSQL

If you were using MySQL, migrate to PostgreSQL instead:

### 1. Install PostgreSQL
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

### 2. Update Environment Variables
```bash
export DB_ADAPTER=postgres
export DB_HOST=localhost
export DB_PORT=5432
export DB_USER=postgres
export DB_PASSWORD=admin1!
export DB_DATABASE=konga_database
```

### 3. Optional: Migrate Existing Data
```bash
# Export from MySQL
mysqldump -u root -p konga_database > konga_backup.sql

# Convert MySQL dump to PostgreSQL format (requires pgloader or manual editing)
# This is non-trivial - consult migration tools documentation
```

---

## Re-enablement Requirements

Before MySQL can be re-enabled:

### Prerequisites
1. ✅ Sails.js upgraded to 1.x (enables sails-mysql 3.x+)
2. ✅ Modern sails-mysql package available (3.x branch)
3. ✅ Security audit shows 0 critical/high vulnerabilities
4. ✅ Integration tests written and passing
5. ✅ Performance benchmarks completed

### Modern Package Information
- **sails-mysql 3.x:** Requires Sails.js 1.x
- **GitHub:** https://github.com/balderdashy/sails-mysql
- **Status:** Actively maintained for Sails 1.x only

### Estimated Timeline
- Phase 4 (Sails.js 1.x migration): 3-6 months
- MySQL re-enablement: Additional 1-2 months after Sails upgrade

---

## Known Issues with Legacy Adapter

**sails-mysql 0.11.5 problems:**
- Uses ancient mysql driver (2.x from 2015)
- No prepared statement support
- Connection pooling issues
- Memory leaks under load
- No support for modern MySQL 8.x features
- Incompatible with Sails.js 1.x

**Why not just upgrade sails-mysql?**
- sails-mysql 3.x requires Sails.js 1.x (breaking change)
- Our current Sails.js 0.12 is incompatible
- Must upgrade entire framework first

---

## Alternative: Use PostgreSQL

PostgreSQL is **enterprise-grade** and well-supported:

**Advantages over MySQL:**
- Better standards compliance (ACID, SQL)
- Superior data integrity features
- More secure default configuration
- Better tooling and administration
- Konga's PostgreSQL adapter is more actively maintained

**Performance:**
- Comparable to MySQL for most workloads
- Better for complex queries and JSONB data
- Excellent concurrency handling

---

## Testing Locally (NOT RECOMMENDED)

If you absolutely must test with MySQL locally:

```bash
# 1. Install the vulnerable package (SECURITY RISK!)
npm install sails-mysql@0.11.5

# 2. Copy connection config back
# Copy contents of connections-mysql.js to config/connections.js

# 3. Restore makedb code
# Copy makedb-mysql.js back to makedb/dbs/mysql.js

# 4. Set environment
export DB_ADAPTER=mysql
export DB_HOST=localhost
export DB_PORT=3306
export DB_USER=root
export DB_PASSWORD=yourpassword
export DB_DATABASE=konga_database

# 5. Start Konga
npm start

# IMPORTANT: Do not commit these changes!
# IMPORTANT: This is for local testing only, NOT production!
```

---

## Contact

Questions about MySQL disabling or migration support:
- See main README at `under-review/README.md`
- Check security tracker at `toss/Security-Status-Tracker.md`

---

**Last Updated:** 2026-02-15  
**Next Review:** After Sails.js 1.x migration
