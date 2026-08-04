import Log from '@libs/Log';
import {getFile, isQueuedFileRef} from '@libs/QueuedFileStorage';
import validateFormDataParameter from '@libs/validateFormDataParameter';

import type PrepareRequestPayload from './types';

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
                const blob = await getFile(value.queuedFileKey);
                if (!(blob instanceof Blob)) {
                    Log.alert('[prepareRequestPayload] Queued file missing at upload time, sending without it', {command, key});
                    return undefined;
                }
                // Rebuild a File so FormData keeps the original filename/extension (a bare Blob sends "blob").
                const file = value.name ? new File([blob], value.name, {type: value.type}) : blob;
                return {key, value: file};
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
