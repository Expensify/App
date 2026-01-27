import checkFileExists from '@libs/fileDownload/checkFileExists';
import {readFileAsync} from '@libs/fileDownload/FileUtils';
import validateFormDataParameter from '@libs/validateFormDataParameter';
import type PrepareRequestPayload from './types';

/**
 * Prepares the request payload (body) for a given command and data.
 * This function is specifically designed for native platforms (IOS and Android) to handle the regeneration of blob files. It ensures that files, such as receipts, are properly read and appended to the FormData object before the request is sent.
 */
const prepareRequestPayload: PrepareRequestPayload = (command, data, initiatedOffline) => {
    const formData = new FormData();
    let promiseChain = Promise.resolve();

    for (const key of Object.keys(data)) {
        promiseChain = promiseChain.then(() => {
            const value = data[key];

            if (value === undefined) {
                return Promise.resolve();
            }

            if (key === 'receipt') {
                const {source, name, type, uri} = value as File;
                if (source) {
                    return checkFileExists(source).then((exists) => {
                        if (!exists) {
                            return;
                        }
                        const receiptFormData = {
                            uri,
                            name,
                            type,
                        };
                        validateFormDataParameter(command, key, receiptFormData);
                        formData.append(key, receiptFormData as File);
                    });
                }
            }

            if (key === 'file' && initiatedOffline) {
                const {uri: path = '', source, name, type} = value as File;
                if (!source) {
                    validateFormDataParameter(command, key, value);
                    formData.append(key, value as string | Blob);

                    return Promise.resolve();
                }
                // Use the actual file name if available, otherwise fall back to extracting from path/uri
                const fileName = name || (path ? (path.split('/').pop() ?? '') : '') || '';
                return readFileAsync(source, fileName, () => {}, undefined, type).then((file) => {
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
    }

    return promiseChain.then(() => formData);
};

export default prepareRequestPayload;
