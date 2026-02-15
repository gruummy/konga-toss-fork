'use strict';

/**
 * Connections
 * (sails.config.connections)
 *
 * `Connections` are like "saved settings" for your adapters.  What's the difference between
 * a connection and an adapter, you might ask?  An adapter (e.g. `sails-mysql`) is generic--
 * it needs some additional information to work (e.g. your database host, password, user, etc.)
 * A `connection` is that additional information.
 *
 * Each model must have a `connection` property (a string) which is references the name of one
 * of these connections.  If it doesn't, the default `connection` configured in `config/models.js`
 * will be applied.  Of course, a connection can (and usually is) shared by multiple models.
 * .
 * Note: If you're using version control, you should put your passwords/api keys
 * in `config/local.js`, environment variables, or use another strategy.
 * (this is to prevent you inadvertently sensitive credentials up to your repository.)
 *
 * For more information on configuration, check out:
 * http://sailsjs.org/#/documentation/reference/sails.config/sails.config.connections.html
 */
module.exports.connections = {
  /**
   * Local disk storage for DEVELOPMENT ONLY
   *
   * Installed by default.
   */
  localDiskDb: {
    adapter: 'sails-disk',
    filePath:  process.env.NODE_ENV == 'test' ? './.tmp/' : ( process.env.STORAGE_PATH || './kongadata/' ),
    fileName: process.env.NODE_ENV == 'test' ? 'localDiskDb.db' : 'konga.db'
  },

  /**
   * PostgreSQL is another officially supported relational database.
   * http://en.wikipedia.org/wiki/PostgreSQL
   *
   * Run:
   * npm install sails-postgresql
   */
  postgres: {
    adapter: 'sails-postgresql',
    url: process.env.DB_URI,
    host: process.env.DB_HOST || 'localhost',
    user:  process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'admin1!',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_DATABASE ||'konga_database',
    // schema: process.env.DB_PG_SCHEMA ||'public',
    poolSize: process.env.DB_POOLSIZE || 10,
    ssl: process.env.DB_SSL ? true : false // If set, assume it's true
  },

  /**
   * ⚠️ DISABLED ADAPTERS (Security - Phase 2)
   * 
   * MySQL, MongoDB, and SQL Server adapters have been temporarily disabled
   * due to security vulnerabilities in their legacy packages.
   * 
   * These configurations have been moved to: under-review/{adapter}/
   * 
   * Attempting to use these adapters will result in a clear error message.
   * 
   * Supported adapters:
   * - localDiskDb (development only)
   * - postgres (production)
   * 
   * For more information, see: under-review/README.md
   */

  // mysql: DISABLED - see under-review/mysql/README.md
  // mongo: DISABLED - see under-review/mongodb/README.md
  // sqlserver: DISABLED - see under-review/sqlserver/README.md

};