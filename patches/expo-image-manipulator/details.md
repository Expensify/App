# `expo-image-manipulator` patches

### [expo-image-manipulator+57.0.6+001+adjust-ios-canvas-size.patch](expo-image-manipulator+57.0.6+001+adjust-ios-canvas-size.patch)

- Reason:
  
    ```
    This patch adjusts ios canvas size.
    ```
  
- Upstream PR/issue: 🛑, there's no upstream PR/issue found. There's a related comment from App PR https://github.com/Expensify/App/pull/45448#issuecomment-2263252274
- E/App issue: https://github.com/Expensify/App/issues/44084
- PR introducing patch: https://github.com/Expensify/App/pull/45448


### [expo-image-manipulator+57.0.6+002+fix-orientation-bit-depth.patch](expo-image-manipulator+57.0.6+002+fix-orientation-bit-depth.patch)

- Reason:
  
    ```
    `ImageFixOrientationTransformer` builds its `CGContext` with `bitsPerComponent` from the source image but
    `bitmapInfo` hardcoded to `premultipliedLast`. Only 8-bit RGB is always valid with that flag, so a 10-bit HDR
    HEIC (the default capture and screenshot format on recent iPhones) makes `CGContext` return nil and the
    transformer throw `ImageContextLostException` every time. This patch clamps the context to 8-bit RGB and skips
    the redraw for already-upright images.
    ```
  
- Upstream PR/issue: 🛑, not filed yet.
- E/App issue: https://github.com/Expensify/App/issues/100133
- PR introducing patch: 🛑, not opened yet.
