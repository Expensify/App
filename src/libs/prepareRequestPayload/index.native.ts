import checkFileExists from '@libs/fileDownload/checkFileExists';
import {getFileName, readFileAsync} from '@libs/fileDownload/FileUtils';
import validateFormDataParameter from '@libs/validateFormDataParameter';
import type {Receipt} from '@src/types/onyx/Transaction';
import type PrepareRequestPayload from './types';

/**
 * Prepares the request payload (body) for a given command and data.
 * This function is specifically designed for native platforms (IOS and Android) to handle the regeneration of blob files. It ensures that files, such as receipts, are properly read and appended to the FormData object before the request is sent.
 */
const prepareRequestPayload: PrepareRequestPayload = (command, data, initiatedOffline) => {
    console.log('[prepareRequestPayload] Starting preparation:', {
        command,
        dataKeys: Object.keys(data),
        initiatedOffline,
        timestamp: new Date().toISOString(),
    });

    const formData = new FormData();
    let promiseChain = Promise.resolve();

    Object.keys(data).forEach((key) => {
        promiseChain = promiseChain.then(() => {
            const value = data[key];

            console.log(`[prepareRequestPayload] Processing key: ${key}`, {
                valueType: typeof value,
                hasValue: value !== undefined,
                isReceiptKey: key === 'receipt',
                isFileKey: key === 'file',
            });

            if (value === undefined) {
                console.log(`[prepareRequestPayload] Skipping undefined value for key: ${key}`);
                return Promise.resolve();
            }

            if (key === 'receipt') {
                const receipt = value as Receipt;
                const {source, name, type} = receipt;

                console.log('[prepareRequestPayload] Processing receipt:', {
                    source,
                    name,
                    type,
                    receiptProperties: Object.keys(receipt),
                    hasSource: !!source,
                });

                if (source) {
                    console.log('[prepareRequestPayload] Checking receipt file existence:', {source});
                    return checkFileExists(source).then((exists) => {
                        console.log('[prepareRequestPayload] Receipt file existence check result:', {
                            source,
                            exists,
                        });

                        if (!exists) {
                            console.warn('[prepareRequestPayload] Receipt file does not exist:', {source});
                            return;
                        }

                        const receiptFormData = {
                            uri: source,
                            name: receipt.name,
                            type: receipt.type,
                        };

                        console.log('[prepareRequestPayload] Appending receipt to FormData:', {
                            receiptFormData,
                            formDataEntries: formData._parts?.length || 0,
                        });

                        validateFormDataParameter(command, key, receiptFormData);
                        formData.append(key, receiptFormData as File);
                    });
                } else {
                    console.warn('[prepareRequestPayload] Receipt has no source:', {receipt});
                }
            }

            if (key === 'file' && initiatedOffline) {
                const fileValue = value as File;
                const {uri: path = '', source} = fileValue;

                console.log('[prepareRequestPayload] Processing file (offline mode):', {
                    path,
                    source,
                    hasSource: !!source,
                    fileProperties: Object.keys(fileValue),
                });

                if (!source) {
                    console.log('[prepareRequestPayload] File has no source, appending as-is:', {fileValue});
                    validateFormDataParameter(command, key, value);
                    formData.append(key, value as string | Blob);
                    return Promise.resolve();
                }

                console.log('[prepareRequestPayload] Reading file async:', {source, path});
                return readFileAsync(source, path, () => {}).then((file) => {
                    console.log('[prepareRequestPayload] File read result:', {
                        success: !!file,
                        fileName: file?.name,
                        fileType: file?.type,
                        fileSize: file?.size,
                    });

                    if (!file) {
                        console.warn('[prepareRequestPayload] Failed to read file:', {source, path});
                        return;
                    }
                    validateFormDataParameter(command, key, file);
                    formData.append(key, file);
                });
            }

            console.log(`[prepareRequestPayload] Appending generic value for key: ${key}`, {
                valueType: typeof value,
                valueLength: typeof value === 'string' ? value.length : 'N/A',
            });

            validateFormDataParameter(command, key, value);
            formData.append(key, value as string | Blob);

            return Promise.resolve();
        });
    });

    return promiseChain.then(() => {
        console.log('[prepareRequestPayload] Preparation complete:', {
            command,
            formDataEntries: formData._parts?.length || 0,
            timestamp: new Date().toISOString(),
        });
        return formData;
    });
};

export default prepareRequestPayload;
