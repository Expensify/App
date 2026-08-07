# `react-native-nitro-sqlite` patches

### [react-native-nitro-sqlite+9.6.0+001+store-database-outside-documents.patch](react-native-nitro-sqlite+9.6.0+001+store-database-outside-documents.patch)

- Reason:

    ```
    The library stores SQLite databases in the iOS Documents directory, which is exposed to users
    via the Files app when file sharing is enabled. This patch stores databases in
    Library/Application Support instead (persistent, backed up, never user-visible) and migrates
    databases created by older app versions out of Documents on first launch.
    ```

- Upstream PR/issue: https://github.com/margelo/react-native-nitro-sqlite/issues/289
- E/App issue: https://github.com/Expensify/App/issues/96649
- PR introducing patch: https://github.com/Expensify/App/pull/96531
