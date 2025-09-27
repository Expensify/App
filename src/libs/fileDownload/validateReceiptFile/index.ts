import {checkIfScanFileCanBeRead} from '@libs/actions/IOU';
import type {Receipt} from '@src/types/onyx/Transaction';

/**
 * Validates a receipt file and processes it for upload (Web/Desktop implementation)
 * Uses readFileAsync to load the file into memory for processing
 */
function validateReceiptFile(
    receipt: Receipt,
    onSuccess: (receipt: Receipt) => void,
    onFailure: () => void,
): Promise<void> {
    // Note: item parameter is not used in web version as checkIfScanFileCanBeRead handles file reading
    const result = checkIfScanFileCanBeRead(receipt?.filename, receipt?.source, receipt?.type, onSuccess, onFailure);

    return result ? result.then(() => {}) : Promise.resolve();
}

export default validateReceiptFile;