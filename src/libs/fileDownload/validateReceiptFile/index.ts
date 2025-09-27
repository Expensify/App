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
): Promise<void | File> | undefined {
    return checkIfScanFileCanBeRead(receipt?.filename, receipt?.source, receipt?.type, onSuccess, onFailure);
}

export default validateReceiptFile;