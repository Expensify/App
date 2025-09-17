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
    const formData = new FormData();
    let promiseChain = Promise.resolve();

    Object.keys(data).forEach((key) => {
        promiseChain = promiseChain.then(() => {
            const value = data[key];

            if (value === undefined) {
                return Promise.resolve();
            }

            if (key === 'receipt') {
                const receipt = value as Receipt;
                const {source, name, type, filename} = receipt;

                console.log('[prepareRequestPayload] Processing receipt:', {
                    source,
                    name,
                    type,
                    filename,
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

                        // Use receipt.name, fallback to receipt.filename, or extract from source
                        const receiptName = receipt.name || receipt.filename || getFileName(source) || 'receipt.jpg';
                        const receiptType = receipt.type || 'image/jpeg';

                        const receiptFormData = {
                            uri: source,
                            name: receiptName,
                            type: receiptType,
                        };

                        console.log('[prepareRequestPayload] Appending receipt to FormData:', {
                            receiptFormData,
                            originalName: receipt.name,
                            originalType: receipt.type,
                            fallbackName: receiptName,
                            fallbackType: receiptType,
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

                if (!source) {
                    validateFormDataParameter(command, key, value);
                    formData.append(key, value as string | Blob);
                    return Promise.resolve();
                }

                return readFileAsync(source, path, () => {}).then((file) => {
                    if (!file) {
                        return;
                    }
                    validateFormDataParameter(command, key, file);
                    formData.append(key, file);
                });
            }

            validateFormDataParameter(command, key, value);
            formData.append(key, value as string | Blob);

            return Promise.resolve();
        });
    });

    return promiseChain.then(() => formData);
};

export default prepareRequestPayload;
