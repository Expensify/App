![screenshot](https://raw.githubusercontent.com/ospfranco/react-native-quick-sqlite/main/header2.png)

<div align="center">
  <pre align="center">
    yarn add react-native-quick-sqlite
    npx pod-install</pre>
  <a align="center" href="https://github.com/ospfranco?tab=followers">
    <img src="https://img.shields.io/github/followers/ospfranco?label=Follow%20%40ospfranco&style=social" />
  </a>
  <br />
  <a align="center" href="https://twitter.com/ospfranco">
    <img src="https://img.shields.io/twitter/follow/ospfranco?label=Follow%20%40ospfranco&style=social" />
  </a>
</div>
<br />

Quick SQLite embeds the latest version of SQLite and provides a low-level JSI-backed API to execute SQL queries. By using an embedded SQLite you get access to the latest security patches and features.

Performance metrics are intentionally not presented, [anecdotic testimonies](https://dev.to/craftzdog/a-performant-way-to-use-pouchdb7-on-react-native-in-2022-24ej) suggest anywhere between 2x and 5x speed improvement.

**Javascript cannot represent integers larger than 53 bits**, be careful when loading data if it came from other systems. [Read more](https://github.com/ospfranco/react-native-quick-sqlite/issues/16#issuecomment-1018412991).

## API

```typescript
import {open} from 'react-native-quick-sqlite'

const db = open('myDb.sqlite')

// The db object now contains the following methods:

db = {
  close: () => void,
  delete: () => void,
  attach: (dbNameToAttach: string, alias: string, location?: string) => void,
  detach: (alias: string) => void,
  transactionAsync: (fn: (tx: TransactionAsync) => Promise<void>) => void,
  transaction: (fn: (tx: Transaction) => void) => void,
  execute: (query: string, params?: any[]) => QueryResult,
  executeAsync: (
    query: string,
    params?: any[]
  ) => Promise<QueryResult>,
  executeBatch: (commands: SQLBatchParams[]) => BatchQueryResult,
  executeBatchAsync: (commands: SQLBatchParams[]) => Promise<BatchQueryResult>,
  loadFile: (location: string) => FileLoadResult;,
  loadFileAsync: (location: string) => Promise<FileLoadResult>
}
```

### Simple queries

The basic query is **synchronous**, it will block rendering on large operations, further below you will find async versions.

```typescript
import { open } from 'react-native-quick-sqlite';

try {
  const db = open('myDb.sqlite');

  let { rows } = db.execute('SELECT somevalue FROM sometable');

  rows.forEach((row) => {
    console.log(row);
  });

  let { rowsAffected } = await db.executeAsync(
    'UPDATE sometable SET somecolumn = ? where somekey = ?',
    [0, 1]
  );

  console.log(`Update affected ${rowsAffected} rows`);
} catch (e) {
  console.error('Something went wrong executing SQL commands:', e.message);
}
```

### Transactions

Transactions are supported. Throwing an error inside the callback will ROLLBACK the transaction.

JSI bindings are fast but there is still some overhead calling `execute` for single queries, if you want to execute a large set of commands as fast as possible you should use the `executeBatch` method, it wraps all the commands in a transaction, but has less overhead.

```typescript
QuickSQLite.transaction('myDatabase', (tx) => {
  const { status } = tx.execute(
    'UPDATE sometable SET somecolumn = ? where somekey = ?',
    [0, 1]
  );

  throw new Error('Random Error!'); // Will ROLLBACK transaction
});
```

Async transactions are also possible:

```ts
QuickSQLite.transactionAsync('myDatabase', async (tx) => {
  tx.execute('UPDATE sometable SET somecolumn = ? where somekey = ?', [0, 1]);

  await tx.executeAsync(
    'UPDATE sometable SET somecolumn = ? where somekey = ?',
    [0, 1]
  );
});
```

### Batch operation

Batch execution allows transactional execution of a set of commands

```typescript
const commands = [
  ['CREATE TABLE TEST (id integer)'],
  ['INSERT INTO TEST (id) VALUES (?)', [1]],
  [('INSERT INTO TEST (id) VALUES (?)', [2])],
  [('INSERT INTO TEST (id) VALUES (?)', [[3], [4], [5], [6]])],
];

const res = QuickSQLite.executeSqlBatch('myDatabase', commands);

console.log(`Batch affected ${result.rowsAffected} rows`);
```

### Dynamic Column Metadata

In some scenarios, dynamic applications may need to get some metadata information about the returned result set.

This can be done by testing the returned data directly, but in some cases may not be enough, for example when data is stored outside
sqlite datatypes. When fetching data directly from tables or views linked to table columns, SQLite is able
to identify the table declared types:

```typescript
let { metadata } = QuickSQLite.executeSql(
  'myDatabase',
  'SELECT int_column_1, bol_column_2 FROM sometable'
);

metadata.forEach((column) => {
  // Output:
  // int_column_1 - INTEGER
  // bol_column_2 - BOOLEAN
  console.log(`${column.columnName} - ${column.columnDeclaredType}`);
});
```

### Async operations

You might have too much SQL to process and it will cause your application to freeze. There are async versions for some of the operations. This will offload the SQLite processing to a different thread.

```ts
QuickSQLite.executeAsync(
  'myDatabase',
  'SELECT * FROM "User";',
  []).then(({rows}) => {
    console.log('users', rows);
  })
);
```

### Attach or Detach other databases

SQLite supports to attaching or detaching other database files into your main database connection through an alias.
You can do any operation you like on this attached database like JOIN results across tables in different schemas, or update data or objects.
This databases can have different configurations, like journal modes, cache settings.

You can, at any moment, detach a database that you don't need anymore.
Note: You don't need to detach an attached database before closing your connection. Closing the main connection
will dettach any attached databases.
SQLite has a limit for attached databases: A default of 10, and a global max of 125

References: [Attach](https://www.sqlite.org/lang_attach.html) - [Detach](https://www.sqlite.org/lang_detach.html)

```ts
QuickSQLite.attach('mainDatabase', 'statistics', 'stats', '../databases');

const res = QuickSQLite.executeSql(
  'mainDatabase',
  'SELECT * FROM some_table_from_mainschema a INNER JOIN stats.some_table b on a.id_column = b.id_column'
);

// You can detach databases at any moment
QuickSQLite.detach('mainDatabase', 'stats');
if (!detachResult.status) {
  // Database de-attached
}
```

### Loading SQL Dump Files
If you have a plain SQL file, you can load it directly, with low memory consumption.

```typescript
const { rowsAffected, commands } = QuickSQLite.loadFile('myDatabase','/absolute/path/to/file.sql');
```

Or use the async version which will load the file in another native thread
```typescript
QuickSQLite.loadFileAsync('myDatabase','/absolute/path/to/file.sql').then((res) => {
  const { rowsAffected, commands } = res;
});
```

## Use built-in SQLite

On iOS you can use the embedded SQLite, when running `pod-install` add an environment flag:

```
QUICK_SQLITE_USE_PHONE_VERSION=1 npx pod-install
```

On Android it is not possible to link (using C++) the embedded SQLite. It is also a bad idea due to vendor changes, old android bugs, etc. Unfortunately, this means this library will add some mbs to your app size.

## Use TypeORM

You can use this library as a driver for [TypeORM](https://github.com/typeorm/typeorm), when initializing the connection use:

```ts
datasource = new DataSource({
  type: 'react-native',
  database: 'typeormdb',
  location: '.',
  driver: require('react-native-quick-sqlite'),
  entities: [Book, User],
  synchronize: true,
});
```

If you are using Node 14+, TypeORM is currently broken with React Native. You can patch your node-modules installation and apply the fix [in this issue](https://github.com/typeorm/typeorm/issues/9178).

# Loading existing DBs

The library creates/opens databases by appending the passed name plus, the [documents directory on iOS](https://github.com/ospfranco/react-native-quick-sqlite/blob/733e876d98896f5efc80f989ae38120f16533a66/ios/QuickSQLite.mm#L34-L35) and the [files directory on Android](https://github.com/ospfranco/react-native-quick-sqlite/blob/main/android/src/main/java/com/reactnativequicksqlite/QuickSQLiteBridge.java#L16), this differs from other SQL libraries (some place it in a `www` folder, some in androids `databases` folder, etc.).

If you have an existing database file you want to load you can navigate from these directories using dot notation. e.g. `../www/myDb.sqlite`. Note that on iOS the file system is sand-boxed, so you cannot access files/directories not in your app bundle directories.

Alternatively you can place/move your database file using one of the many react-native fs libraries.

## Enable compile-time options

By specifying pre-processor flags, you can enable optional features like FTS5, Geopoly, etc.

### iOS

Add a `post_install` block to your `<PROJECT_ROOT>/ios/Podfile` like so:

```ruby
post_install do |installer|
  installer.pods_project.targets.each do |target|
    if target.name == "react-native-quick-sqlite" then
      target.build_configurations.each do |config|
        config.build_settings['GCC_PREPROCESSOR_DEFINITIONS'] ||= ['$(inherited)', '<SQLITE_FLAGS>']
      end
    end
  end
end
```

Replace the `<SQLITE_FLAGS>` part with flags you want to add.
For example, you could add `SQLITE_ENABLE_FTS5=1` to `GCC_PREPROCESSOR_DEFINITIONS` to enable FTS5 in the iOS project.

### Android

You can specify flags via `<PROJECT_ROOT>/android/gradle.properties` like so:

```
quickSqliteFlags="<SQLITE_FLAGS>"
```

## More

If you want to learn how to make your own JSI module buy my [JSI/C++ cheat sheet](http://ospfranco.gumroad.com/).

## License

MIT License.
