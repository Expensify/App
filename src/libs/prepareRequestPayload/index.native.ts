import checkFileExists from '@libs/fileDownload/checkFileExists';
import {readFileAsync} from '@libs/fileDownload/FileUtils';
import {logReceiptDropped} from '@libs/telemetry/ReceiptObservability';
import validateFormDataParameter from '@libs/validateFormDataParameter';

import type {Receipt} from '@src/types/onyx/Transaction';

import type PrepareRequestPayload from './types';

async function appendFormDataParameter(formData: FormData, command: string, data: Record<string, unknown>, key: string, initiatedOffline: boolean | undefined): Promise<void> {
    const value = data[key];

    if (value === undefined || value === null) {
        return;
    }

    if (key === 'receipt') {
        const {source, name, type, uri, receiptTraceId} = value as File & Pick<Receipt, 'receiptTraceId'>;
        if (source) {
            const exists = await checkFileExists(source);
            if (!exists) {
                const transactionID = typeof data.transactionID === 'string' ? data.transactionID : undefined;
                logReceiptDropped({receiptTraceId, transactionID, command, source, fileName: name});
                return;
            }
            const receiptFormData = {
                uri,
                name,
                type,
            };
            validateFormDataParameter(command, key, receiptFormData);
            formData.append(key, receiptFormData as File);
            return;
        }
    }

    if (key === 'file' && initiatedOffline) {
        const {uri: path = '', source, name, type} = value as File;
        if (!source) {
            validateFormDataParameter(command, key, value);
            formData.append(key, value as string | Blob);
            return;
        }
        // Use the actual file name if available, otherwise fall back to extracting from path/uri
        const fileName = name || (path ? (path.split('/').pop() ?? '') : '') || '';
        const file = await readFileAsync(source, fileName, () => {}, undefined, type);
        if (!file) {
            return;
        }

        validateFormDataParameter(command, key, file);
        formData.append(key, file);
        return;
    }

    validateFormDataParameter(command, key, value);
    formData.append(key, value as string | Blob);
}

/**
 * Prepares the request payload (body) for a given command and data.
 * This function is specifically designed for native platforms (IOS and Android) to handle the regeneration of blob files. It ensures that files, such as receipts, are properly read and appended to the FormData object before the request is sent.
 */
const prepareRequestPayload: PrepareRequestPayload = async (command, data, initiatedOffline) => {
    const formData = new FormData();

    for (const key of Object.keys(data)) {
        await appendFormDataParameter(formData, command, data, key, initiatedOffline);
    }

    return formData;
};

export default prepareRequestPayload;
