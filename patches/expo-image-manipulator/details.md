# `expo-image-manipulator` patches

### [expo-image-manipulator+58.0.14+001+adjust-ios-canvas-size.patch](expo-image-manipulator+58.0.14+001+adjust-ios-canvas-size.patch)

- Reason:
  
    ```
    Safari on iOS cannot draw a canvas larger than 4096px on a side, so manipulating a bigger image on mobile web
    produces a blank result. On mobile iOS browsers, the patch scales the canvas down to fit 4096px while keeping
    the aspect ratio. The cap is applied to the size returned by the opt-in `maxWidth`/`maxHeight` step
    (`boundedSize`). The patch edits the shipped `build/web/utils.web.js`, because `src/` is only reachable through
    the `expo-source` export condition, which no bundler here enables.
    ```
  
- Upstream PR/issue: 🛑, there's no upstream PR/issue found. There's a related comment from App PR https://github.com/Expensify/App/pull/45448#issuecomment-2263252274
- E/App issue: https://github.com/Expensify/App/issues/44084
- PR introducing patch: https://github.com/Expensify/App/pull/45448

### [expo-image-manipulator+58.0.14+002+fix-orientation-10bit-hdr.patch](expo-image-manipulator+58.0.14+002+fix-orientation-10bit-hdr.patch)

- Reason:
  
    ```
    `ImageFixOrientationTransformer` skips the redraw when an image is already upright. An upright HDR image with a
    PQ or HLG transfer function then keeps that profile in the saved JPEG, and decoders without ITU-R BT.2100 support
    render it black. The patch adds one condition to that early return, so upright PQ/HLG images are redrawn too,
    which tone-maps them to standard range.

    This repo builds the module from source (there is no xcframework next to the podspec), so the Swift change
    applies. If precompiled Expo modules are ever enabled, keep this module building from source or the patch stops
    applying.
    ```
  
- Upstream PR/issue: The 10-bit HDR crash this patch first fixed was fixed upstream in https://github.com/expo/expo/pull/50011 (merged, shipped in 58.0.9). The PQ/HLG redraw is not upstream yet. 🛑 no upstream PR.
- E/App issue: https://github.com/Expensify/App/issues/100133
- PR introducing patch: https://github.com/Expensify/App/pull/101102
