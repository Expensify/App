# `react-native-fs` patches

### [react-native-fs+2.20.0+001+encode-file-uris.patch](react-native-fs+2.20.0+001+encode-file-uris.patch)

- Reason:

    ```
    `getFileUri` built a file URI by concatenation, `Uri.parse("file://" + filepath)`. `Uri.parse` reads URI syntax in the result, so a "#" in the path starts a fragment and drops everything after it, and a "?" starts a query. This patch calls `Uri.fromFile` instead, which percent-encodes the path first.

    Every RNFS call that opens a stream goes through `getFileUri`: readFile, writeFile, appendFile, copyFile, and the cross-filesystem fallback inside moveFile. On Android the receipts folder sits on external storage while picked files land in the app cache, so moveFile's rename fails and that fallback always runs. A receipt whose filename carried a "#" stayed in the app cache instead of reaching Documents/Receipts-Upload.

    Delete this patch when react-native-blob-util replaces react-native-fs.
    ```

- Upstream PR/issue: 🛑, `itinance/react-native-fs` is unmaintained. Last pushed 2024-03-18, 630 open issues, and npm `latest` is still the 2.20.0 we depend on, which does not carry this fix. Maintained forks do carry it, but they ship under their own package names, so there is no version of `react-native-fs` to upgrade to.
- E/App issue: https://github.com/Expensify/App/issues/99350
- PR introducing patch: https://github.com/Expensify/App/pull/99333
