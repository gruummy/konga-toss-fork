# SQL Server Adapter - Under Review

**Status:** 🔴 DISABLED  
**Package:** `sails-sqlserver` ^0.10.8  
**Date Disabled:** 2026-02-15

---

## Reason for Disabling

The `sails-sqlserver` adapter version 0.10.8 is severely outdated (released ~2015) and has known security vulnerabilities. Additionally, SQL Server support was **low priority** for the Konga project due to limited usage.

**Security Issues:**
- Extremely outdated package (8+ years old)
- Multiple vulnerabilities in dependencies
- No longer actively maintained
- Part of the legacy Sails.js 0.12 ecosystem
- Contributing to overall vulnerability count

**Priority Assessment:**
- **Low usage:** Very few Konga deployments use SQL Server
- **Better alternatives:** PostgreSQL is the recommended database
- **Maintenance burden:** Not worth maintaining for minimal usage
- **Re-enablement unlikely:** Low priority for future restoration

---

## Original Configuration

**Connection Config (from `config/connections.js`):**
```javascript
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

**Environment Variables:**
- `DB_ADAPTER=sqlserver`
- `DB_HOST` (default: localhost)
- `DB_PORT` (default: 49150)
- `DB_USER`
- `DB_PASSWORD`
- `DB_DATABASE` (default: konga_database)
- `DB_URI` (alternative: full connection string)

---

## Preserved Code

**Files in this directory:**
- `connections-sqlserver.js` - Original connection configuration snippet

**Original Repository Locations:**
- Package dependency: [package.json:L52](../../package.json) - Removed from dependencies
- Connection config: [config/connections.js:L95-L103](../../config/connections.js) - Removed, now shows disabled message
- Initialization code: None (SQL Server adapter handled initialization automatically)
- Initialization switch: [makedb/index.js:L17-L18](../../makedb/index.js) - Replaced with error guard

**Note:** SQL Server did not have a dedicated makedb initialization file

---

## Migration to PostgreSQL

If you were using SQL Server, migrate to PostgreSQL:

### Why PostgreSQL Over SQL Server for Konga?

**PostgreSQL Advantages:**
- **Open source:** No licensing restrictions
- **Cross-platform:** Same experience on Windows, Linux, macOS
- **Better ecosystem:** More community support for Node.js/Sails.js
- **Docker-friendly:** Easy to run in containers
- **Cost:** Free vs. SQL Server licensing fees

### Migration Steps

#### 1. Install PostgreSQL
```bash
# Using Docker (recommended)
docker run --name konga-postgres \
  -e POSTGRES_PASSWORD=admin1! \
  -e POSTGRES_DB=konga_database \
  -p 5432:5432 \
  -d postgres:13

# Or install locally
# Windows: Download from postgresql.org
# Linux: sudo apt install postgresql
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
SQL Server → PostgreSQL migration is complex but achievable:

**Option 1: Use Migration Tools**
- **pgloader:** Automated migration tool
  ```bash
  # Install pgloader
  sudo apt install pgloader

  # Create migration script
  pgloader mssql://user:pass@sqlserver/konga_database \
           postgresql://postgres:admin1!@localhost/konga_database
  ```

**Option 2: Manual Export/Import**
```bash
# Export from SQL Server (use bcp or SSMS)
bcp konga_database.dbo.users out users.dat -S server -U user -P password

# Convert to PostgreSQL format (requires scripting)
# Import to PostgreSQL using COPY or pg_dump format
```

**Option 3: Fresh Start (simplest)**
- Let Konga auto-create schema in PostgreSQL
- Manually recreate critical data (Kong nodes, users)

---

## Re-enablement Requirements

SQL Server re-enablement is **LOW PRIORITY** and unlikely to occur:

### Prerequisites (if ever pursued)
1. ✅ Sails.js upgraded to 1.x
2. ✅ Modern sails-sqlserver package (if it exists)
3. ✅ Security audit passed
4. ✅ **Business justification:** Why not use PostgreSQL?
5. ✅ Active user demand

### Reality Check
- **sails-sqlserver maintenance:** Package appears abandoned
- **Sails.js 1.x support:** Uncertain
- **Community support:** Minimal
- **Recommendation:** Use PostgreSQL instead

---

## Known Issues with Legacy Adapter

**sails-sqlserver 0.10.8 problems:**
- Ancient package (2015)
- Outdated mssql driver
- No modern SQL Server features
- Poor error handling
- Connection pooling issues
- Incompatible with Sails.js 1.x
- Likely incompatible with modern SQL Server 2019/2022

---

## Alternative: Use PostgreSQL

PostgreSQL is **enterprise-grade**, **open source**, and **well-supported**:

**Feature Comparison:**

| Feature | SQL Server | PostgreSQL |
|---------|-----------|------------|
| Cost | $$$ (licensing) | Free (open source) |
| Sails.js support | Poor (0.10.8) | Good (0.11.4+) |
| Security updates | None | Active |
| Docker support | Complex | Excellent |
| Cross-platform | Windows-centric | True cross-platform |
| Community | Smaller | Larger |

**Recommendation:** Always choose PostgreSQL for new Konga deployments

---

## Testing Locally (NOT RECOMMENDED)

If you absolutely must test with SQL Server locally:

```bash
# 1. Install SQL Server (requires Windows or Docker)
docker run -e "ACCEPT_EULA=Y" -e "SA_PASSWORD=YourStrong@Passw0rd" \
  -p 1433:1433 --name sql1 \
  -d mcr.microsoft.com/mssql/server:2019-latest

# 2. Install the vulnerable package (SECURITY RISK!)
npm install sails-sqlserver@0.10.8

# 3. Copy connection config back
# Copy contents of connections-sqlserver.js to config/connections.js

# 4. Set environment
export DB_ADAPTER=sqlserver
export DB_HOST=localhost
export DB_PORT=1433
export DB_USER=sa
export DB_PASSWORD=YourStrong@Passw0rd
export DB_DATABASE=konga_database

# 5. Start Konga
npm start

# IMPORTANT: Do not commit these changes!
# IMPORTANT: For local testing only, NOT production!
# IMPORTANT: Seriously, just use PostgreSQL!
```

---

## Contact

Questions about SQL Server disabling:
- See main README at `under-review/README.md`
- **Recommendation:** Migrate to PostgreSQL instead

---

**Last Updated:** 2026-02-15  
**Next Review:** Probably never (use PostgreSQL)  
**Priority:** ⬇️ VERY LOW
