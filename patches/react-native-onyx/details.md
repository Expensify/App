# `react-native-onyx` patches

### [react-native-onyx+3.0.71.patch](react-native-onyx+3.0.71.patch)

- Reason:

  > Reverts [Onyx PR #770 (the subscription-side skip for skippable collection member ids in subscribeToKey)](https://github.com/Expensify/react-native-onyx/pull/770) and the line [PR #779](https://github.com/Expensify/react-native-onyx/pull/779) added to work around [PR #770](https://github.com/Expensify/react-native-onyx/pull/770)'s silent-no-callback contract.

- Upstream PR/issue: https://github.com/Expensify/react-native-onyx/pull/785
- E/App issue: https://github.com/Expensify/App/issues/86181
- PR Introducing Patch: https://github.com/Expensify/App/pull/90764