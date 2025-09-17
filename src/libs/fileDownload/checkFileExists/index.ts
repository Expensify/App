import RNFS from 'react-native-fs';

/**
 * Checks if a file exists at the given path without loading it into memory.
 * This is a memory-safe alternative to readFileAsync for validation.
 *
 * @param path - The file path to check (typically starts with file://)
 * @returns Promise that resolves to true if file exists, false otherwise
 */
function checkFileExists(path: string | undefined): Promise<boolean> {
    console.log('[checkFileExists] Checking file existence:', {
        path,
        hasPath: !!path,
        timestamp: new Date().toISOString(),
    });

    if (!path) {
        console.log('[checkFileExists] No path provided, returning false');
        return Promise.resolve(false);
    }

    // RNFS.stat() returns file info without loading the file content
    return RNFS.stat(path)
        .then((fileStat) => {
            console.log('[checkFileExists] File stat result:', {
                path,
                isFile: fileStat.isFile(),
                size: fileStat.size,
                mtime: fileStat.mtime,
            });
            // File exists if we get stats and it's actually a file (not directory)
            return fileStat.isFile();
        })
        .catch((error) => {
            console.warn('[checkFileExists] Error checking file existence:', {
                path,
                error: error.message,
            });
            // File doesn't exist or can't be accessed
            return false;
        });
}

export default checkFileExists;
