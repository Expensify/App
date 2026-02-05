# `rock` patches

### [rock+0.12.6+001+add-temporary-hex-to-uploaded-artifactNames.patch](rock+0.12.6+001+add-temporary-hex-to-uploaded-artifactNames.patch)

- Reason:
    ```
    This patch adds random hex suffixes to artifact names during ad-hoc distribution uploads to prevent
    conflicts and enable unique artifact paths. It generates a 10-character random hex string for each
    upload and uses it to create temporary artifact names, ensuring that simultaneous uploads don't
    collide and each build gets a unique URL. The changes affect IPA/APK uploads and their associated
    index.html and manifest.plist files.
    ```
- Upstream PR/issue: 🛑
- E/App issue: https://github.com/Expensify/App/issues/81466
- PR Introducing Patch: 🛑
