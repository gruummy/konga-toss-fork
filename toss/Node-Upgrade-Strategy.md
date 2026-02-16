# Node.js Upgrade Strategy: 12.16 → 22.x

**Project:** Konga v0.14.9  
**Created:** 2026-02-16  
**Current Node:** 12.16.3 (EOL since April 2022)  
**Target Node:** 22.x LTS (latest LTS)  

---

## 🎯 EXECUTIVE SUMMARY

**Challenge:** Konga runs on Node.js 12.16 (EOL for 4 years) with Sails.js 0.12.14 framework from 2016. Direct upgrade to Node 22 is **NOT POSSIBLE** due to:
- Sails.js 0.12.14 maximum support: Node 12.x
- Multiple dependencies with breaking changes across Node versions
- 507 remaining security vulnerabilities blocking safe migration

**Recommended Path:** **3-Phase Migration Strategy** with intermediate Node 18 LTS

**Timeline:** 6-12 weeks for full migration (depending on testing depth)

**Risk Level:** 🔴 **HIGH** - Core framework upgrade required

---

## 📊 CURRENT STATE ANALYSIS

### Current Technology Stack

| Component | Current Version | Node Support | Status |
|-----------|----------------|--------------|--------|
| **Node.js** | 12.16.3 | EOL (Apr 2022) | 🔴 Critical |
| **Sails.js** | 0.12.14 (2016) | Node 4-12 | 🔴 Outdated |
| **npm** | 6.x (bundled) | Node 12 | 🔴 Old |
| **async** | 1.5.0 (2015) | Any | 🟡 Ancient |
| **lodash** | 4.17.21 | Any | ✅ OK |
| **ejs** | 4.0.1 | Node 10+ | ✅ OK |
| **jsonwebtoken** | 8.5.1 | Node 8+ | 🟡 Outdated |
| **passport** | 0.7.0 | Node 12+ | ✅ OK |
| **axios** | 0.27.2 | Node 12+ | ✅ OK |
| **bcryptjs** | 2.4.3 | Any | ✅ OK |
| **bluebird** | 3.7.2 | Any | ✅ OK |
| **moment** | 2.30.1 | Any | ✅ OK |
| **uuid** | 9.0.1 | Node 14+ | 🟡 Needs 14+ |

### Critical Blockers

**PRIMARY BLOCKER: Sails.js 0.12.14**
- Released: 2016
- Last updated: 2017
- Node support: 4.x - 12.x ONLY
- Cannot run on Node 14+
- **Recommendation:** Must upgrade to Sails.js 1.5.x (latest)

**SECONDARY BLOCKER: Database Adapter**
- `sails-postgresql` 0.11.4 (2015)
- Requires Sails.js 0.12.x
- Modern version: waterline-postgresql 3.x (requires Sails 1.x)
- **Recommendation:** Upgrade after Sails framework upgrade

**TERTIARY BLOCKERS:**
- `async` 1.5.0 - Callback-based API (modernize to 3.x)
- `jsonwebtoken` 8.5.1 - Should upgrade to 9.x
- Various Grunt plugins (may need updates)

---

## 🛣️ MIGRATION PATHS COMPARISON

### ❌ Option A: Direct Jump (12 → 22) - NOT RECOMMENDED

**Why NOT feasible:**
```
Node 12.16 + Sails 0.12 → Node 22 + Sails 0.12
                           ❌ INCOMPATIBLE
                           Sails 0.12 max is Node 12

Node 12.16 + Sails 0.12 → Node 22 + Sails 1.5
                           ❌ TOO MANY BREAKING CHANGES
                           - Waterline ORM 0.10 → 0.13+ (massive API changes)
                           - Database adapter complete rewrite
                           - Unknown async/Promise issues
                           - Testing burden too high
```

**Risk:** 🔴🔴🔴 EXTREME - Likely to fail, untestable

---

### ✅ Option B: Phased Migration (12 → 16 → 18 → 22) - RECOMMENDED

**Phase-by-phase compatibility validation:**

