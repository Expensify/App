# `react-native-pdf` patches

### [react-native-pdf+7.0.1+001+fix-missing-page-error-when-sending-pdf.patch](react-native-pdf+7.0.1+001+fix-missing-page-error-when-sending-pdf.patch)

- Reason:

    ```md
    The last version (7.0.1) has a bug after the [RTL support PR](https://github.com/wonday/react-native-pdf/pull/914) has been merged
    `this.bookmarks` can be 0 and setting the page to `bookmarks-1` (-1) caused
    
    `Loaded page is null`
    
    error
    ```

- Upstream PR/issue: https://github.com/wonday/react-native-pdf/pull/978
- E/App issue: 🛑
- PR Introducing Patch: https://github.com/Expensify/App/pull/72204
