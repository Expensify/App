# `@rock-js/plugin-metro` patches

### [@rock-js+plugin-metro+0.13.4+001+fix-expo-packed-source-maps.patch](@rock-js+plugin-metro+0.13.4+001+fix-expo-packed-source-maps.patch)

- Reason:

    ```
    Expo SDK 56 stores per-module source maps in a packed shape
    ({__version, __count, __names, __packed}) that stock metro-source-map can't read,
    throwing "Unexpected module with full source map found" whenever a source map is
    generated.
    Expo's own CLI applies the unpacking shim (patchTransformFileForPackedMaps), but
    Rock instantiates Metro directly and never runs it. This patch applies the same
    shim once on Bundler.prototype.transformFile in pluginMetro.js`.
    Context: Expo packed-map change is https://github.com/expo/expo/pull/45594
    ```

- Upstream PR/issue:
- E/App issue: https://github.com/Expensify/App/issues/91629
- PR introducing patch: https://github.com/Expensify/App/pull/92484
