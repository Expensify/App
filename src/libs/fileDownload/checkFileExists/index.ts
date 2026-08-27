import fileURIToPath from '@libs/fileURIToPath';
import {logReceiptStatFailed} from '@libs/telemetry/ReceiptObservability';

import RNFS from 'react-native-fs';

type FileCheckError = {
    message: string;

    code?: string;
};

type FileCheckResult = {
    exists: boolean;

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
        return statIsFile(rawPath).catch((rawError: unknown) => ({exists: false, error: toFileCheckError(rawError)}));
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
        // Callers of this boolean form discard the reason, so report it here. The upload path uses
        // checkFileExistsWithReason and puts the same errno on its own dropped line, so logging inside the shared
        // helper instead would count every failed receipt stat twice.
        if (error) {
            logReceiptStatFailed(error.code);
        }
        return exists;
    });
}

export default checkFileExists;
export {checkFileExistsWithReason};
