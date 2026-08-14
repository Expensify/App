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

### [@fullstory+react-native+1.9.0+002+stable-static-ref-wrapper.patch](@fullstory+react-native+1.9.0+002+stable-static-ref-wrapper.patch)

- Reason:

    FullStory creates a new callback wrapper every time `applyFSPropertiesWithRef()` receives an existing ref, including when annotations are static. Components that update state from their ref callback can then enter a detach/render/attach loop because the wrapper identity changes on every render. Cache wrappers for stable refs when annotations are static, while continuing to recreate wrappers for dynamic FullStory attributes.

- Upstream PR/issue: -
- E/App issue: -
- PR introducing patch: -
