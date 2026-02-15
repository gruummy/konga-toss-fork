# Under Review - Temporarily Disabled Database Adapters

**Status:** DISABLED  
**Date:** 2026-02-15  
**Reason:** Security vulnerabilities in legacy database adapter packages

---

## Overview

This directory contains code and configurations for database adapters that have been **temporarily disabled** due to security vulnerabilities in their underlying npm packages. These adapters have been moved here for potential future re-enablement once the security issues are resolved.

---

## Disabled Adapters

### 🔴 MySQL (`sails-mysql`)
- **Package:** `sails-mysql` ^0.11.5
- **Status:** DISABLED
- **Reason:** Multiple critical vulnerabilities in outdated package
- **Vulnerabilities:** Part of the 112 critical vulnerabilities in baseline assessment
- **Original Locations:**
  - Package dependency: [package.json](../package.json) line 51 (removed)
  - Connection config: [config/connections.js](../config/connections.js) lines 36-50 (removed)
  - Initialization code: [makedb/dbs/mysql.js](../makedb/dbs/) (deleted, preserved here)
- **Preserved Files:** See `./mysql/` directory

### 🔴 MongoDB (`sails-mongo`)
- **Package:** `sails-mongo` ^0.12.3  
- **Status:** DISABLED
- **Reason:** Multiple high/critical vulnerabilities in outdated package
- **Vulnerabilities:** Significant contributor to overall vulnerability count
- **Original Locations:**
  - Package dependency: [package.json](../package.json) line 49 (removed)
  - Connection config: [config/connections.js](../config/connections.js) lines 53-65 (removed)
  - Initialization: Handled automatically by adapter (no dedicated file)
- **Preserved Files:** See `./mongodb/` directory

### 🔴 SQL Server (`sails-sqlserver`)
- **Package:** `sails-sqlserver` ^0.10.8
- **Status:** DISABLED
- **Reason:** Outdated package with known vulnerabilities, low usage priority
- **Vulnerabilities:** Contributing to high vulnerability count
- **Original Locations:**
  - Package dependency: [package.json](../package.json) line 52 (removed)
  - Connection config: [config/connections.js](../config/connections.js) lines 95-103 (removed)
  - Initialization: Handled automatically by adapter (no dedicated file)
- **Preserved Files:** See `./sqlserver/` directory

---

## Currently Supported Adapters

### ✅ LocalDiskDb (Development Only)
- **Package:** `sails-disk` ^0.10.10
- **Status:** ENABLED
- **Use Case:** Development, testing, demo environments
- **Security:** ✅ Safe - file-based storage, no network exposure
- **Limitations:** Not suitable for production, no concurrency support
- **Repository Locations:**
  - Package dependency: [package.json](../package.json) line 48
  - Connection config: [config/connections.js](../config/connections.js) lines 29-33
  - No initialization code needed (file-based)

### ✅ PostgreSQL
- **Package:** `sails-postgresql` ^0.11.4
- **Status:** ENABLED
- **Use Case:** Production deployments
- **Security:** ⚠️ Has vulnerabilities but significantly fewer than MySQL/MongoDB
- **Priority:** Will be upgraded in Phase 3 (requires Sails.js 1.x migration)
- **Repository Locations:**
  - Package dependency: [package.json](../package.json) line 49
  - Connection config: [config/connections.js](../config/connections.js) lines 68-80
  - Initialization code: [makedb/dbs/pg.js](../makedb/dbs/pg.js)
  - Initialization logic: [makedb/index.js](../makedb/index.js) lines 12-13

---

## Strategy & Rationale

### Why Disable These Adapters?

**Security First Approach:**
1. **Vulnerability Reduction:** Removing these 3 packages eliminates a significant portion of the 669 remaining vulnerabilities
2. **Risk Mitigation:** Outdated database adapters are a major attack surface
3. **Focus Resources:** Concentrate on securing 2 well-maintained adapters instead of 5 problematic ones
4. **Clean Foundation:** Build on a secure base before adding complexity

**Practical Considerations:**
- PostgreSQL is enterprise-grade and widely supported
- LocalDiskDb is sufficient for development and testing
- MySQL and MongoDB can be re-enabled after:
  1. Sails.js upgrade to 1.x (enables modern adapter versions)
  2. Security audit of updated adapters
  3. Comprehensive testing

### Transitional Deactivation Approach

**Phase 1: Immediate (Current)**
- ❌ Remove vulnerable dependencies from package.json
- ✅ Add build-time guards in code
- ✅ Provide clear error messages if user attempts to use disabled adapters
- ✅ Preserve all original code in `under-review/` for future restoration

**Phase 2: Code Guards**
- Connection configuration checks at startup
- User-friendly error messages explaining status:
  ```
  ERROR: MySQL adapter is currently disabled due to security vulnerabilities.
  Supported adapters: postgres, localDiskDb
  For more information, see: under-review/README.md
  ```

