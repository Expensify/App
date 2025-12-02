# `expo-secure-store` patches

### [expo-secure-store+14.2.4+001+additional-config-options.patch](expo-secure-store+14.2.4+001+additional-config-options.patch)

- Reason:

    ```
    Expo SecureStore is a great library, but it lacks some of the functionality we need, i.e.:

    - Returning the type of authentication used for accessing the store
    - Allowing the fallback to device credentials
    - Enabling use of device credentials if no biometrics are enrolled/supported.
    - Enforcing iOS to always ask for the authentication when accessing the store (by default iOS skips the authentication if, for example, user unlocked the screen recently with biometrics)
    - Letting user know if the key entry is already stored instead of overwriting it without any feedback


    This is fixed with this patch, but instead of hardcoding solution for above needs, the patch adds it into the SecureStore options
    ```

- Upstream PR/issue: 🛑
- E/App issue: No issue, this patch adjust the library for our needs.
- PR introducing patch: https://github.com/Expensify/App/pull/69863