```
Phase 1: Node 12 → Node 16
├─ Keep Sails 0.12 temporarily (still works on Node 16 unofficially)
├─ Update obvious blockers (uuid, minor packages)
├─ Test extensively on Node 16
└─ Establish baseline for Sails upgrade

Phase 2: Sails 0.12 → Sails 1.5 (on Node 16)
├─ THIS IS THE MAJOR SURGERY
├─ Waterline ORM changes
├─ Database adapter migration (0.11 → 3.x)
├─ API compatibility fixes
├─ Hook system updates
└─ Extensive testing (all 62+ tests + manual)

Phase 3: Node 16 → Node 18 LTS
├─ Sails 1.5 supports Node 14-20
├─ Update remaining packages
├─ Test crypto/OpenSSL 3.0 compatibility
└─ Validate production stability

Phase 4: Node 18 → Node 22 LTS
├─ Final dependency updates
├─ Performance validation
├─ Security audit
└─ Production deployment
```

**Total Timeline:** 6-12 weeks  
**Risk:** 🟡 MEDIUM - Manageable with testing  
**Success Rate:** 🟢 HIGH - Proven migration path

---

### ⚠️ Option C: Aggressive Jump (12 → 18 with Sails upgrade) - RISKY

**Skip Node 16, go straight to Node 18:**

```
Node 12 + Sails 0.12 → Node 18 + Sails 1.5
                        ⚠️ FEASIBLE BUT RISKY
                        - Sails 1.5 supports Node 14-20
                        - Combines two major migrations
                        - Harder to debug issues
                        - Less time to validate
```

**Timeline:** 4-8 weeks  
**Risk:** 🟠 MEDIUM-HIGH - Less validation time  
**Success Rate:** 🟡 MODERATE - More debugging needed

---

## 📋 DETAILED MIGRATION PLAN (RECOMMENDED)

### Prerequisites (Current State)

✅ **Completed Quick-Wins:**
- lodash 4.17.21 ✓
- bcryptjs 2.4.3 ✓
- bluebird 3.7.2 ✓
- uuid 9.0.1 ✓
- moment 2.30.1 ✓
- dotenv 16.4.5 ✓
- mkdirp 3.0.1 ✓
- axios 0.27.2 ✓
- ejs 4.0.1 ✓
- socket.io-redis 5.4.0 ✓
- passport 0.7.0 ✓

✅ **Test Suite:** 62/62 passing  
✅ **Vulnerabilities:** 696 → 507 (-27%)  
✅ **Database:** PostgreSQL only (MySQL/MongoDB removed)

---

### PHASE 1: Dependency Preparation (Node 12) - **2-3 weeks**

**Goal:** Update all packages that CAN be updated on Node 12 + Sails 0.12

**1.1 Quick-Win Batch 3 (Week 1)**

Update remaining packages with **no breaking changes:**

| Package | Current | Target | Node Req | Blocker? |
|---------|---------|--------|----------|----------|
| `validator` | 4.2.1 | 13.x | Any | ✅ No |
| `jsonwebtoken` | 8.5.1 | 9.0.2 | Node 12+ | ✅ No |
| `@slack/client` | 3.16.0 | @slack/web-api 7.x | Node 18+ | ❌ Wait |
| `sendmail` | 1.6.1 | 1.7.1 | Any | ✅ No |
| `ip` | 1.1.5 | 2.0.1 | Any | ✅ No |
| `rc` | 1.2.8 | 1.2.8 | Any | ✅ OK |
| `include-all` | 4.0.3 | 4.0.3 | Any | ✅ OK |

**Commands:**
```bash
npm install validator@13 jsonwebtoken@9 sendmail@1.7.1 ip@2.0.1 --save
npm test  # Verify 62/62 passing
```

**Expected Impact:**
- -10 to -20 vulnerabilities
- All tests still passing
- Risk: ✅ LOW

---

**1.2 Async Modernization (Week 2)**

**CRITICAL:** async 1.5.0 → 3.2.6 (breaks callback API)

| File | Usage | Migration Effort |
|------|-------|------------------|
| `config/bootstrap.js` | async.series, async.auto | Medium |
| `api/services/*` | async.each, async.map | Medium |
| Sails internals | Unknown | ⚠️ High risk |

**Options:**
- **Option A:** Upgrade and fix all callback code (3-5 days)
- **Option B:** Wait until Sails 1.x (uses modern Promises)
- **Option C:** Parallel installation (async + async-modern)

