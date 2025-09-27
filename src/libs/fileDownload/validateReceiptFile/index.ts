import {checkIfScanFileCanBeRead} from '@libs/actions/IOU';
import getReceiptFilenameFromTransaction from '@libs/getReceiptFilenameFromTransaction';
import type {Receipt} from '@src/types/onyx/Transaction';
import type Transaction from '@src/types/onyx/Transaction';

/**
 * Validates a receipt file and processes it for upload (Web/Desktop implementation)
 * Uses readFileAsync to load the file into memory for processing
 */
function validateReceiptFile(
    transaction: Transaction,
    onSuccess: (receipt: Receipt) => void,
    onFailure: () => void,
): Promise<void> {
    const itemReceiptFilename = getReceiptFilenameFromTransaction(transaction);
    const itemReceiptPath = transaction.receipt?.source;
    const itemReceiptType = transaction.receipt?.type;

    const result = checkIfScanFileCanBeRead(itemReceiptFilename, itemReceiptPath, itemReceiptType, onSuccess, onFailure);

    // Handle the case where checkIfScanFileCanBeRead might return undefined
    return result ? result.then(() => {}) : Promise.resolve();
}

export default validateReceiptFile;