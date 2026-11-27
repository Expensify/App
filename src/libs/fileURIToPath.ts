import {decodeURIComponentSafely} from './Url';

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

    // A producer that does not encode can write a literal % that is not a valid escape sequence
    // (e.g. a file named "Report 50%.pdf"), so the raw path is kept when it can't be decoded.
    return decodeURIComponentSafely(path);
}

export default fileURIToPath;