**Recommendation:** ⏳ **Wait for Sails 1.x** (Sails 1.x is Promise-native, reduces async dependency)

---

**1.3 Dev Dependency Cleanup (Week 2)**

Update test tooling (already done):

| Package | Current | Target | Status |
|---------|---------|--------|--------|
| `mocha` | 9.2.2 | ✅ OK | Done |
| `chai` | 4.5.0 | ✅ OK | Done |
| `supertest` | 6.3.4 | ✅ OK | Done |
| `sass` | 1.97.3 | ✅ OK | Done |

---

**1.4 Grunt/Build Tool Updates (Week 3)**

Check Grunt plugin compatibility:

| Plugin | Current | Node 12 Max | Node 16+ Version |
|--------|---------|-------------|------------------|
| `grunt` | 1.1.0 | 1.6.1 | 1.6.1+ |
| `grunt-contrib-sass` | 1.0.0 | ⚠️ Old | Use grunt-sass |
| `grunt-sass` | 3.1.0 | ✅ OK | 3.1.0+ |
| All others | - | - | Need checking |

**Action:** Update all Grunt plugins to latest compatible with Node 12

---

**Phase 1 Success Criteria:**

- ✅ All packages updated to max Node 12-compatible versions
- ✅ 62/62 tests passing
- ✅ Vulnerabilities < 450
- ✅ No Sails.js changes yet
- ✅ Clear baseline for Phase 2

**Phase 1 Deliverable:** Commit "feat: Prepare dependencies for Sails.js upgrade"

---

### PHASE 2A: Node 16 Migration (Sails 0.12 on Node 16) - **1 week**

**Goal:** Test if Sails 0.12.14 can survive on Node 16 (unofficial support)

**2A.1 Docker Environment Setup**

```dockerfile
# Current: node:12.16
FROM node:16-alpine

# Test build and startup
RUN npm install
RUN npm test
RUN node app.js
```

**2A.2 Compatibility Testing**

| Test | Expected Result | Risk |
|------|----------------|------|
| `npm install` | ✅ Should work | Low |
| `npm test` | ⚠️ May have warnings | Medium |
| `node app.js` | ⚠️ Sails hooks may fail | High |
| Integration tests | ❓ Unknown | High |

**Potential Issues:**
- Buffer API changes (Node 12 → 16)
- Crypto deprecations
- Sails hook system incompatibilities
- Waterline ORM edge cases

---

**2A.3 Decision Point**

**IF Node 16 + Sails 0.12 WORKS:**
→ Continue to Phase 2B (Sails upgrade on Node 16)

**IF Node 16 + Sails 0.12 FAILS:**
→ Skip to Phase 2B immediately (upgrade Sails on Node 12, then upgrade Node)

---

### PHASE 2B: Sails.js Framework Upgrade - **3-4 weeks**

**Goal:** Sails 0.12.14 → Sails 1.5.x (THIS IS THE BIG MIGRATION)

**Current:** Sails 0.12.14 (2016)  
**Target:** Sails 1.5.11 (latest, 2024)  
**Node Support:** 14.x - 20.x  
**Risk:** 🔴🔴🔴 CRITICAL - Framework rewrite

---

**2B.1 Sails.js Breaking Changes Research (Week 1)**

**Major Changes in Sails 1.x:**

| Component | 0.12 Behavior | 1.x Behavior | Migration Effort |
|-----------|---------------|--------------|------------------|
| **Waterline ORM** | 0.10.x | 0.13.x | 🔴 HIGH - Query API changes |
| **Blueprints** | Auto REST API | Updated syntax | 🟡 MEDIUM |
| **Hooks** | Old system | New lifecycle | 🟡 MEDIUM |
| **Policies** | String-based | Function-based | 🟢 LOW |
| **Config** | Different structure | Flattened config | 🟡 MEDIUM |
| **Promises** | Callbacks only | Promises + async/await | 🟢 GOOD |
| **Sessions** | Built-in | req.session changes | 🟡 MEDIUM |
| **WebSockets** | Socket.io 0.9 | Socket.io 4.x | 🔴 HIGH |

