import {getFileName, readFileAsync} from '@libs/fileDownload/FileUtils';
import isFileUploadable from '@libs/isFileUploadable';
import isReceiptUploadable from '@libs/isReceiptUploadable';
import validateFormDataParameter from '@libs/validateFormDataParameter';
import type {Receipt} from '@src/types/onyx/Transaction';
import type PrepareRequestPayload from './types';
 
/**
 * Prepares the request payload (body) for a given command and data.
 * This function is specifically designed for native platforms (IOS and Android) to handle the regeneration of blob files. It ensures that files, such as receipts, are properly read and appended to the FormData object before the request is sent.
 */
const prepareRequestPayload: PrepareRequestPayload = (command, data,    initiatedOffline) => {
    const formData = new FormData();
    let promiseChain = Promise.resolve();

    Object.keys(data).forEach((key) => {
        promiseChain = promiseChain.then(() => {
            const value = data[key];

            if (value === undefined) {
                return Promise.resolve();
            }

            // Process receipt for native platforms (always process - memory-efficient path-based)
            if (key === 'receipt') {
                const receiptValue = value as Receipt;
                
                // Use dedicated receipt validation - pure Receipt approach
                if (!isReceiptUploadable(receiptValue)) {
                    // Handle invalid receipt
                    validateFormDataParameter(command, key, value, isReceiptUploadable);
                    formData.append(key, value as string | Blob);
                    return Promise.resolve();
                }
                
                // Pure Receipt validation and direct FormData append
                validateFormDataParameter(command, key, receiptValue, isReceiptUploadable);
                
                // React Native FormData can handle Receipt objects directly
                // The RN bridge will convert { source, name } to proper file upload format
                formData.append(key, {
                    uri: receiptValue.source!,
                    name: receiptValue.name ?? getFileName(receiptValue.source!),
                    type: 'image/jpeg'
                } as File);
                
                return Promise.resolve();
            }

            // Process file for native platforms (original logic - uses isFileUploadable validation)
            if (key === 'file' && initiatedOffline) {
                const {uri: path = '', source} = value as File;
                if (!source) {
                    validateFormDataParameter(command, key, value, isFileUploadable);
                    formData.append(key, value as string | Blob);
                    return Promise.resolve();
                }
                return readFileAsync(source, path, () => {}).then((file) => {
                    if (!file) {
                        return;
                    }
                    validateFormDataParameter(command, key, file, isFileUploadable);
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
