import {checkIfScanFileCanBeRead} from '@libs/actions/IOU';
import type {ReceiptSource} from '@src/types/onyx/Transaction';

/**
 * Validates a receipt file and processes it for upload
 * Uses readFileAsync to load the file into memory for processing
 */
function validateReceiptFile(
    receiptFilename: string | undefined,
    receiptPath: ReceiptSource | undefined,
    receiptType: string | undefined,
    onSuccess: (file: File) => void,
    onFailure: () => void,
): Promise<void | File> | undefined {
    return checkIfScanFileCanBeRead(receiptFilename, receiptPath, receiptType, onSuccess, onFailure);
}

export default validateReceiptFile;
