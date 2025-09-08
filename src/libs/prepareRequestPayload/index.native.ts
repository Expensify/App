import {getFileName, readFileAsync} from '@libs/fileDownload/FileUtils';
import isFileUploadable from '@libs/isFileUploadable';
import validateFormDataParameter from '@libs/validateFormDataParameter';
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

            // Handle receipt key separately (memory-efficient path-based approach)
            if (key === 'receipt') {
                const receiptValue = value as File;
                const {uri} = receiptValue;

                if (!uri) {
                    validateFormDataParameter(command, key, value);
                    formData.append(key, value as string | Blob);
                    return Promise.resolve();
                }

                // Validate the receipt
                const isUploadable = isFileUploadable(receiptValue);
                if (!isUploadable) {
                    validateFormDataParameter(command, key, value);
                    formData.append(key, value as string | Blob);
                    return Promise.resolve();
                }

                validateFormDataParameter(command, key, receiptValue);

                // Append receipt using path-based approach (no file reading)
                const receiptFormData = {
                    uri,
                    name: receiptValue.name ?? getFileName(uri),
                    type: receiptValue.type && receiptValue.type !== '' ? receiptValue.type : 'image/jpeg',
                };

                formData.append(key, receiptFormData as File);
                return Promise.resolve();
            }

            // Handle file key separately (original readFileAsync logic)
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
