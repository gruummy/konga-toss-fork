# Development & Testing Setup

This document describes the development and testing environment used for the Konga TOSS fork project.

---

## Table of Contents

1. [Docker Test Environment](#docker-test-environment)
2. [Workspace Structure](#workspace-structure)
3. [Node Version Compatibility](#node-version-compatibility)
4. [Running Tests](#running-tests)
5. [Running Builds](#running-builds)
6. [Package Update Workflow](#package-update-workflow)
7. [Security Vulnerability Checks](#security-vulnerability-checks)

---

## Docker Test Environment

All testing and building is done in Docker containers within the WSL2 Ubuntu-Docker distribution.

### Base Image
```bash
node:12.16  # Node 12.16.3, NPM 6.14.4, Debian Stretch
```

### Why Docker?
- Isolated environment (no modifications to WSL distribution)
- Consistent Node.js version across all operations
- Easy to replicate and debug
- Network proxy support via `--network host`

### Container Configuration
```bash
docker run --rm --network host \
  -v /mnt/d/tmp/konga-toss-fork/workspaces/phase2-db-removal:/app \
  -e NODE_ENV=test \
  -w /app \
  node:12.16 \
  bash -c "<command>"
```

**Flags Explained:**
- `--rm`: Auto-remove container after exit
- `--network host`: Use host network (for proxy at localhost:3128)
- `-v`: Mount workspace directory
- `-e NODE_ENV=test`: Set test environment
- `-w /app`: Set working directory

---

## Workspace Structure

Package updates and testing are performed in an isolated workspace before syncing to the main repository.

```
/mnt/d/tmp/konga-toss-fork/
├── README.md                          # Workspace overview
└── workspaces/
    └── phase2-db-removal/             # Current test workspace
        ├── .mocharc.json              # Mocha 9.x configuration
        ├── package.json               # Updated dependencies
        ├── package-lock.json          # Locked versions
        ├── node_modules/              # ~1,286 packages
        ├── .tmp/                      # LocalDiskDb test data
        ├── test/                      # Test files
        ├── tasks/                     # Grunt tasks
        └── [all other Konga files]
```

### Why a Workspace?
- **Safety**: Test changes before applying to main repo
- **Isolation**: Multiple workspaces for different update phases
- **Rollback**: Easy to discard workspace if tests fail
- **Documentation**: Workspace name indicates phase (e.g., "phase2-db-removal")

### Syncing to Main Repo
After successful testing:
```bash
cp /mnt/d/tmp/konga-toss-fork/workspaces/phase2-db-removal/package.json \
   /mnt/d/.personal/konga-toss-fork/

cp /mnt/d/tmp/konga-toss-fork/workspaces/phase2-db-removal/package-lock.json \
   /mnt/d/.personal/konga-toss-fork/
```

**Important**: User performs `git add`, `git commit`, `git push` manually.

---

## Node Version Compatibility

### Current Production: Node 12.16.3

| Package | Version | Node 12 | Node 14 | Notes |
|---------|---------|---------|---------|-------|
| mocha | 9.2.2 | ✅ | ✅ | v10.x requires Node 14+ (ESM) |
| chai | 4.5.0 | ✅ | ✅ | Fully compatible |
| supertest | 6.3.4 | ✅ | ✅ | v7.x requires Node 14+ |
| sass | 1.97.3 | ✅ | ✅ | Dart Sass, Node 12+ |
| sails | 0.12.14 | ✅ | ⚠️ | Old version, Phase 4 upgrade |

### Why Node 12?
- Sails.js 0.12.14 is tested with Node 12
- Production stability (avoid breaking changes)
- Phase 4 will upgrade to Node 14/16 with Sails 1.5.x

### Future: Node 14+ (Phase 4)
- Enables mocha 10.x (better ESM support)
- Allows supertest 7.x (latest security fixes)
- Required for Sails.js 1.5.x upgrade

---

## Running Tests

### Full Test Suite (62 tests)

```bash
/mnt/c/Windows/System32/wsl.exe -d Ubuntu-Docker -- docker run --rm --network host \
  -v /mnt/d/tmp/konga-toss-fork/workspaces/phase2-db-removal:/app \
  -e NODE_ENV=test -w /app node:12.16 bash -c \
  "timeout -s KILL 150 ./node_modules/.bin/mocha --timeout 90000"
```

**Expected Output:**
```
  62 passing (1m)
```

### Test Configuration

**File**: `.mocharc.json` (root directory)
```json
{
  "timeout": 60000,
  "reporter": "spec",
  "ui": "bdd",
  "spec": "test/**/*.test.js"
}
```

**Replaced**: `test/mocha.opts` (deprecated in mocha 9+)

### Test Coverage

Current coverage: **16.7%** (3/18 controllers)

**Tested:**
- UserController (27 tests)
- KongNodeController (27 tests)
- AuthController (12 tests)

**Not Tested:**
- Kong integration (Services, Routes, Consumers, Plugins)
- Health checks (API, Node, Upstream)
- Snapshots
- Email functionality

See [Test-Coverage-Analysis.md](Test-Coverage-Analysis.md) for details.

### Test Database

Tests use **LocalDiskDb** (in-memory/file-based):
- Location: `.tmp/localDiskDb.db`
- No PostgreSQL/MySQL required for tests
- Data cleared between test runs

---

## Running Builds

### Grunt Build

```bash
/mnt/c/Windows/System32/wsl.exe -d Ubuntu-Docker -- docker run --rm --network host \
  -v /mnt/d/tmp/konga-toss-fork/workspaces/phase2-db-removal:/app \
  -w /app node:12.16 bash -c \
  "timeout -s KILL 120 ./node_modules/.bin/grunt build"
```

**Expected Output:**
```
Running "clean:dev" (clean) task
Running "jst:dev" (jst) task
Running "less:dev" (less) task
Running "sass:dev" (sass) task
Running "copy:dev" (copy) task
Running "sails-linker:devJsRelative" (sails-linker) task
...
Done.
```

### Build Tasks

**Grunt Tasks** (see `Gruntfile.js`):
1. `clean:dev` - Clear `.tmp` directory
2. `jst:dev` - Compile JST templates
3. `less:dev` - Compile LESS to CSS
4. `sass:dev` - Compile SCSS to CSS (using dart-sass)
5. `copy:dev` - Copy assets
6. `sails-linker:*` - Inject asset links into views

### Sass Migration

**Previous**: `node-sass` 4.5.3 (deprecated)  
**Current**: `sass` 1.97.3 (dart-sass)

**Configuration**: `tasks/config/sass.js`
```javascript
const sass = require('sass');  // Changed from 'node-sass'

module.exports = function (grunt) {
  grunt.config.set('sass', {
    options: {
      implementation: sass,
      sourceMap: true
    },
    dev: {
      files: [{
        expand: true,
        cwd: 'assets/styles/',
        src: ['importer.scss'],
        dest: '.tmp/public/styles/',
        ext: '.css'
      }]
    }
  });

  grunt.loadNpmTasks('grunt-sass');
};
```

---

## Package Update Workflow

### Standard Update Process

1. **Install in Workspace**
   ```bash
   docker run --rm --network host \
     -v /mnt/d/tmp/konga-toss-fork/workspaces/phase2-db-removal:/app \
     -w /app node:12.16 bash -c \
     "npm install <package>@<version> --save-dev"
   ```

2. **Run Tests**
   ```bash
   # See "Running Tests" section above
   # All 62 tests must pass
   ```

3. **Run Build**
   ```bash
   # See "Running Builds" section above
   # Build must complete without errors
   ```

4. **Check Vulnerabilities**
   ```bash
   # See "Security Vulnerability Checks" section below
   ```

5. **Fix Breaking Changes** (if any)
   - Update test files for API changes
   - Update configuration files
   - Update Grunt tasks

6. **Sync to Main Repo**
   ```bash
   cp workspace/package.json main-repo/
   cp workspace/package-lock.json main-repo/
   # Copy any modified config files
   ```

7. **User Commits**
   - User reviews changes
   - User stages: `git add`
   - User commits: `git commit`
   - User pushes: `git push`

### Example: supertest Update

**Challenge**: supertest 1.1.0 → 6.3.4 (API changes)

**Breaking Changes:**
- `result.res.body` → `result.body`
- `result.res.headers` → `result.headers`

**Fixed Files** (44 locations):
- `test/functional/common/controller.test.js` (38 changes)
- `test/functional/controllers/AuthController.test.js` (5 changes)
- `test/helpers/login.js` (1 change)

**Solution**: Global find/replace
```bash
find test -name '*.test.js' -type f -exec sed -i 's/result\.res\.body/result.body/g' {} \;
```

---

## Security Vulnerability Checks

### Check Vulnerabilities

```bash
/mnt/c/Windows/System32/wsl.exe -d Ubuntu-Docker -- docker run --rm --network host \
  -v /mnt/d/tmp/konga-toss-fork/workspaces/phase2-db-removal:/app \
  -w /app node:12.16 bash -c \
  "npm audit"
```

### JSON Output (for parsing)

```bash
npm audit --json | grep -E '"(total|critical|high|moderate|low)":'
```

**Example Output:**
```json
      "low": 52,
      "moderate": 148,
      "high": 245,
      "critical": 92
```

### Progress Tracking

| Milestone | Vulnerabilities | Critical | Date |
|-----------|----------------|----------|------|
| **Baseline (Pre-Phase 1)** | 696 | 119 | 2026-02-10 |
| Phase 1 Complete | 669 | 112 | 2026-02-11 |
| Phase 2 Complete | 579 | 97 | 2026-02-13 |
| npm audit fix | 570 | 97 | 2026-02-14 |
| nodemailer 8.0.1 | 565 | 96 | 2026-02-15 |
| **Phase 3 Week 1 Complete** | **537** | **92** | **2026-02-16** |

**Total Reduction**: -159 vulnerabilities (-22.8%), -27 critical (-22.7%)

### npm audit fix

**Automatic Fixes:**
```bash
npm audit fix
```

**With Breaking Changes:**
```bash
npm audit fix --force
```

⚠️ **Warning**: `--force` may break the application. Use workspace to test first.

### Manual Review

```bash
npm audit | grep -E "(Critical|High)" | head -20
```

See [Phase3-Vulnerability-Analysis.md](Phase3-Vulnerability-Analysis.md) for detailed package-by-package analysis.

---

## Additional Resources

- **[Phase3-Vulnerability-Analysis.md](Phase3-Vulnerability-Analysis.md)** - Complete vulnerability roadmap
- **[Test-Coverage-Analysis.md](Test-Coverage-Analysis.md)** - Test coverage gaps and risks
- **[test/TODOs.md](../test/TODOs.md)** - Email testing implementation plan
- **[agents.md](../agents.md)** - Agent guidelines and constraints

---

## Quick Reference

### Common Commands

```bash
# Run tests
docker run --rm --network host -v /mnt/d/tmp/konga-toss-fork/workspaces/phase2-db-removal:/app -e NODE_ENV=test -w /app node:12.16 bash -c "./node_modules/.bin/mocha --timeout 90000"

# Run build
docker run --rm --network host -v /mnt/d/tmp/konga-toss-fork/workspaces/phase2-db-removal:/app -w /app node:12.16 bash -c "./node_modules/.bin/grunt build"

# Check vulnerabilities
docker run --rm --network host -v /mnt/d/tmp/konga-toss-fork/workspaces/phase2-db-removal:/app -w /app node:12.16 bash -c "npm audit"

# Install package
docker run --rm --network host -v /mnt/d/tmp/konga-toss-fork/workspaces/phase2-db-removal:/app -w /app node:12.16 bash -c "npm install <package>@<version> --save-dev"

# Sync to main repo
cp /mnt/d/tmp/konga-toss-fork/workspaces/phase2-db-removal/package* /mnt/d/.personal/konga-toss-fork/
```

---

**Last Updated**: February 16, 2026  
**Maintainer**: Konga TOSS Fork Project
