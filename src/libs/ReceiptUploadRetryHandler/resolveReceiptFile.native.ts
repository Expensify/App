import checkFileExists from '@libs/fileDownload/checkFileExists';
import {getMimeTypeFromUri} from '@libs/fileDownload/FileUtils';
import ReceiptStorage from '@libs/ReceiptStorage';

import type {ResolveReceiptFile} from './types';

const resolveReceiptFile: ResolveReceiptFile = (source, filename) => {
    const localUri = ReceiptStorage.resolve(source);
    if (!localUri) {
        return Promise.resolve(undefined);
    }

    return checkFileExists(localUri).then((exists) => {
        if (!exists) {
            return undefined;
        }
        return {uri: localUri, source: localUri, name: filename, type: getMimeTypeFromUri(filename) ?? getMimeTypeFromUri(localUri)};
    });
};

export default resolveReceiptFile;
