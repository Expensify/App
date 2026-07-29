import fileURIToPath from '@libs/fileURIToPath';

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

    const rawPath = path.startsWith('file://') ? path.slice(7) : path;

    // Receipts queued before moveReceiptToDurableStorage sanitized its filenames can still carry
    // a literal "%23", which is indistinguishable from an encoded "#". Try decoded, then raw.
    const decodedPath = fileURIToPath(path);

    const statIsFile = (candidate: string) => RNFS.stat(candidate).then((fileStat) => fileStat.isFile());

    return statIsFile(decodedPath).catch(() => (decodedPath === rawPath ? false : statIsFile(rawPath).catch(() => false)));
}

export default checkFileExists;
