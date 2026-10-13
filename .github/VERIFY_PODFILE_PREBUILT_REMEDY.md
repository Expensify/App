Publishing artifacts does not fix a lockfile that is already committed, so the order matters:

1. Build the artifacts for these patches: run [Publish React Native Artifacts](https://github.com/Expensify/App/actions/workflows/publishReactNativeArtifacts.yml). Tick "Build {{ARTIFACT_TARGET}} artifacts" (tick both targets too if the same patches affect the other repo's lockfile). Set `app_pull_request_url` and `mobile_expensify_pull_request_url` to this PR and its companion PR in the other repo, whichever apply.
2. Once it succeeds, run `{{POD_INSTALL_CMD}}` from your checkout. It logs `[PatchedArtifacts] Using patched react-native artifacts` to stderr on a match; check for it before committing.
3. Commit the regenerated `Podfile.lock`.

Any further patch edit changes the hash again and needs another publish, so make the patch changes final before step 1.

If artifacts already exist for your patches, nothing needs building and step 2 alone is enough: check `gh auth status` for the `read:packages` scope, and that `BUILD_RN_FROM_SOURCE` is unset.

See [PREBUILT_REACT_NATIVE_ARTIFACTS.md](https://github.com/Expensify/App/blob/main/contributingGuides/PREBUILT_REACT_NATIVE_ARTIFACTS.md).
