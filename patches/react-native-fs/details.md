# `react-native-fs` patches

### [react-native-fs+2.20.0+001+fix-promise-rejection-failing-with-null.patch](react-native-fs+2.20.0+001+fix-promise-rejection-failing-with-null.patch)

- Reason:

    ```
    This patch fixes an issue where promises are not properly rejected to to an invalid `null` value passed as the error on Android.
    ```

- Upstream PR/issue: https://github.com/itinance/react-native-fs/pull/1259
- E/App issue: https://github.com/Expensify/App/issues/59443
- PR introducing patch: https://github.com/Expensify/App/pull/86677