**Documentation:**
- [Sails 1.0 Migration Guide](https://sailsjs.com/documentation/upgrading/to-v-1-0)
- [Waterline 0.13 Changelog](https://github.com/balderdashy/waterline/blob/master/CHANGELOG.md)

---

**2B.2 Database Adapter Migration (Week 1-2)**

**CRITICAL:** sails-postgresql 0.11.4 → waterline-postgresql 3.x

| Aspect | Old Adapter | New Adapter | Changes Required |
|--------|------------|-------------|------------------|
| Package | sails-postgresql | waterline-postgresql | npm install |
| Config | config/connections.js | config/datastores.js | Rename + restructure |
| Schema | .schema.true | Different syntax | Review models |
| Queries | .exec() callbacks | .exec() Promise | ✅ Compatible |
| Transactions | Not supported | Supported | ✅ New feature |

**Migration Steps:**

```bash
# 1. Install new adapter
npm uninstall sails-postgresql
npm install sails-disk@1.x @sailshq/connect-redis@6.x --save
npm install waterline-postgresql@3.x --save  # When on production

# 2. Update config/datastores.js (was config/connections.js)
module.exports.datastores = {
  default: {
    adapter: 'waterline-postgresql',
    url: process.env.DB_URI  // Simpler config
  }
}

# 3. Test all queries
npm test  # Check all 62 tests
```

**Files to modify:**
- `config/connections.js` → Rename to `config/datastores.js`
- `config/models.js` → Update migrate settings
- All model files: Review schema definitions
- `api/services/*`: Test query methods

---

**2B.3 API Code Migration (Week 2-3)**

**Waterline Query Changes:**

```javascript
// OLD (Sails 0.12):
User.find().exec(function(err, users) {
  if (err) return res.serverError(err);
  return res.json(users);
});

// NEW (Sails 1.x) - Promises:
try {
  const users = await User.find();
  return res.json(users);
} catch (err) {
  return res.serverError(err);
}

// OR (still callback-compatible):
User.find().exec(function(err, users) {
  // Still works! Backward compatible
});
```

**Good News:** Most Waterline callback code still works!  
**Changes Needed:**
- `.populate()` → `.populate()` (syntax changed slightly)
- `.query()` raw SQL → Different escaping
- `.stream()` → Removed (use .find() + pagination)

**Search for patterns:**
```bash
# Find all Waterline queries
grep -r "\.find(" api/
grep -r "\.create(" api/
grep -r "\.update(" api/
grep -r "\.destroy(" api/
grep -r "\.populate(" api/
```

**Estimated files to review:**
- `api/controllers/*` - 15 controllers
- `api/services/*` - 5 services
- `api/hooks/*` - 3 hooks
- `api/models/*` - 10 models

---

**2B.4 Hook System Migration (Week 3)**

**Custom hooks need updates:**

| Hook File | Changes Required |
|-----------|------------------|
| `api/hooks/load-db.js` | Update initialization |
| `api/hooks/api-health-checks.js` | Test cron + Sails events |
| `api/hooks/node-health-checks.js` | Test cron + Sails events |
| `api/hooks/start-scheduled-snapshots.js` | Test cron scheduling |

**New hook structure (Sails 1.x):**

```javascript
// OLD (0.12):
module.exports = function(sails) {
  return {
    initialize: function(cb) {
      // Hook code
      cb();
    }
  };
};

// NEW (1.x):
module.exports = function defineLoadDbHook(sails) {
  return {
    initialize: async function() {
      // Use async/await
      await doSomething();
    }
  };
};
```

---

**2B.5 Config File Migration (Week 3)**

**File renames and restructuring:**

| Old (0.12) | New (1.x) | Changes |
|------------|-----------|---------|
| `config/connections.js` | `config/datastores.js` | Flattened structure |
| `config/cors.js` | `config/security.js` | Merged into security |
| `config/csrf.js` | `config/security.js` | Merged into security |
| `config/sockets.js` | `config/sockets.js` | Updated for Socket.io 4.x |

**New config files needed:**
- `config/datastores.js` - Database configuration
- `config/security.js` - CORS + CSRF settings

---

**2B.6 Testing Strategy (Week 4)**

**Test pyramid:**

```
62 Automated Tests (Mocha + Supertest)
├─ All CRUD operations
├─ Authentication (passport + JWT)
├─ API endpoints
└─ Health checks

Manual Testing Required:
├─ Kong Admin API proxy
├─ WebSocket connections (snapshots, health checks)
├─ Email notifications (SMTP/Sendmail)
├─ LDAP authentication (if configured)
├─ Snapshot scheduling (cron jobs)
└─ Full user workflows
```

**Test checklist:**
- [ ] All 62 mocha tests pass
- [ ] Kong connection and proxy work
- [ ] User login (local + LDAP if applicable)
- [ ] WebSocket updates (real-time UI)
- [ ] Snapshot creation and scheduling
- [ ] Health check monitoring
- [ ] Email notifications
- [ ] PostgreSQL queries (no data loss)

---

**Phase 2B Success Criteria:**

- ✅ Sails.js 1.5.x installed and running
- ✅ Database adapter migrated (waterline-postgresql 3.x)
- ✅ All 62 automated tests passing
- ✅ Manual testing complete
- ✅ No data corruption
- ✅ WebSocket functionality intact
- ✅ Kong proxy working

**Phase 2B Deliverable:** Commit "feat: Upgrade to Sails.js 1.5.x"

**Estimated Effort:** 80-120 hours (full-time: 2-3 weeks)

---

### PHASE 3: Node 18 LTS Migration - **1-2 weeks**

**Goal:** Node 16 → Node 18 LTS

**Precondition:** Sails 1.5.x running successfully on Node 16

**Node 18 Changes:**
- OpenSSL 3.0 (crypto compatibility)
- V8 engine updates
- Fetch API native support
- Test runner native support

---

**3.1 Docker Environment Update**

```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm test
```

**3.2 Compatibility Testing**

| Test | Expected | Issues |
|------|----------|--------|
| `npm install` | ✅ Clean | None |
| `npm test` | ✅ 62/62 | bcryptjs may warn |
| `node app.js` | ✅ Start | Check crypto |
| Integration | ✅ Pass | None expected |

**Known Issues:**
- **bcryptjs:** May show OpenSSL warnings (safe to ignore)
- **Crypto:** Some old algorithms deprecated
- **Fetch:** Native fetch may conflict with axios (unlikely)

---

**3.3 Package Updates for Node 18**

| Package | Action | Reason |
|---------|--------|--------|
| `@slack/client` | Update to @slack/web-api 7.x | Now compatible |
| `socket.io-redis` | Check compatibility | Already on 5.4.0 |
| All others | Re-audit | Check for Node 18-specific updates |

---

**Phase 3 Success Criteria:**

- ✅ Node 18 Docker container running
- ✅ All 62 tests passing
- ✅ No OpenSSL errors
- ✅ Production-ready

**Phase 3 Deliverable:** Commit "feat: Upgrade to Node.js 18 LTS"

**Estimated Effort:** 20-40 hours (1-2 weeks)

---

### PHASE 4: Node 22 LTS Migration - **1 week**

**Goal:** Node 18 → Node 22 LTS (if Sails 1.5.x supports it)

**4.1 Sails.js Node 22 Compatibility Check**

**STATUS CHECK (as of 2026-02-16):**
- Sails.js 1.5.11 officially supports: Node 14.x - 20.x
- Node 22 support: ⚠️ **NOT YET OFFICIAL**

**Options:**
- **Option A:** Wait for official Sails 1.6 with Node 22 support
- **Option B:** Test Sails 1.5 on Node 22 (may work unofficially)
- **Option C:** Stay on Node 18 LTS (supported until 2025)

---

**4.2 If Proceeding to Node 22**

```dockerfile
FROM node:22-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm test
```

**Risks:**
- Sails.js may have incompatibilities
- Waterline ORM may need fixes
- Database adapter may need updates

**Recommendation:** ⏳ **Wait for Sails 1.6** or stay on Node 18 LTS

---

**Phase 4 Success Criteria:**

- ✅ Node 22 compatibility verified
- ✅ OR: Node 18 LTS stable and production-ready
- ✅ Full security audit passed
- ✅ Performance benchmarks met

**Phase 4 Deliverable:** Commit "feat: Upgrade to Node.js 22 LTS" OR "docs: Node 18 LTS stable"

**Estimated Effort:** 10-20 hours (1 week)

---

## 📊 TIMELINE SUMMARY

| Phase | Duration | Risk | Dependencies | Deliverable |
|-------|----------|------|--------------|-------------|
| **Phase 1: Dep Prep** | 2-3 weeks | 🟢 LOW | None | Ready for Sails upgrade |
| **Phase 2A: Node 16** | 1 week | 🟡 MED | Phase 1 | Node 16 validated |
| **Phase 2B: Sails 1.x** | 3-4 weeks | 🔴 HIGH | Phase 2A | Sails 1.5.x running |
| **Phase 3: Node 18** | 1-2 weeks | 🟢 LOW | Phase 2B | Node 18 LTS |
| **Phase 4: Node 22** | 1 week | 🟡 MED | Phase 3 + Sails 1.6 | Node 22 LTS |

**Total Timeline:**
- **Optimistic:** 8 weeks (2 months)
- **Realistic:** 10 weeks (2.5 months)
- **Conservative:** 12 weeks (3 months)

---

## 🎯 ALTERNATIVE STRATEGY: Skip to Node 18

**Aggressive approach:** Node 12 → Node 18 (skip Node 16)

**Timeline:**
- Phase 1: Dep Prep - 2 weeks
- Phase 2: Sails 1.x on Node 18 - 4 weeks (combined upgrade)
- Phase 3: Validation - 1 week
- **Total: 7 weeks**

**Pros:**
- 3 weeks faster
- Fewer intermediate steps
- Directly to LTS target

**Cons:**
- Harder to debug (two changes at once)
- Less validation time
- Higher risk if issues arise

**Recommendation:** Only if team has strong Sails.js expertise

---

## ⚠️ CRITICAL RISKS & MITIGATION

### Risk 1: Sails.js Upgrade Failure

**Probability:** 🟠 MEDIUM  
**Impact:** 🔴🔴🔴 CRITICAL

**Mitigation:**
- Dedicated feature branch: `feature/sails-1.x-upgrade`
- Parallel workspace: `/mnt/d/tmp/konga-toss-fork/workspaces/sails-1.x`
- Keep Node 12 + Sails 0.12 running in production
- Thorough testing before merging

---

### Risk 2: Data Loss During Migration

**Probability:** 🟢 LOW  
**Impact:** 🔴🔴🔴 CRITICAL

**Mitigation:**
- Full database backup before any migration
- Test migration on copy of production data
- Verify data integrity with checksums
- No schema changes during Sails upgrade

---

### Risk 3: WebSocket Incompatibility

**Probability:** 🟡 MEDIUM  
**Impact:** 🟠🟠 HIGH

**Mitigation:**
- Socket.io 1.0 → 4.x has breaking changes
- Test all real-time features extensively
- Have rollback plan for WebSocket features
- May need to rewrite socket event handlers

---

### Risk 4: Authentication Breaks

**Probability:** 🟡 MEDIUM  
**Impact:** 🔴🔴 CRITICAL

**Mitigation:**
- passport@0.7.0 + jsonwebtoken@9.0 already updated
- Test all auth flows (local, LDAP, JWT)
- Session management may need updates
- Have authentication smoke tests ready

---

### Risk 5: Timeline Overrun

**Probability:** 🟠 HIGH  
**Impact:** 🟡 MEDIUM

**Mitigation:**
- Buffer 50% extra time (8 weeks → 12 weeks)
- Weekly progress checkpoints
- Clear success criteria per phase
- Stop and reassess if Phase 2B exceeds 4 weeks

---

## 📦 RESOURCE REQUIREMENTS

### Team

| Role | Estimated Hours | When Needed |
|------|----------------|-------------|
| **Backend Developer** | 120-160 hours | Phase 1-4 |
| **DevOps Engineer** | 20-30 hours | Phase 2A, 3, 4 |
| **QA Engineer** | 40-60 hours | Phase 2B, 3 |
| **Database Admin** | 10-20 hours | Phase 2B |

**Total Effort:** 190-270 hours (~1.5 FTE for 2-3 months)

---

### Infrastructure

| Resource | Purpose | Cost |
|----------|---------|------|
| **Docker WSL** | Development + testing | ✅ Free |
| **CI/CD Pipeline** | Automated testing | Existing |
| **Test Database** | PostgreSQL copy | ✅ Minimal |
| **Staging Server** | Pre-production validation | Optional |

---

## 📈 SUCCESS METRICS

### Technical Metrics

| Metric | Current (Node 12) | Target (Node 22) |
|--------|------------------|------------------|
| **Node Version** | 12.16.3 (EOL) | 22.x LTS |
| **Sails Version** | 0.12.14 (2016) | 1.5.x+ (2024) |
| **Vulnerabilities** | 507 | < 50 |
| **Test Pass Rate** | 62/62 (100%) | 62/62 (100%) |
| **Build Time** | ~3 minutes | < 2 minutes |
| **Startup Time** | ~5 seconds | < 3 seconds |

---

### Business Metrics

| Metric | Target |
|--------|--------|
| **Zero downtime** | ✅ Required |
| **No data loss** | ✅ Required |
| **Feature parity** | ✅ 100% |
| **Performance** | ✅ Same or better |

---

## 🚀 NEXT STEPS

### Immediate (This Week)

1. ✅ **Document current state** (this document)
2. ⏳ **Create feature branch:** `feature/node-upgrade-prep`
3. ⏳ **Start Phase 1:** Quick-Win Batch 3
4. ⏳ **Research Sails 1.x migration guide** (detailed read)
5. ⏳ **Set up test workspace:** `/mnt/d/tmp/konga-toss-fork/workspaces/phase1-deps`

---

### Short-term (Next 2 Weeks)

1. Complete Phase 1: Dependency Preparation
2. Update all packages to max Node 12-compatible versions
3. Achieve < 450 vulnerabilities
4. Document all compatibility findings
5. Get 62/62 tests passing with updated deps

---

### Medium-term (Month 1-2)

1. Phase 2A: Test Node 16 compatibility
2. Phase 2B: Begin Sails.js 1.x migration
3. Database adapter migration
4. Extensive testing

---

### Long-term (Month 3)

1. Phase 3: Node 18 LTS migration
2. Phase 4: Evaluate Node 22 readiness
3. Final security audit
4. Production deployment

---

## 📚 REFERENCE LINKS

### Official Documentation
- [Sails.js 1.0 Migration Guide](https://sailsjs.com/documentation/upgrading/to-v-1-0)
- [Waterline 0.13 Adapter Documentation](https://sailsjs.com/documentation/concepts/extending-sails/adapters)
- [Node.js LTS Schedule](https://nodejs.org/en/about/releases/)
- [PostgreSQL Adapter Migration](https://github.com/balderdashy/sails-postgresql)

### Community Resources
- [Sails 0.12 → 1.0 Migration Examples](https://github.com/balderdashy/sails/issues?q=is%3Aissue+migration)
- [Waterline Query Breaking Changes](https://github.com/balderdashy/waterline/blob/master/CHANGELOG.md)

---

## 📝 CONCLUSION

**Main Blocker:** Sails.js 0.12.14 cannot run on Node 14+

**Required Path:**
1. Prepare dependencies (2-3 weeks)
2. Upgrade Sails 0.12 → 1.5 (3-4 weeks) ← **THE BIG MIGRATION**
3. Upgrade Node 12 → 18 (1-2 weeks)
4. Optionally upgrade Node 18 → 22 (1 week)

**Total Timeline:** 8-12 weeks

**Highest Risk:** Sails.js upgrade (Phase 2B)

**Recommendation:** 
- ✅ Proceed with phased approach
- ✅ Allocate 3-4 weeks for Sails upgrade
- ✅ Extensive testing at each phase
- ✅ Keep production on Node 12 until full validation

**Expected Outcome:**
- Modern Node.js 18 or 22 LTS
- Sails.js 1.5.x framework
- < 50 vulnerabilities
- Full feature parity
- Production-ready

---

**Document Version:** 1.0  
**Last Updated:** 2026-02-16  
**Next Review:** After Phase 1 completion
