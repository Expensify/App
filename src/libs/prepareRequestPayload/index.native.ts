import {checkFileExistsWithReason} from '@libs/fileDownload/checkFileExists';
import {readFileAsync} from '@libs/fileDownload/FileUtils';
import getReceiptsUploadFolderPath from '@libs/getReceiptsUploadFolderPath';
import ReceiptStorage from '@libs/ReceiptStorage';
import {logReceiptDropped} from '@libs/telemetry/ReceiptObservability';
import validateFormDataParameter from '@libs/validateFormDataParameter';

import type {Receipt} from '@src/types/onyx/Transaction';

import RNFS from 'react-native-fs';

import type PrepareRequestPayload from './types';

async function getReceiptsFolderState(): Promise<{exists: boolean; entryCount?: number}> {
    let folderPath: string;
    try {
        folderPath = getReceiptsUploadFolderPath();
        if (!(await RNFS.exists(folderPath))) {
            return {exists: false};
        }
    } catch {
        return {exists: false};
    }

    try {
        const entries = await RNFS.readDir(folderPath);
        return {exists: true, entryCount: entries.length};
    } catch {
        return {exists: true};
    }
}

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

            if (value === undefined || value === null) {
                return Promise.resolve();
            }

            // The assertion is FormData's signature being narrower than what request data can hold.
            const appendValueAsIs = () => {
                validateFormDataParameter(command, key, value);
                formData.append(key, value as string | Blob);
            };

            if (key === 'receipt') {
                const {source, name, type, receiptTraceId} = value as Omit<File, 'source'> & Pick<Receipt, 'receiptTraceId' | 'source'>;

                if (source) {
                    // A bundled placeholder image (distance, per diem) is a require() asset id, so no file exists on disk.
                    if (typeof source === 'number') {
                        return Promise.resolve();
                    }

                    return ReceiptStorage.locate(source).then((localUri) => {
                        if (!localUri) {
                            const transactionID = typeof data.transactionID === 'string' ? data.transactionID : undefined;
                            const resolvedUri = ReceiptStorage.resolve(source) ?? source;
                            return Promise.all([checkFileExistsWithReason(resolvedUri), getReceiptsFolderState()]).then(([{error}, receiptsFolder]) => {
                                logReceiptDropped({receiptTraceId, transactionID, command, source, localUri: resolvedUri, fileName: name, statError: error, receiptsFolder});
                            });
                        }
                        const receiptFormData = {
                            uri: localUri,
                            name,
                            type,
                        };
                        validateFormDataParameter(command, key, receiptFormData);
                        formData.append(key, receiptFormData as File);
                    });
                }

                if (name) {
                    return ReceiptStorage.settle(name).then(appendValueAsIs);
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

                    // A React Native File keeps its name and type on the prototype, and the multipart part is built from
                    // the object's own properties, so without these the upload goes out unnamed and is stored as "file".
                    Object.defineProperties(file, {name: {value: file.name, enumerable: true}, type: {value: file.type, enumerable: true}});
                    validateFormDataParameter(command, key, file);
                    formData.append(key, file);
                });
            }

            appendValueAsIs();

            return Promise.resolve();
        });
    }

    return promiseChain.then(() => formData);
};

export default prepareRequestPayload;
