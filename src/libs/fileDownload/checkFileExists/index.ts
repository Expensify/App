import fileURIToPath from '@libs/fileURIToPath';
import {logReceiptStatFailed} from '@libs/telemetry/ReceiptObservability';

import RNFS from 'react-native-fs';

/** Why a stat failed, so a deleted file is distinguishable from one that is there but unreadable. */
type FileCheckError = {
    /** The raw stat error text. Carries the file path, so it stays out of Sentry. */
    message: string;

    /** The errno, e.g. ENOENT for missing or EPERM for a locked device. */
    code?: string;
};

/** Outcome of a file check: whether the file is there, and if not, why the stat failed. */
type FileCheckResult = {
    /** True only when the path resolves to a file. A directory or a failed stat both read as false. */
    exists: boolean;

    /** Absent when the file exists, or when no path was given to check. */
    error?: FileCheckError;
};

function toFileCheckError(error: unknown): FileCheckError {
    if (error instanceof Error) {
        const {code} = error as Error & {code?: unknown};
        return {message: error.message, code: typeof code === 'string' ? code : undefined};
    }
    return {message: String(error)};
}

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
        return statIsFile(rawPath).catch((): FileCheckResult => ({exists: false, error: toFileCheckError(decodedError)}));
    });
}

/**
 * Checks if a file exists at the given path without loading it into memory.
 * This is a memory-safe alternative to readFileAsync for validation.
 *
 * @param path - The file path to check (typically starts with file://)
 * @returns Promise that resolves to true if file exists, false otherwise
 */
function checkFileExists(path: string | undefined): Promise<boolean> {
    return checkFileExistsWithReason(path).then(({exists, error}) => {
        // Logged here rather than in the shared helper, so the upload path does not report the same errno twice.
        if (error) {
            logReceiptStatFailed(error.code);
        }
        return exists;
    });
}

export default checkFileExists;
export {checkFileExistsWithReason};
