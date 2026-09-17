# react-native-nitro-sqlite patches

### [react-native-nitro-sqlite+9.8.0+001+default-to-application-support.patch](react-native-nitro-sqlite+9.8.0+001+default-to-application-support.patch)

- Reason: Use NitroSQLite's upstream Application Support location and database migration by default in both standalone NewDot and the hybrid app. The hybrid app has its own Info.plist, so configuring only the NewDot target would leave its database in the user-visible Documents directory.
- Upstream support: https://github.com/margelo/react-native-nitro-sqlite/issues/289
- E/App issue: https://github.com/Expensify/App/issues/96649
- Original patch: https://github.com/Expensify/App/pull/96531
