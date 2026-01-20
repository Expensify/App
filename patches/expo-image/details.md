# `expo-image-manipulator` patches

### [expo-image+3.0.8+001+make-expo-53-compatible.patch](expo-image+3.0.8+001+make-expo-53-compatible.patch)

- Reason:
  
    ```
    The expo-image 3.0.8 doesn't support expo-modules-core of version < 3 which is required for expo 53. 
    We need expo-image 3.0.8+ for android 16kb pages compatibility
    ```
  
- Upstream PR/issue: 🛑, commented in the App PR https://github.com/Expensify/App/issues/63871
- E/App issue: https://github.com/Expensify/App/issues/63871
- PR introducing patch: https://github.com/Expensify/App/pull/71774