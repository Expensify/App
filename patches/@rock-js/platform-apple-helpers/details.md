# `@rock-js/platform-apple-helpers` patches

### [@rock-js+platform-apple-helpers+0.13.4+001+xcode-27-devicehub.patch](@rock-js+platform-apple-helpers+0.13.4+001+xcode-27-devicehub.patch)

- Reason:

    ```
    In Xcode 27, Simulator.app is replaced by DeviceHub and is unavailable at
    the selected developer directory. This patch falls back to opening the
    simulator through the devices:// URL, allowing the app to launch on Xcode 27
    simulators.
    ```

- Upstream PR/issue: https://github.com/callstackincubator/rock/issues/729
- E/App issue: N/A — temporary compatibility patch; remove it once the upstream fix is available in the dependency.
- PR introducing patch: N/A — introduced on the current branch.
