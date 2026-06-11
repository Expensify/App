# `time-analytics-webpack-plugin` patches

### [time-analytics-webpack-plugin+0.1.17+001+fix-loader-sourcemaps.patch](time-analytics-webpack-plugin+0.1.17+001+fix-loader-sourcemaps.patch)

- Reason:
  
    ```
    Updates time-analytics-webpack-plugin's `loader` function to preserve sourceMaps from loaders, so our sourcemaps accurately reflect the source code on disk
    ```
  
- Upstream PR/issue: https://github.com/ShuiRuTian/time-analytics-webpack-plugin/pull/13
- E/App issue: https://github.com/Expensify/App/issues/93340
- PR introducing patch: https://github.com/Expensify/App/pull/93341


## ✅ Patch Submission Checklist

Before opening a PR, please ensure:

- [x] The patch file is placed in `patches/<library>/`
- [x] The filename uses the correct naming format: `<library>+<version>+<patch-number>+<short-description>.patch`
- [x] A `details.md` file exists in the same directory as the patch
- [x] The patch is listed and documented in `details.md`
- [x] All fields in `details.md` are filled in:
    - Reason
    - Upstream PR/issue
    - E/App issue
    - PR Introducing Patch
- [x] The validation script passes on CI (verifies that all patches are documented in `details.md`)
