# `expo-image-manipulator` patches

### [expo-image-manipulator+57.0.6+001+adjust-ios-canvas-size.patch](expo-image-manipulator+57.0.6+001+adjust-ios-canvas-size.patch)

- Reason:
  
    ```
    This patch adjusts ios canvas size.
    ```
  
- Upstream PR/issue: 🛑, there's no upstream PR/issue found. There's a related comment from App PR https://github.com/Expensify/App/pull/45448#issuecomment-2263252274
- E/App issue: https://github.com/Expensify/App/issues/44084
- PR introducing patch: https://github.com/Expensify/App/pull/45448

### [expo-image-manipulator+57.0.6+002+fix-orientation-10bit-hdr.patch](expo-image-manipulator+57.0.6+002+fix-orientation-10bit-hdr.patch)

- Reason:
  
    ```
    `ImageFixOrientationTransformer` built its `CGContext` with `bitsPerComponent` copied from the source image.
    `CGBitmapContext` rejects 10 bits per component, so it returned nil and the transformer threw
    `ImageContextLostException` for every 10-bit HDR HEIC, blocking HEIC to JPEG conversion. Following PR #50011,
    skip the redraw when the image is already upright, otherwise redraw through `drawInNewContext`. Upright images
    with a PQ or HLG profile are redrawn too, since that profile would otherwise survive into the saved JPEG and
    render black.
    ```
  
- Upstream PR/issue: https://github.com/expo/expo/pull/50011 (open), fixes https://github.com/expo/expo/issues/49953. Alternative fix under review in https://github.com/expo/expo/pull/50009
- E/App issue: https://github.com/Expensify/App/issues/100133
- PR introducing patch: https://github.com/Expensify/App/pull/101102
