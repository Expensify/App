import checkFileExists from '@libs/fileDownload/checkFileExists';
import type {Receipt} from '@src/types/onyx/Transaction';
import type Transaction from '@src/types/onyx/Transaction';

/**
 * Validates a receipt file and processes it for upload (Native implementation)
 * Uses checkFileExists for memory-efficient file validation without loading the entire file
 */
function validateReceiptFile(
    transaction: Transaction,
    onSuccess: (receipt: Receipt) => void,
    onFailure: () => void,
): Promise<void> {
    return checkFileExists(transaction.receipt?.source).then((exists) => {
        if (!exists || !transaction.receipt) {
            onFailure();
            return;
        }

        const receipt: Receipt = {
            ...transaction.receipt,
            uri: transaction.receipt.source, // Add uri property for isFileUploadable compatibility
            filename: transaction.filename, // Include transaction filename for upload
            name: transaction.receipt.name || transaction.filename, // Ensure receipt has a name for upload
        };

        onSuccess(receipt);
    });
}

export default validateReceiptFile;