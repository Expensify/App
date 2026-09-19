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

### [expo-image-manipulator+57.0.6+003+fix-android-10bit-hdr-jpeg-encoding.patch](expo-image-manipulator+57.0.6+003+fix-android-10bit-hdr-jpeg-encoding.patch)

- Reason:
  
    ```
    On Android 13+, `BitmapFactory` decodes 10-bit HEIC into an `RGBA_1010102` bitmap even though Glide asks for
    `ARGB_8888` (`SkAndroidCodec::computeOutputColorType` picks it for any 10-bit HEIF). Skia's JPEG encoder has
    no scanline transform for that pixel format, so `Bitmap.compress` returned `false` and `saveAsync` reported
    success while leaving a 0-byte JPEG behind, which then failed to upload. The patch redraws `RGBA_1010102`
    bitmaps (and only those; `HARDWARE` bitmaps in particular must not be drawn to a software `Canvas`) into an
    sRGB `ARGB_8888` bitmap before encoding, and turns a `false` from `compress` into `ImageWriteFailedException`
    (deleting the empty file) instead of silently reporting success.

    Newer Skia builds added `RGBA_1010102` support to the JPEG encoder, so on some Android 14+ devices
    `compress` may already succeed and the redraw is a cheap no-op there. Verified behaviour per API level:
    - API 33 (Android 13): 🛑 TODO — fails without the patch, passes with it
    - API 34+ (Android 14/15): 🛑 TODO
    ```
  
- Upstream PR/issue: 🛑 TODO
- E/App issue: https://github.com/Expensify/App/issues/101348
- PR introducing patch: 🛑 TODO
