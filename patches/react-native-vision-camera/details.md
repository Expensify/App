# `react-native-vision-camera` patches

### [react-native-vision-camera+4.7.2+001+fix-ios-camera-teardown-hang-and-config-leak.patch](react-native-vision-camera+4.7.2+001+fix-ios-camera-teardown-hang-and-config-leak.patch)

This patch carries two related iOS fixes to `CameraSession.configure`. The second addresses a crash that the first one exposed.

- Reason (1) — **main-thread hangs when leaving a camera screen**: VisionCamera could deallocate its preview while `AVCaptureSession` was still busy configuring, causing the main thread to wait on the capture-session lock.

  - **How it works**: Deactivates camera resources before teardown, uses a thread-safe counter to cancel stale configuration calls, and adds logging for slow or completed configurations.
  - **Upstream source**: Ports the three-file solution from [react-native-vision-camera PR #3664](https://github.com/mrousavy/react-native-vision-camera/pull/3664). The library's creator and maintainer reviewed that PR, and the author revised it in response to the feedback. It was never merged and was ultimately closed as obsolete after VisionCamera V5 rewrote the upstream codebase.
  - **Local correction**: Omits the upstream counter increment from `CameraView.deinit`. Normal configuration closures retain `CameraView` and therefore prevent `deinit`, while the teardown closure does not. Incrementing the counter from `deinit` could consequently invalidate and skip the queued teardown that disables the active camera session.
  - **Why it was patched locally**: As explained in the [decision to patch locally](https://github.com/Expensify/App/issues/91293#issuecomment-4917304380), this was a known bug in the VisionCamera version used when the patch was introduced. At that time, upgrading to V5 was not a targeted alternative because it was a major rewrite that was still receiving similar reports, so porting the reviewed fix to the existing version was the lower-risk approach.

- Reason (2) — **`NSGenericException` from an unbalanced capture-session configuration**: `-[AVCaptureSession stopRunning] stopRunning may not be called between calls to beginConfiguration and commitConfiguration`, thrown from `CameraSession.checkIsActive` on the camera queue.

  - **How it works**: `configure` calls `beginConfiguration()` inside one `if difference.isSessionConfigurationDirty` block and `commitConfiguration()` inside a second block further down, so that input, output and device changes batch into a single hardware update. Any throw between the two — `configureDevice`, `configureOutputs`, the `noDevice` guard, or any of the device-configuration steps that follow it — skipped the commit and left the session's configuration counter permanently held. Every later `startRunning()` or `stopRunning()` on that session then threw, for the remainder of its lifetime. The patch tracks whether the configuration was opened and commits it on the error path, preserving the existing batching on the success path.
  - **Relationship to fix 1**: The defect is upstream and predates this patch. Fix 1 added `deactivateCameraSession()`, which issues a `configure` call during teardown that reaches `checkIsActive` — turning a previously latent leak into a crash on the way out of the camera screen. Closing the upstream hole is preferred to reverting fix 1, which would reintroduce the hangs while leaving the leak in place.
  - **Scope**: Video capture session only. The audio block in the same function has the identical defect, but it is unreachable in this app: `audio` defaults to `false` natively, no call site enables it, `startRecording` is never called, and every throw site in `configureAudioSession` sits behind `if enableAudio`. Revisit if either of those changes.

- Upstream PR/issue:
  - Fix 1: https://github.com/mrousavy/react-native-vision-camera/issues/3636, https://github.com/mrousavy/react-native-vision-camera/pull/3664
  - Fix 2: N/A. The defect is real upstream, but `4.7.2` belongs to the V4 line, which is no longer supported — VisionCamera V5 rewrote this code, so a fix against V4 would not be accepted and a report against the rewritten V5 code would not describe the same source. This is the same situation that closed [PR #3664](https://github.com/mrousavy/react-native-vision-camera/pull/3664) as obsolete. The patch will be dropped if and when we move to V5.
- E/App issue:
  - Fix 1: https://github.com/Expensify/App/issues/91293
  - Fix 2: https://github.com/Expensify/App/issues/97103
- PR introducing patch:
  - Fix 1: https://github.com/Expensify/App/pull/95984
  - Fix 2: https://github.com/Expensify/App/pull/97499
