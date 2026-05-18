# `awesome-phonenumber` patches

### [awesome-phonenumber+5.4.0+001+support-worklet.patch](awesome-phonenumber+5.4.0+001+support-worklet.patch)

- Reason:
  
    ```
    This patch adds a worklet to the `parsePhoneNumber` function of this library so that it can run on the UI thread on our app’s native platform.
    ```
  
- Upstream PR/issue: `'worklet';` is only relevant when used with `react-native-reanimated`, so creating a PR/issue for the library to support it would not be appropriate.
- E/App issue: https://github.com/Expensify/App/issues/73397
- PR introducing patch: https://github.com/Expensify/App/pull/75240