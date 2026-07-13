# `react-native-vision-camera` patches

### [react-native-vision-camera+4.7.2+001+fix-main-thread-hang-on-ios.patch](react-native-vision-camera+4.7.2+001+fix-main-thread-hang-on-ios.patch)

- Reason: Fixes iOS main-thread hangs when leaving a screen that uses the camera. VisionCamera could deallocate its preview while `AVCaptureSession` was still busy configuring, causing the main thread to wait on the capture-session lock.
  - **How it works**: Deactivates camera resources before teardown, uses a thread-safe counter to cancel stale configuration calls, and adds logging for slow or completed configurations.
  - **Upstream source**: Applies the final three-file diff from [react-native-vision-camera PR #3664](https://github.com/mrousavy/react-native-vision-camera/pull/3664). The library's creator and maintainer reviewed that PR, and the author revised it in response to the feedback. It was closed without merging only because VisionCamera V5 had rewritten the upstream codebase, making the diff obsolete against upstream `main`.
  - **Why it was patched locally**: As explained in the [decision to patch locally](https://github.com/Expensify/App/issues/91293#issuecomment-4917304380), this was a known bug in the VisionCamera version used when the patch was introduced. At that time, upgrading to V5 was not a targeted alternative because it was a major rewrite that was still receiving similar reports, so porting the reviewed fix to the existing version was the lower-risk approach.

- Upstream PR/issue: https://github.com/mrousavy/react-native-vision-camera/issues/3636, https://github.com/mrousavy/react-native-vision-camera/pull/3664
- E/App issue: https://github.com/Expensify/App/issues/91293
- PR introducing patch: 
