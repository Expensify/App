# `time-analytics-webpack-plugin` patches

### [time-analytics-webpack-plugin+0.1.17+001+fix-loader-sourcemaps.patch](time-analytics-webpack-plugin+0.1.17+001+fix-loader-sourcemaps.patch)

- Reason:
  
    ```
    Updates time-analytics-webpack-plugin's `loader` function to preserve sourceMap configuration so our sourcemaps accurately reflect the source code on disk
    ```
  
- Upstream PR/issue: 🛑 TODO
- E/App issue: 🛑 TODO
- PR introducing patch: 🛑 TODO


## ✅ Patch Submission Checklist

Before opening a PR, please ensure:

- [x] The patch file is placed in `patches/<library>/`
- [x] The filename uses the correct naming format: `<library>+<version>+<patch-number>+<short-description>.patch`
- [x] A `details.md` file exists in the same directory as the patch
- [x] The patch is listed and documented in `details.md`
- [ ] All fields in `details.md` are filled in:
    - Reason
    - Upstream PR/issue
    - E/App issue
    - PR Introducing Patch
- [ ] The validation script passes on CI (verifies that all patches are documented in `details.md`)
