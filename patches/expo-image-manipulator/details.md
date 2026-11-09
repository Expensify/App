# `expo-image-manipulator` patches

### [expo-image-manipulator+58.0.14+001+adjust-ios-canvas-size.patch](expo-image-manipulator+58.0.14+001+adjust-ios-canvas-size.patch)

- Reason:
  
    ```
    This patch adjusts ios canvas size.
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
    ```
  
- Upstream PR/issue: https://github.com/expo/expo/pull/50011 (merged in 58.0.9) fixed the 10-bit crash; the PQ/HLG redraw is not upstream.
- E/App issue: https://github.com/Expensify/App/issues/100133
- PR introducing patch: https://github.com/Expensify/App/pull/101102

### [expo-image-manipulator+58.0.14+003+web-typings.patch](expo-image-manipulator+58.0.14+003+web-typings.patch)

- Reason:

    ```
    The web `ImageManipulatorContext.resize()` requires both `width` and `height`, while the native one makes them
    optional and the web implementation already keeps the aspect ratio when one is missing.
    ```

- Upstream PR/issue: 🛑, upstream PR to be opened. On 57.x the patch also fixed the web default export type (`typeof ImageManipulator` instead of an instance). 58.0.14 ships that fix (https://github.com/expo/expo/pull/49197), so it is no longer part of the patch.
- E/App issue: https://github.com/Expensify/App/issues/99287
- PR introducing patch: https://github.com/Expensify/App/pull/105816
