# `@fullstory/react-native` patches

### [@fullstory+react-native+1.9.0.patch](@fullstory+react-native+1.9.0.patch)

- Reason:

    ```
    Version 1.9.0 introduced the onFullstoryDidStartSession event emitter API (PR #147).
    The implementation stores a C++ lambda — which implicitly captures `this` (the
    NativeFullStorySpecJSI TurboModule object) — inside the ObjC FullStory module's
    _eventEmitterCallback field.

    In HybridApp, the JS runtime is torn down when switching from ND to OD (after sign in with SAML),
    destroying the C++ TurboModule. However, the ObjC FullStory instance stays alive as
    an FS SDK delegate. When the app returns to the foreground, FullStory fires
    fullstoryDidStartSession:, which invokes _eventEmitterCallback — a lambda that now
    holds a dangling pointer to the destroyed C++ object. Accessing the freed
    eventEmitterMap_ causes a crash in std::__hash_table::__rehash_unique
    (bad_array_new_length / overflow_error).

    The fix adds an invalidate method that clears _eventEmitterCallback (destroying the
    dangling lambda when the bridge tears down) and guards the emitOnSessionStarted: call
    so it is skipped if the callback has already been cleared.
    ```

- Upstream PR/issue: 🛑 TODO
- E/App issue: https://github.com/Expensify/App/issues/91225
- PR introducing patch: 🛑 TODO
