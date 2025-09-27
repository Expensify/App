import checkFileExists from '@libs/fileDownload/checkFileExists';
import type {Receipt} from '@src/types/onyx/Transaction';

/**
 * Validates a receipt file and processes it for upload (Native implementation)
 * Uses checkFileExists for memory-efficient file validation without loading the entire file
 */
function validateReceiptFile(
    receipt: Receipt,
    onSuccess: (receipt: Receipt) => void,
    onFailure: () => void,
): Promise<void> {
    return checkFileExists(receipt?.source).then((exists) => {
        if (!exists) {
            onFailure();
            return;
        }

        onSuccess(receipt);
    });
}

export default validateReceiptFile;