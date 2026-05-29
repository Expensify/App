# `react-native-onyx` patches

### [react-native-onyx+3.0.73.patch](react-native-onyx+3.0.73.patch)

Contains two unrelated changes:

1. **Skippable collection member IDs revert**

   - Reason:

     > Reverts [Onyx PR #770 (the subscription-side skip for skippable collection member ids in subscribeToKey)](https://github.com/Expensify/react-native-onyx/pull/770) and the line [PR #779](https://github.com/Expensify/react-native-onyx/pull/779) added to work around [PR #770](https://github.com/Expensify/react-native-onyx/pull/770)'s silent-no-callback contract.

   - Upstream PR/issue: https://github.com/Expensify/react-native-onyx/pull/785
   - E/App issue: https://github.com/Expensify/App/issues/86181
   - PR Introducing Patch: https://github.com/Expensify/App/pull/90764

2. **`JSON.parse` benchmark in `SQLiteProvider.getAll`**

   - Reason:

     > Times the `JSON.parse` loop (excluding the SQL query) during Onyx's initial bulk hydration and stashes totals on `globalThis.__onyxInitialParse`. App code reads this in `src/setup/telemetry/index.native.ts` and forwards to Sentry. Measurement only — no behavioral change.

   - E/App issue: https://github.com/Expensify/App/issues/89652