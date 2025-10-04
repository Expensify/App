import {checkIfScanFileCanBeRead} from '@libs/actions/IOU';

/**
 * Validates a receipt file and processes it for upload (Web/Desktop implementation)
 * Uses readFileAsync to load the file into memory for processing
 */
function validateReceiptFile(
    itemReceiptFilename: string | undefined,
    itemReceiptPath: string | undefined,
    itemReceiptType: string | undefined,
    onSuccess: (file: File) => void,
    onFailure: () => void,
): Promise<void | File> | undefined {
    return checkIfScanFileCanBeRead(itemReceiptFilename, itemReceiptPath, itemReceiptType, onSuccess, onFailure);
}

export default validateReceiptFile;
