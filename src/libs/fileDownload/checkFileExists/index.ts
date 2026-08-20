import fileURIToPath from '@libs/fileURIToPath';

import RNFS from 'react-native-fs';

/**
 * Why a check failed. ENOENT means gone, EPERM/EACCES means on disk but unreadable, anything else is usually
 * transient IO. A bare `false` hides which one it was, so anything reporting a loss should read the reason.
 */
type FileCheckError = {
    /** Raw rejection message. Embeds the file path, so never forward it to Sentry. */
    message: string;

    /** Errno code when the platform gives us one, e.g. ENOENT. Opaque, so safe to forward. */
    code?: string;
};

type FileCheckResult = {
    /** Whether a regular file exists there. */
    exists: boolean;

    /** Set only when stat rejected. Absent when the path resolved to something that is not a file. */
    error?: FileCheckError;
};

function toFileCheckError(error: unknown): FileCheckError {
    if (error instanceof Error) {
        // RNFS puts a `code` on the Error, but it is not on the Error type.
        const {code} = error as Error & {code?: unknown};
        return {message: error.message, code: typeof code === 'string' ? code : undefined};
    }
    return {message: String(error)};
}

/**
 * Checks if a file exists without loading it into memory, and says why if it does not.
 * Memory-safe alternative to readFileAsync for validation.
 *
 * @param path - The file path to check (typically starts with file://)
 */
function checkFileExistsWithReason(path: string | undefined): Promise<FileCheckResult> {
    if (!path) {
        return Promise.resolve({exists: false});
    }

    const rawPath = path.startsWith('file://') ? path.slice(7) : path;

    // Receipts queued before ReceiptStorage sanitized on-disk filenames can still carry
    // a literal "%23", which is indistinguishable from an encoded "#". Try decoded, then raw.
    const decodedPath = fileURIToPath(path);

    const statIsFile = (candidate: string) => RNFS.stat(candidate).then((fileStat): FileCheckResult => ({exists: fileStat.isFile()}));

    return statIsFile(decodedPath).catch((decodedError: unknown) => {
        if (decodedPath === rawPath) {
            return {exists: false, error: toFileCheckError(decodedError)};
        }
        // Report the raw-path failure — it is the last thing we tried.
        return statIsFile(rawPath).catch((rawError: unknown) => ({exists: false, error: toFileCheckError(rawError)}));
    });
}

/**
 * Boolean form, for callers that only need to know whether the file is there.
 *
 * @param path - The file path to check (typically starts with file://)
 */
function checkFileExists(path: string | undefined): Promise<boolean> {
    return checkFileExistsWithReason(path).then((result) => result.exists);
}

export default checkFileExists;
export {checkFileExistsWithReason};
export type {FileCheckResult, FileCheckError};
