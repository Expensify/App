/**
 * Converts a file:// URI to the POSIX path that filesystem APIs (RNFS, ReactNativeBlobUtil) expect.
 *
 * Only file:// URIs are percent-decoded. The share extension emits them encoded (NSURL absoluteString
 * on iOS, Uri.toString() on Android). Every other producer in the app stores raw decoded paths, so
 * other schemes (content://, https://) and bare paths are returned untouched.
 */
function fileURIToPath(uri: string): string {
    if (!uri.startsWith('file://')) {
        return uri;
    }

    const path = uri.slice('file://'.length);

    // A literal % that is not a valid escape sequence (e.g. a file named "Report 50%.pdf" written
    // by a producer that does not encode) makes decodeURIComponent throw. Fall back to the raw path.
    try {
        return decodeURIComponent(path);
    } catch {
        return path;
    }
}

export default fileURIToPath;
