"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.open = exports.openDatabase = exports.QuickSQLite = void 0;

var _reactNative = require("react-native");

if (global.__QuickSQLiteProxy == null) {
  const QuickSQLiteModule = _reactNative.NativeModules.QuickSQLite;

  if (QuickSQLiteModule == null) {
    throw new Error('Base quick-sqlite module not found. Maybe try rebuilding the app.');
  } // Check if we are running on-device (JSI)


  if (global.nativeCallSyncHook == null || QuickSQLiteModule.install == null) {
    throw new Error('Failed to install react-native-quick-sqlite: React Native is not running on-device. QuickSQLite can only be used when synchronous method invocations (JSI) are possible. If you are using a remote debugger (e.g. Chrome), switch to an on-device debugger (e.g. Flipper) instead.');
  } // Call the synchronous blocking install() function


  const result = QuickSQLiteModule.install();

  if (result !== true) {
    throw new Error(`Failed to install react-native-quick-sqlite: The native QuickSQLite Module could not be installed! Looks like something went wrong when installing JSI bindings: ${result}`);
  } // Check again if the constructor now exists. If not, throw an error.


  if (global.__QuickSQLiteProxy == null) {
    throw new Error('Failed to install react-native-quick-sqlite, the native initializer function does not exist. Are you trying to use QuickSQLite from different JS Runtimes?');
  }
}

const proxy = global.__QuickSQLiteProxy;
const QuickSQLite = proxy;
/**
 * Object returned by SQL Query executions {
 *  insertId: Represent the auto-generated row id if applicable
 *  rowsAffected: Number of affected rows if result of a update query
 *  message: if status === 1, here you will find error description
 *  rows: if status is undefined or 0 this object will contain the query results
 * }
 *
 * @interface QueryResult
 */

exports.QuickSQLite = QuickSQLite;
//   _______ _____            _   _  _____         _____ _______ _____ ____  _   _  _____
//  |__   __|  __ \     /\   | \ | |/ ____|  /\   / ____|__   __|_   _/ __ \| \ | |/ ____|
//     | |  | |__) |   /  \  |  \| | (___   /  \ | |       | |    | || |  | |  \| | (___
//     | |  |  _  /   / /\ \ | . ` |\___ \ / /\ \| |       | |    | || |  | | . ` |\___ \
//     | |  | | \ \  / ____ \| |\  |____) / ____ \ |____   | |   _| || |__| | |\  |____) |
//     |_|  |_|  \_\/_/    \_\_| \_|_____/_/    \_\_____|  |_|  |_____\____/|_| \_|_____/
const locks = {}; // Enhance some host functions
// Add 'item' function to result object to allow the sqlite-storage typeorm driver to work

const enhanceQueryResult = result => {
  // Add 'item' function to result object to allow the sqlite-storage typeorm driver to work
  if (result.rows == null) {
    result.rows = {
      _array: [],
      length: 0,
      item: idx => result.rows._array[idx]
    };
  } else {
    result.rows.item = idx => result.rows._array[idx];
  }
};

const _open = QuickSQLite.open;

QuickSQLite.open = (dbName, location) => {
  _open(dbName, location);

  locks[dbName] = {
    queue: [],
    inProgress: false
  };
};

const _close = QuickSQLite.close;

QuickSQLite.close = dbName => {
  _close(dbName);

  setImmediate(() => {
    delete locks[dbName];
  });
};

const _execute = QuickSQLite.execute;

QuickSQLite.execute = (dbName, query, params) => {
  const result = _execute(dbName, query, params);

  enhanceQueryResult(result);
  return result;
};

const _executeAsync = QuickSQLite.executeAsync;

QuickSQLite.executeAsync = async (dbName, query, params) => {
  const res = await _executeAsync(dbName, query, params);
  enhanceQueryResult(res);
  return res;
};

QuickSQLite.transaction = (dbName, callback) => {
  if (!locks[dbName]) {
    throw Error(`No lock found on db: ${dbName}`);
  } // Local transaction context object implementation


  const execute = (query, params) => {
    return QuickSQLite.execute(dbName, query, params);
  };

  const tx = {
    start: () => {
      try {
        QuickSQLite.execute(dbName, 'BEGIN TRANSACTION', null);
        callback({
          execute
        });
        QuickSQLite.execute(dbName, 'COMMIT', null);
      } catch (e) {
        QuickSQLite.execute(dbName, 'ROLLBACK', null);
        throw e;
      } finally {
        locks[dbName].inProgress = false;
        startNextTransaction(dbName);
      }
    }
  };
  locks[dbName].queue.push(tx);
  startNextTransaction(dbName);
};

