# `expo` patches

### [expo+55.0.0+001+fix-hmrclient-race-condition.patch](expo+55.0.0+001+fix-hmrclient-race-condition.patch)

- Reason:

    ```
    On native platforms, HMRClient.setup() is called asynchronously from native code (DevServerHelper.cpp),
    but registerBundle() can be called synchronously during module loading when a dynamic import() triggers.
    This race condition causes a crash: "Expected HMRClient.setup() call at startup."
    The fix queues entry points in pendingEntryPoints when hmrClient is not yet initialized,
    matching the existing pattern used by the log() method. Queued entry points are processed
    when setup() eventually calls registerBundleEntryPoints().
    ```

- Upstream PR/issue: TODO
- E/App issue: TODO
- PR introducing patch: TODO
