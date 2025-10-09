import checkFileExists from '@libs/fileDownload/checkFileExists';

/**
 * Validates a receipt file and processes it for upload
 * Uses checkFileExists for memory-efficient file validation without loading the entire file
 */
function validateReceiptFile(
    receiptFilename: string | undefined,
    receiptPath: string | undefined,
    receiptType: string | undefined,
    onSuccess: (file: File) => void,
    onFailure: () => void,
): Promise<void> {
    return checkFileExists(receiptPath).then((exists) => {
        if (!exists) {
            onFailure();
            return;
        }

        onSuccess({uri: receiptPath, name: receiptFilename, type: receiptType, source: receiptPath} as unknown as File);
    });
}

export default validateReceiptFile;
