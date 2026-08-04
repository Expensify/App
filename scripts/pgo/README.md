# Local Android PGO proof

This is an experimental, local-only LLVM PGO workflow for the standalone Android arm64 build. It uses the project's `release` variant: optimized native code and a bundled production JavaScript bundle, signed with the local debug key so it can be installed without release credentials. It does not publish artifacts and it does not add application metrics.

## Preconditions

- A physical arm64 Android device connected through `adb`.
- `ANDROID_NDK_HOME` points at NDK `27.1.12297006`, the version pinned in `Mobile-Expensify/Android/build.gradle`.
- A signed-in, seeded test account and the agreed manual NewDot journey.
- Dependencies have had the repository's patches applied.

## Collect one profile

1. Build and install the instrumented application:

   ```bash
   scripts/pgo/android-local-proof.sh build-instrumented
   scripts/pgo/android-local-proof.sh install
   ```

2. Run the manual authenticated journey once: open and scroll chats, send a message, visit and modify reversible workspace settings, attach an image and document, view attachments, then use search.
3. Persist the counters before force-stopping the application:

   ```bash
   scripts/pgo/android-local-proof.sh dump
   scripts/pgo/android-local-proof.sh pull
   scripts/pgo/android-local-proof.sh merge
   ```

   Profiles are written to the app's external cache so they can be retrieved from a non-debuggable release APK with `adb pull`.

4. Build the matched optimized application:

   ```bash
   scripts/pgo/android-local-proof.sh build-optimized
   ```

The `.pgo/` directory is intentionally local-only. Never apply this profile to another ABI, build mode, NDK version, or substantially different source revision. A production-release comparison additionally needs the repository's R8/SafetyNet dependency issue fixed; this local proof deliberately does not change that unrelated configuration.

## Compare

Install the non-PGO and PGO APKs separately. For each build, sign in once, exclude the first post-install run, force-stop before every subsequent run, and record ten repetitions of the same journey with `am start -W` and Perfetto. Keep attachment-upload latency diagnostic only; use cold start and local interaction/frame timing as the primary decision metrics.
