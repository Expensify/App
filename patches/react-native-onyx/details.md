# `react-native-onyx` patches

### [react-native-onyx+3.0.73.patch](react-native-onyx+3.0.73.patch)

Two unrelated changes bundled in one patch.

**1. Subscriber-side skip revert (original reason for this patch)**

  > Reverts [Onyx PR #770 (the subscription-side skip for skippable collection member ids in subscribeToKey)](https://github.com/Expensify/react-native-onyx/pull/770) and the line [PR #779](https://github.com/Expensify/react-native-onyx/pull/779) added to work around [PR #770](https://github.com/Expensify/react-native-onyx/pull/770)'s silent-no-callback contract.

  - Upstream PR/issue: https://github.com/Expensify/react-native-onyx/pull/785
  - E/App issue: https://github.com/Expensify/App/issues/86181
  - PR Introducing Patch: https://github.com/Expensify/App/pull/90764

**2. JSON parse / stringify benchmark instrumentation in `SQLiteProvider.js`**

  Times `JSON.parse` (in `getAll`) and `JSON.stringify` (in `setItem` / `multiSet` / `multiMerge`) during Onyx's startup window so the totals can be reported to Sentry. Also exposes a `globalThis.__benchmarkOnyxNativeParse(rawRows)` hook fired once on the initial `getAll`, on the same in-memory row data Hermes just parsed — used to A/B-benchmark a native JSON parser (currently the Glaze-backed `JsonParserNitroModule`) against Hermes on identical input. No behavior change — instrumentation only.

  - E/App issue: https://github.com/Expensify/App/issues/89652
  - Originally drafted in https://github.com/Expensify/App/pull/91622