# react-native-nitro-sqlite patches

### [react-native-nitro-sqlite+9.6.0+001+dont-mask-original-error-on-rollback-failure.patch](react-native-nitro-sqlite+9.6.0+001+dont-mask-original-error-on-rollback-failure.patch)

- Reason:

    ```
    When a statement inside executeBatch fails and SQLite has already auto-rolled the transaction
    back (disk-full I/O errors do this), the library's own ROLLBACK fails with "cannot rollback -
    no transaction is active" and that error is thrown instead of the original one, hiding the real
    failure (~2.8k masked log lines/day on iOS). The patch wraps both ROLLBACK calls in try/catch
    so the original error is rethrown.
    ```

- Upstream PR/issue: Already fixed upstream in 9.7.0 via https://github.com/margelo/react-native-nitro-sqlite/pull/292. We stay on 9.6.0 because the 9.7.0 podspec force-enables `SQLITE_THREADSAFE=0` on iOS and its new per-database queue breaks second opens of the same database (used by `src/libs/ExportOnyxState/index.native.ts`). The patch can be dropped when those are resolved and we bump.
- E/App issue: https://github.com/Expensify/App/issues/97908
- PR introducing patch: https://github.com/Expensify/App/pull/97954

### [react-native-nitro-sqlite+9.6.0+002+store-database-outside-documents.patch](react-native-nitro-sqlite+9.6.0+002+store-database-outside-documents.patch)

- Reason:

    ```
    The library stores SQLite databases in the iOS Documents directory, which is exposed to users
    via the Files app when file sharing is enabled. This patch stores databases in
    Library/Application Support instead (persistent, backed up, never user-visible) and migrates
    databases created by older app versions out of Documents on first launch. The database and its
    -wal/-shm journal files are copied as a set before the originals are deleted, and if the copy
    fails the database keeps being opened from Documents and the migration retries on the next
    launch, so committed writes are never separated from their WAL.
    ```

- Upstream PR/issue: https://github.com/margelo/react-native-nitro-sqlite/issues/289
- E/App issue: https://github.com/Expensify/App/issues/96649
- PR introducing patch: https://github.com/Expensify/App/pull/96531
