# `expo-image-manipulator` patches

### [expo-image-manipulator+58.0.14+001+adjust-ios-canvas-size.patch](expo-image-manipulator+58.0.14+001+adjust-ios-canvas-size.patch)

- Reason:
  
    ```
    This patch adjusts ios canvas size.
    ```
  
- Upstream PR/issue: 🛑, there's no upstream PR/issue found. There's a related comment from App PR https://github.com/Expensify/App/pull/45448#issuecomment-2263252274
- E/App issue: https://github.com/Expensify/App/issues/44084
- PR introducing patch: https://github.com/Expensify/App/pull/45448
- SDK 58 port: the 4096px cap now runs on the result of the new opt-in `maxWidth`/`maxHeight` (`boundedSize`) step. The package `main` moved from `src/index.ts` to `build/index.js`, so the patch now edits `build/web/utils.web.js` as well as `src/web/utils.web.ts`; without that the fix would not run on web.

### [expo-image-manipulator+58.0.14+002+fix-orientation-10bit-hdr.patch](expo-image-manipulator+58.0.14+002+fix-orientation-10bit-hdr.patch)

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
- SDK 58 port: the 10-bit HDR redraw is upstream (expo/expo#50011, shipped in 58.0.9), so that part was dropped. The only remaining change also redraws upright images with a PQ/HLG transfer function, as one extra condition on upstream's early return. Note: expo-image-manipulator ships a prebuilt iOS framework, so this Swift change only takes effect when the module is built from source.
