import RNFS from 'react-native-fs';

/**
 * Checks if a file exists at the given path without loading it into memory.
 * This is a memory-safe alternative to readFileAsync for validation.
 *
 * @param path - The file path to check (typically starts with file://)
 * @returns Promise that resolves to true if file exists, false otherwise
 */
function checkFileExists(path: string | undefined): Promise<boolean> {
    if (!path) {
        return Promise.resolve(false);
    }

    // RNFS.stat expects a POSIX path, not a file:// URI.
    const rawPath = path.startsWith('file://') ? path.slice(7) : path;

    // The share extension gives a percent-encoded URI, but moveReceiptToDurableStorage builds a
    // file:// path from the raw filename, so a literal "%23" is ambiguous. Try decoded, then raw.
    let decodedPath: string;
    try {
        decodedPath = decodeURIComponent(rawPath);
    } catch {
        decodedPath = rawPath;
    }

    const statIsFile = (candidate: string) => RNFS.stat(candidate).then((fileStat) => fileStat.isFile());

    return statIsFile(decodedPath).catch(() => (decodedPath === rawPath ? false : statIsFile(rawPath).catch(() => false)));
}

export default checkFileExists;
