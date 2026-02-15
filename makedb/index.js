/**
 * Created by user on 06/10/2017.
 */
'use strict'


module.exports = function (next) {

    if(process.env.NODE_ENV == 'production') return next();

    var adapter = process.env.DB_ADAPTER;

    // Guard against disabled database adapters
    var disabledAdapters = ['mysql', 'mongo', 'sqlserver'];
    if (disabledAdapters.indexOf(adapter) !== -1) {
        console.error('\n============================================================');
        console.error('ERROR: Database adapter "' + adapter + '" is currently DISABLED');
        console.error('============================================================\n');
        console.error('Reason: Security vulnerabilities in legacy adapter packages');
        console.error('');
        console.error('Supported adapters:');
        console.error('  - postgres    (recommended for production)');
        console.error('  - localDiskDb (development/testing only)');
        console.error('');
        console.error('For more information, see:');
        console.error('  under-review/' + adapter + '/README.md');
        console.error('  under-review/README.md');
        console.error('');
        console.error('To use PostgreSQL:');
        console.error('  export DB_ADAPTER=postgres');
        console.error('  export DB_HOST=localhost');
        console.error('  export DB_USER=postgres');
        console.error('  export DB_PASSWORD=yourpassword');
        console.error('  export DB_DATABASE=konga_database');
        console.error('============================================================\n');
        
        return next(new Error('Database adapter "' + adapter + '" is disabled. Use postgres or localDiskDb instead.'));
    }

    switch (adapter) {
        case("postgres"):
            return require("./dbs/pg").run(next);
        default:
            console.log("No DB Adapter defined. Using localDB...");
            return next();

    }
}