QuickSQLite.transactionAsync = (dbName, callback) => {
  if (!locks[dbName]) {
    throw Error(`Quick SQLite Error: No lock found on db: ${dbName}`);
  } // Local transaction context object implementation


  const execute = (query, params) => {
    return QuickSQLite.execute(dbName, query, params);
  };

  const executeAsync = (query, params) => {
    return QuickSQLite.executeAsync(dbName, query, params);
  };

  const tx = {
    start: async () => {
      try {
        QuickSQLite.execute(dbName, 'BEGIN TRANSACTION', null);
        await callback({
          execute,
          executeAsync
        });
        QuickSQLite.execute(dbName, 'COMMIT', null);
      } catch (e) {
        QuickSQLite.execute(dbName, 'ROLLBACK', null);
        throw e;
      } finally {
        locks[dbName].inProgress = false;
        startNextTransaction(dbName);
      }
    }
  };
  locks[dbName].queue.push(tx);
  startNextTransaction(dbName);
};

const startNextTransaction = dbName => {
  if (locks[dbName].inProgress) {
    // Transaction is already in process bail out
    return;
  }

  setImmediate(() => {
    if (!locks[dbName]) {
      throw Error(`Lock not found for db ${dbName}`);
    }

    if (locks[dbName].queue.length) {
      locks[dbName].inProgress = true;
      locks[dbName].queue.shift().start();
    }
  });
}; //   _________     _______  ______ ____  _____  __  __            _____ _____
//  |__   __\ \   / /  __ \|  ____/ __ \|  __ \|  \/  |     /\   |  __ \_   _|
//     | |   \ \_/ /| |__) | |__ | |  | | |__) | \  / |    /  \  | |__) || |
//     | |    \   / |  ___/|  __|| |  | |  _  /| |\/| |   / /\ \ |  ___/ | |
//     | |     | |  | |    | |___| |__| | | \ \| |  | |  / ____ \| |    _| |_
//     |_|     |_|  |_|    |______\____/|_|  \_\_|  |_| /_/    \_\_|   |_____|


/**
 * DO NOT USE THIS! THIS IS MEANT FOR TYPEORM
 * If you are looking for a convenience wrapper use `connect`
 */
const openDatabase = (options, ok, fail) => {
  try {
    QuickSQLite.open(options.name, options.location);
    const connection = {
      execute: (sql, params, ok, fail) => {
        try {
          let response = QuickSQLite.execute(options.name, sql, params);
          enhanceQueryResult(response);
          ok(response);
        } catch (e) {
          fail(e);
        }
      },
      transaction: fn => {
        QuickSQLite.transaction(options.name, fn);
      },
      close: (ok, fail) => {
        try {
          QuickSQLite.close(options.name);
          ok();
        } catch (e) {
          fail(e);
        }
      },
      attach: (dbNameToAttach, alias, location, callback) => {
        QuickSQLite.attach(options.name, dbNameToAttach, alias, location);
        callback();
      },
      detach: (alias, callback) => {
        QuickSQLite.detach(options.name, alias);
        callback();
      }
    };
    ok(connection);
    return connection;
  } catch (e) {
    fail(e);
  }
};

exports.openDatabase = openDatabase;

const open = options => {
  QuickSQLite.open(options.name, options.location);
  return {
    close: () => QuickSQLite.close(options.name),
    delete: () => QuickSQLite.delete(options.name, options.location),
    attach: (dbNameToAttach, alias, location) => QuickSQLite.attach(options.name, dbNameToAttach, alias, location),
    detach: alias => QuickSQLite.detach(options.name, alias),
    transactionAsync: fn => QuickSQLite.transactionAsync(options.name, fn),
    transaction: fn => QuickSQLite.transaction(options.name, fn),
    execute: (query, params) => QuickSQLite.execute(options.name, query, params),
    executeAsync: (query, params) => QuickSQLite.executeAsync(options.name, query, params),
    executeBatch: commands => QuickSQLite.executeBatch(options.name, commands),
    executeBatchAsync: commands => QuickSQLite.executeBatchAsync(options.name, commands),
    loadFile: location => QuickSQLite.loadFile(options.name, location),
    loadFileAsync: location => QuickSQLite.loadFileAsync(options.name, location)
  };
};

exports.open = open;
//# sourceMappingURL=index.js.map