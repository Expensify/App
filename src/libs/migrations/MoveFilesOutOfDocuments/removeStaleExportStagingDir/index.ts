// The export staging leak only happened on iOS, so this is a no-op on other platforms. On Android
// the same path (filesDir/Expensify) is where the native share intent handler stages files shared
// into the app, so removing it would lose the share.
export default function removeStaleExportStagingDir(): Promise<void> {
    return Promise.resolve();
}
