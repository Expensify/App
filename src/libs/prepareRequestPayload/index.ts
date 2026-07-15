import Log from '@libs/Log';
import {getFile, isQueuedFileRef} from '@libs/QueuedFileStorage';
import validateFormDataParameter from '@libs/validateFormDataParameter';

import type PrepareRequestPayload from './types';

// Parameter keys that carry an uploaded file (receipt image, avatar, document, …).
const FILE_UPLOAD_KEYS = new Set(['receipt', 'file']);

/**
 * A file-upload request can lose a usable file body after it has been persisted to the
 * offline queue and rehydrated (the File/Blob is gone, or its backing store is unreadable).
 * Sending it anyway fails with `TypeError: Failed to fetch`, the request never reaches the
 * server, and it retries forever — ballooning the persisted queue until the storage write
 * itself fails. The native builder already guards this (checkFileExists / readFileAsync);
 * this mirrors that on web so the request still reaches the server for a definitive outcome
 * instead of looping.
 */
async function isUsableFileValue(value: unknown): Promise<boolean> {
    // File extends Blob, so this narrows both File and Blob uploads.
    if (typeof Blob === 'undefined' || !(value instanceof Blob) || value.size === 0) {
        return false;
    }
    try {
        // Touch the backing store. A Blob that lost its data after being persisted and
        // rehydrated throws here — the same read that later makes `fetch` fail.
        await value.slice(0, 1).arrayBuffer();
        return true;
    } catch {
        return false;
    }
}

/**
 * Prepares the request payload (body) for a given command and data.
 */
const prepareRequestPayload: PrepareRequestPayload = async (command, data) => {
    // Resolve every param up front (in parallel) so we can append synchronously afterwards
    // without awaiting inside the append loop.
    const resolved = await Promise.all(
        Object.keys(data).map(async (key) => {
            const value = data[key];

            if (value === undefined || value === null) {
                return undefined;
            }

            // The file was saved to the separate file store at queue time; resolve the key back
            // into the actual Blob to upload. If it's gone, send without it for a definitive outcome.
            if (isQueuedFileRef(value)) {
                const file = await getFile(value.queuedFileKey);
                if (!file) {
                    Log.alert('[prepareRequestPayload] Queued file missing at upload time, sending without it', {command, key});
                    return undefined;
                }
                return {key, value: file};
            }

            if (FILE_UPLOAD_KEYS.has(key) && !(await isUsableFileValue(value))) {
                Log.alert('[prepareRequestPayload] File missing or unreadable at upload time, sending without it', {command, key});
                return undefined;
            }

            return {key, value};
        }),
    );

    const formData = new FormData();
    for (const entry of resolved) {
        if (!entry) {
            continue;
        }
        validateFormDataParameter(command, entry.key, entry.value);
        formData.append(entry.key, entry.value as string | Blob);
    }

    return formData;
};

export default prepareRequestPayload;
