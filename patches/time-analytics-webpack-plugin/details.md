# `time-analytics-webpack-plugin` patches

### [time-analytics-webpack-plugin+0.1.17+001+fix-loader-sourcemaps.patch](time-analytics-webpack-plugin+0.1.17+001+fix-loader-sourcemaps.patch)

- Reason:
  
    ```
    Updates time-analytics-webpack-plugin's `loader` function to preserve sourceMaps from loaders, so our sourcemaps accurately reflect the source code on disk
    ```
  
- Upstream PR/issue: https://github.com/ShuiRuTian/time-analytics-webpack-plugin/pull/13
- E/App issue: https://github.com/Expensify/App/issues/93340
- PR introducing patch: https://github.com/Expensify/App/pull/93341
