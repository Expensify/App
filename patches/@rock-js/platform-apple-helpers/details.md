# `@rock-js/platform-apple-helpers` patches

### [@rock-js+platform-apple-helpers+0.11.6+001+fix-ios-remote-builds.patch](@rock-js+platform-apple-helpers+0.11.6+001+fix-ios-remote-builds.patch)

- Reason:

    ```
    Remote builds are failing due to bug in setting env variables in rock - https://github.com/callstackincubator/rock/blob/2274e6bf895a4bf456a43e795af4bd5166c09463/packages/platform-apple-helpers/src/lib/utils/pods.ts#L136
    This patch temporary sets `RCT_USE_RN_DEP` and `RCT_USE_PREBUILT_RNCORE` to `0` until real fix is applied in the upstream repo
    ```

- Upstream PR/issue: N/A I will create an upstream PR once those changes are merged
- E/App issue: N/A patch will be removed very soon
- PR introducing patch: https://github.com/Expensify/App/pull/73829
