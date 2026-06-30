/**
 * Converts a file URI into a path suitable for native file-system APIs.
 *
 * `RNFS.stat` uses `NSFileManager.attributesOfItemAtPath:` which expects a POSIX path, not a `file://` URI.
 * This helper URL-decodes the URI (so special characters in filenames are handled) and strips a leading
 * `file://` scheme so the resulting path can be passed straight to those APIs.
 *
 * @param uri - The file URI (typically starts with `file://`).
 * @returns A POSIX file-system path.
 */
function getNativeFileSystemPath(uri: string): string {
    // Decode URI if it's URL-encoded (handles special characters in filenames)
    let path = uri;
    try {
        path = decodeURI(uri);
    } catch (e) {
        path = uri;
    }

    // Strip the file:// scheme so the path is a POSIX path
    if (path.startsWith('file://')) {
        path = path.slice(7);
    }

    return path;
}

export default getNativeFileSystemPath;
