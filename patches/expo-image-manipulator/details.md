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
