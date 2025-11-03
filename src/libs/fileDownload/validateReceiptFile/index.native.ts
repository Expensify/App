import type {ReceiptSource} from '@src/types/onyx/Transaction';
import checkFileExists from '@libs/fileDownload/checkFileExists';

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
    return checkFileExists(receiptPathString).then((exists) => {
        if (!exists) {
            onFailure();
            return;
        }

        onSuccess({uri: receiptPathString, name: receiptFilename, type: receiptType, source: receiptPathString} as File);
    });
}

export default validateReceiptFile;
