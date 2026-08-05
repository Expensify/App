import checkFileExists from '@libs/fileDownload/checkFileExists';
import ReceiptStorage from '@libs/ReceiptStorage';

import type {ReceiptSource} from '@src/types/onyx/Transaction';

/**
 * Validates a receipt file and processes it for upload
 * Uses checkFileExists for memory-efficient file validation without loading the entire file
 */
function validateReceiptFile(
    receiptFilename: string | undefined,
    receiptPath: ReceiptSource | undefined,
    receiptType: string | undefined,
    onSuccess: (file: File) => void,
    onFailure: () => void,
): Promise<void> {
    const receiptPathString = receiptPath?.toString();

    // The number receiptPath type is the static image on native so we don't need to check file exists.
    if (typeof receiptPath === 'number') {
        onSuccess({uri: receiptPathString, name: receiptFilename, type: receiptType, source: receiptPathString} as File);
        return Promise.resolve();
    }

    // The stored path can name a container this launch no longer has, so re-root before reading it.
    const localPath = ReceiptStorage.resolve(receiptPath) ?? receiptPathString;

    return checkFileExists(localPath).then((exists) => {
        if (!exists) {
            onFailure();
            return;
        }

        onSuccess({uri: localPath, name: receiptFilename, type: receiptType, source: localPath} as File);
    });
}

export default validateReceiptFile;