**Phase 3: Future Re-enablement (Post Sails.js 1.x Migration)**
- Update to modern adapter versions (sails-mysql 3.x, sails-mongo 3.x)
- Security audit of updated packages
- Comprehensive integration testing
- Update documentation and re-enable feature flags

---

## Directory Structure

```
under-review/
├── README.md                 # This file
├── mysql/
│   ├── README.md             # MySQL-specific notes
│   ├── connections.js        # Original MySQL connection config
│   └── makedb-mysql.js       # MySQL database initialization code
├── mongodb/
│   ├── README.md             # MongoDB-specific notes
│   └── connections.js        # Original MongoDB connection config
└── sqlserver/
    ├── README.md             # SQL Server-specific notes
    └── connections.js        # Original SQL Server connection config
```

---

## Code Changes Summary

### Modified Files

**package.json**
```diff
- "sails-mysql": "^0.11.5",
- "sails-mongo": "^0.12.3",
- "sails-sqlserver": "^0.10.8",
```

**config/connections.js**
```javascript
// MySQL, MongoDB, SQL Server configs moved to under-review/
// Only localDiskDb and postgres remain active
```

**makedb/index.js**
```javascript
// Added guards for disabled adapters:
case("mysql"):
case("mongo"):
case("sqlserver"):
    throw new Error(`${adapter} is currently disabled. See under-review/README.md`);
```

**bin/konga.js**
```javascript
// Updated error message to reflect supported adapters only
Sails.log.error("Supported adapters: postgres, localDiskDb");
```

---

## Testing Disabled Adapters

If you need to test with MySQL or MongoDB during development:

### Option 1: Manual Re-enable (Not Recommended)
1. Copy connection config from `under-review/{adapter}/connections.js` back to `config/connections.js`
2. Install the adapter: `npm install sails-mysql` or `npm install sails-mongo`
3. Run your tests
4. **IMPORTANT:** Do not commit these changes

### Option 2: Use PostgreSQL Instead (Recommended)
```bash
# Set up PostgreSQL (Docker example)
docker run --name konga-postgres -e POSTGRES_PASSWORD=admin1! -p 5432:5432 -d postgres:13

# Configure Konga
export DB_ADAPTER=postgres
export DB_HOST=localhost
export DB_PORT=5432
export DB_USER=postgres
export DB_PASSWORD=admin1!
export DB_DATABASE=konga_database

# Start Konga
npm start
```

### Option 3: Use LocalDiskDb (Development Only)
```bash
# No configuration needed - default adapter
npm start
```

---

## Re-enablement Checklist

Before re-enabling any disabled adapter, ensure:

- [ ] Sails.js upgraded to 1.x or later
- [ ] Modern adapter version available (3.x+)
- [ ] Security audit completed (npm audit shows 0 critical/high for adapter)
- [ ] Integration tests written and passing
- [ ] Documentation updated
- [ ] Migration guide provided for users
- [ ] Peer review completed

---

## Security Impact

### Vulnerability Reduction from Disabling These Adapters

**Expected Impact (Phase 2 - Current Action):**
- Removal of `sails-mysql`, `sails-mongo`, `sails-sqlserver` dependencies
- Estimated reduction: **50-150 vulnerabilities** (exact count pending npm audit)
- Focus remaining security work on 2 maintained adapters

**Before Removal:**
- Total vulnerabilities: 669
- Critical: 112
- High: 327

**After Removal (Estimated):**
- Total vulnerabilities: ~500-600
- Critical: ~60-80
- High: ~200-250

The exact numbers will be determined after running `npm install` and `npm audit` without these packages.

---

## Contact & Questions

If you have questions about disabled adapters or need to discuss re-enablement:

1. Review this README thoroughly
2. Check `toss/Security-Status-Tracker.md` for current security status
3. Review `toss/Security-Analysis-Priority-Fixes.md` for the roadmap
4. Contact the project maintainer with specific use case requirements

---

## Future Roadmap

### Short-term (Phases 2-3, Next 2-3 months)
1. ✅ Remove vulnerable adapter dependencies
2. ✅ Implement connection guards
3. ⏳ Complete security updates on PostgreSQL adapter
4. ⏳ Upgrade Node.js to 20.x LTS

### Mid-term (Phase 4, 3-6 months)
1. Upgrade Sails.js to 1.x
2. Evaluate modern MySQL/MongoDB adapter versions
3. Security audit of potential re-enablement
4. Decide: Re-enable or maintain PostgreSQL-only approach

### Long-term (6-12 months)
1. If re-enabling: Implement with modern adapters (3.x+)
2. Comprehensive testing across all adapters
3. Migration guides for users
4. Consider additional adapters (SQLite, cloud-native databases)

---

**Last Updated:** 2026-02-15  
**Next Review:** After Sails.js 1.x migration (Phase 4)  
**Status:** Active - adapters disabled, code preserved for future use
