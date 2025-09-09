# `react-native-pdf` patches

### [react-native-pdf+6.7.3+001+update-podspec-to-support-new-arch.patch](react-native-pdf+6.7.3+001+update-podspec-to-support-new-arch.patch)

- Reason:

    ```
    This patch updates the react-native-pdf.podspec to ensure compatibility with React Native's New Architecture on iOS by replacing manual dependency declarations
    with Meta's recommended `install_modules_dependencies` function
    ```

- Upstream PR/issue: https://github.com/wonday/react-native-pdf/pull/803
- E/App issue: 🛑
- PR Introducing Patch: https://github.com/Expensify/App/pull/13767
