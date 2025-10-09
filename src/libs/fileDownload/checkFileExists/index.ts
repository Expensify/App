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

    // RNFS.stat() returns file info without loading the file content
    return RNFS.stat(path)
        .then((fileStat) => {
            // File exists if we get stats and it's actually a file (not directory)
            return fileStat.isFile();
        })
        .catch(() => {
            // File doesn't exist or can't be accessed
            return false;
        });
}

export default checkFileExists;
