# Prebuilt React Native Artifacts

We ship a few [patches](PATCHES.md) on top of `react-native`, so the copy we build against is not the
one published on npm. To avoid every developer compiling it locally, CI builds `react-native` with our
patches applied and publishes it to our private GitHub Packages Maven repository.

At build time a resolver hashes the local patches and looks for a published artifact tagged with the
same hash. On a match the build downloads `react-native` instead of compiling it.

If nothing matches — because you added or edited a patch locally, or because credentials are missing —
the build logs a warning and compiles `react-native` from source, so a miss slows the build down but
never fails it.

On iOS that warning is worth reading, because the two modes are different dependency graphs and
`pod install` writes whichever one it resolved into `Podfile.lock`. A degraded install therefore
produces a lockfile roughly 130KB different from the committed one. **The build is fine; the lockfile
is not.** Don't commit it — regenerate once the cause is fixed. CI rejects a lockfile committed in the
wrong mode.

> [!NOTE]
> These are not the remote builds described in the "Running the mobile application using Rock" sections
> of the [iOS](SETUP_IOS.md) and [Android](SETUP_ANDROID.md) setup guides. Rock downloads a complete
> prebuilt app from S3; the artifacts described here are only the `react-native` core, and the two are
> independent of each other.

## Configuring GitHub CLI

The artifacts live in a private package registry, so a build has to authenticate. Locally the
credentials come from the GitHub CLI:

1. **Install GitHub CLI**
   - Install GitHub CLI by following the instructions from [cli.github.com](https://cli.github.com/)

2. **Create a GitHub Personal Access Token**
   - Go to [GitHub Settings > Developer Settings > Personal Access Tokens](https://github.com/settings/tokens)
   - Click "Generate new token (classic)"
   - Select the following scopes:
     - `repo`
     - `read:org`
     - `gist`
     - `read:packages`
   - Copy the generated token

3. **Login to GitHub CLI**
   ```bash
   echo "YOUR_TOKEN" | gh auth login --with-token
   ```

4. **Verify Login**
   ```bash
   gh auth status
   ```
   You should see a message confirming you are authenticated with your GitHub account, and
   `read:packages` among the token scopes.

Without a usable token the build still works, it just compiles `react-native` from source. The
resolver says which part of the setup is missing, so check the build log if you expected a prebuilt —
on iOS it prints a `[RNMode]` warning naming the cause.

In CI there is no GitHub CLI: the credentials are taken from the `GITHUB_TOKEN` and `GITHUB_ACTOR`
environment variables that the workflow provides.

## Disabling prebuilt artifacts on Android

Prebuilt artifacts are enabled by default. To compile `react-native` from source instead:

- Open `android/gradle.properties` (for standalone NewDot) or `Mobile-Expensify/Android/gradle.properties`
  (for HybridApp)
- Set `patchedArtifacts.forceBuildFromSource=true`

To force it for a single Gradle invocation, without editing the properties file:

<!-- cspell:ignore Ppatched -- Gradle's -P flag makes `-PpatchedArtifacts` tokenize as Ppatched + Artifacts -->

```bash
./gradlew <task> -PpatchedArtifacts.forceBuildFromSource=true
```

## Disabling prebuilt artifacts on iOS

Prebuilt artifacts are enabled by default for HybridApp. Standalone NewDot always compiles
`react-native` from source: under `use_frameworks! :linkage => :static` (required by Firebase) the
prebuilt React Core cannot expose `React_RCTAppDelegate` as an importable Swift module, which the
standalone Swift `AppDelegate` needs. HybridApp is unaffected, because its `AppDelegate` is written in
Objective-C and imports that header directly.

To compile `react-native` from source in HybridApp, set `BUILD_RN_FROM_SOURCE` when installing pods:

```bash
BUILD_RN_FROM_SOURCE=1 npm run pod-install
```

Set it when a source build is deliberate — for example while iterating on a patch that has no
published artifact yet — and it also silences the `[RNMode]` warning. **Do not commit the
`Podfile.lock` it produces:** it will be in source mode, and CI rejects that.

## Environment overrides

`RNMode` (`scripts/artifacts-utils/ios/rn_mode.rb`) clears `react-native`'s test-only environment
overrides before resolving, because each of them can silently move a committed `Podfile.lock` and a
stale `export` is indistinguishable from a deliberate one. Among them are `HERMES_ENGINE_TARBALL_PATH`,
`REACT_NATIVE_OVERRIDE_HERMES_DIR`, `HERMES_COMMIT` and `RCT_BUILD_HERMES_FROM_SOURCE`, which are
legitimate tools when debugging Hermes. The install logs which ones it ignored. To keep them:

```bash
EXPENSIFY_RN_ALLOW_ENV_OVERRIDES=1 npm run pod-install
```

The resulting `Podfile.lock` is not reproducible, so do not commit it.

The flag is read during `pod install`, so switching it requires reinstalling the pods, not just
rebuilding.

To get symbolicated native stack traces from a prebuilt React Core, install the pods with the dSYMs:

```bash
RCT_SYMBOLICATE_PREBUILT_FRAMEWORKS=1 npm run pod-install
```
