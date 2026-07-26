# `@shopify/react-native-skia` patches

### [@shopify+react-native-skia+2.4.14+001+fix-runtime-aware-cache-uaf.patch](@shopify+react-native-skia+2.4.14+001+fix-runtime-aware-cache-uaf.patch)

- Reason:

    ```
    Fixes an intermittent UAF crash (EXC_BAD_ACCESS / SIGSEGV; Sentry APP-AVB) when
    switching from NewDot to Expensify Classic on iOS HybridApp. RuntimeAwareCache
    only tracks the lifecycle of secondary runtimes; for the primary runtime it
    assumes the cache owner dies first. The HybridApp handoff breaks that - it tears
    down the RN runtime while Skia host objects are still being released on the main
    queue, so ~RuntimeAwareCache destroys cached jsi::Function entries into freed
    runtime memory.

    Fix: extend skia's own secondary-runtime handling to the primary runtime -
    register a RuntimeLifecycleMonitor listener (from get(), on the JS thread) and
    clear _primaryCache in onRuntimeDestroyed, while the runtime is still valid,
    instead of in the later main-queue destructor. A mutex makes that teardown
    race-safe; no memory is leaked.
    ```

- Upstream PR/issue:
- E/App issue: https://github.com/Expensify/App/issues/90135
- PR introducing patch: https://github.com/Expensify/App/pull/93295
