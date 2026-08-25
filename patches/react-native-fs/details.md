# `react-native-fs` patches

### [react-native-fs+2.20.0+001+encode-file-uris.patch](react-native-fs+2.20.0+001+encode-file-uris.patch)

- Reason:

    ```
    `getFileUri` built a file URI by concatenation, `Uri.parse("file://" + filepath)`. `Uri.parse` then reads URI syntax in the result, so a "#" in the path opens a fragment and everything after it is dropped, and a "?" opens a query. `Uri.fromFile` percent-encodes the path before parsing it, so this patch calls that instead.

    Anything in RNFS that opens a stream goes through `getFileUri`: readFile, writeFile, appendFile, copyFile, and the cross-filesystem fallback inside moveFile. On Android the receipts folder sits on external storage while picked files land in the app cache, so moveFile's rename fails and that fallback always runs. A receipt whose filename carried a "#" stayed in the app cache instead of reaching Documents/Receipts-Upload.

    Delete this patch when react-native-fs goes away in favour of react-native-blob-util.
    ```

- Upstream PR/issue: 🛑, `itinance/react-native-fs` is unmaintained. Last pushed 2024-03-18, 630 open issues, and npm `latest` is still the 2.20.0 we depend on. The maintained fork already carries the identical change, https://github.com/birdofpreyru/react-native-fs/pull/6 (commit [`bbcab23`](https://github.com/birdofpreyru/react-native-fs/commit/bbcab23848195296ab9e200590b6180bba0f3a18), released in `@dr.pogodin/react-native-fs` v2.22.0), which this patch backports. That fork is a separate npm package, so there is no version of `react-native-fs` to upgrade to.
- E/App issue: https://github.com/Expensify/App/issues/99350
- PR introducing patch: https://github.com/Expensify/App/pull/99333
