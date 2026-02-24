# `expo-secure-store` patches

### [expo-secure-store+14.2.4+001+enable-device-fallback.patch](expo-secure-store+14.2.4+001+enable-device-fallback.patch)

- Reason:

    ```
    We need to enable users to use any device screen lock instead of biometrics.
    This is not enabled in the SecureStore, so this patch changes the required input to either biometrics or screen lock knowledge if the 'enableDeviceFallback' flag is set to true.
    Additionally, support for screen locks can be checked using the new 'canUseDeviceCredentialsAuthentication' method. 
    ```

- Upstream PR/issue: https://github.com/expo/expo/pull/41409
- E/App issue: https://github.com/Expensify/App/issues/75225
- PR introducing patch: https://github.com/Expensify/App/pull/76288

### [expo-secure-store+14.2.4+002+return-auth-type.patch](expo-secure-store+14.2.4+002+return-auth-type.patch)

- Reason:

    ```
    This patch adds the `returnUsedAuthenticationType` flag.
    When this flag is set to true, the get methods of SecureStore will return a two-element array. 
    The first value will be the original value returned when this flag is set to false.
    The second value is the authentication type used to read the value from the AUTH_TYPE object.
    As for the set function, the returned value will simply be AUTH_TYPE.
    It uses a pre-defined constant that mimics an enum and can also be imported directly from the app.
    ```

- Upstream PR/issue: TBA
- E/App issue: https://github.com/Expensify/App/issues/75225
- PR introducing patch: https://github.com/Expensify/App/pull/76288

### [expo-secure-store+14.2.4+003+force-authentication-on-save.patch](expo-secure-store+14.2.4+003+force-authentication-on-save.patch)

- Reason:

    ```
    The iOS does not require authentication when a value is saved to the keychain. We cannot force iOS to do so.
    However, to maintain consistency with Android, setting the 'forceAuthenticationOnSave' flag to true results in a prompt appearing
    before the value is saved. This only works in the asynchronous version of the save method.
    ```

- Upstream PR/issue: TBA
- E/App issue: https://github.com/Expensify/App/issues/75225
- PR introducing patch: https://github.com/Expensify/App/pull/76288

### [expo-secure-store+14.2.4+004+fail-on-update.patch](expo-secure-store+14.2.4+004+fail-on-update.patch)

- Reason:

    ```
    If a value already exists in the SecureStore and a new one is saved, the existing value is simply overwritten.
    To avoid unexpected behaviour, set the 'failOnUpdate' flag to true to trigger an error when the given key is already in the store.
    ```

- Upstream PR/issue: TBA
- E/App issue: https://github.com/Expensify/App/issues/75225
- PR introducing patch: https://github.com/Expensify/App/pull/76288

### [expo-secure-store+14.2.4+005+force-read-authentication-on-simulators.patch](expo-secure-store+14.2.4+005+force-read-authentication-on-simulators.patch)

- Reason:

    ```
    The LocalAuthentication behaves slightly differently on iOS simulators.
    In numerous cases, the authentication prompts are skipped on simulators (as opposed to real devices).
    Setting 'forceReadAuthenticationOnSimulators' flag to true forces the prompt to appear on simulators when a value with the `requireAuthentication` flag set to true is read.
    The flag is added is purely for testing the app on simulators, in cases where the prompt does not appear when the value is read.
    It has no effect on real devices.
    ```

- Upstream PR/issue: TBA
- E/App issue: https://github.com/Expensify/App/issues/75225
- PR introducing patch: https://github.com/Expensify/App/pull/76288

