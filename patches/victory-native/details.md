# `victory-native` patches

### [victory-native+41.21.0+001+horizontal-bars.patch](victory-native+41.21.0+001+horizontal-bars.patch)

- Reason:
  
    ```
    This patch adds support to horizontal bars when rendered in <BarGroup />
    ```
  
- Upstream PR/issue: Not yet. This is urgent patch with deadline.
- E/App issue: https://github.com/Expensify/App/issues/91883
- PR introducing patch: https://github.com/Expensify/App/pull/91659

### [victory-native+41.21.0+002+fix-piesliceangularinset-bug.patch](victory-native+41.21.0+002+fix-piesliceangularinset-bug.patch)

- Reason:
  
    ```
    Fix bug https://github.com/FormidableLabs/victory-native-xl/issues/652
    ```
  
- Upstream PR/issue: https://github.com/FormidableLabs/victory-native-xl/pull/666
- E/App issue: https://github.com/Expensify/App/issues/92114
- PR introducing patch: https://github.com/Expensify/App/pull/92130

### [victory-native+41.21.0+003+canvas-props.patch](victory-native+41.21.0+003+canvas-props.patch)

- Reason:
  
    ```
    Forwards a `canvasProps` prop from CartesianChart/PolarChart to the underlying Skia <Canvas>, so the
    expanded (full-screen) chart can opt into Skia's `__destroyWebGLContextAfterRender` static renderer on
    web. That renders the chart into a plain 2D canvas bitmap and releases the WebGL context, which keeps
    the chart visible through the modal close animation without the WebGL white flash and without holding
    a live GPU context per expanded chart.
    ```
  
- Upstream PR/issue: Not yet.
- E/App issue: https://github.com/Expensify/App/issues/92969
- PR introducing patch: https://github.com/Expensify/App/pull/97698
