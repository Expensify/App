import checkFileExists from '@libs/fileDownload/checkFileExists';

/**
 * Validates a receipt file and processes it for upload (Native implementation)
 * Uses checkFileExists for memory-efficient file validation without loading the entire file
 */
function validateReceiptFile(
    itemReceiptFilename: string | undefined,
    itemReceiptPath: string | undefined,
    itemReceiptType: string | undefined,
    onSuccess: (file: File) => void,
    onFailure: () => void,
): Promise<void> {
    return checkFileExists(itemReceiptPath).then((exists) => {
        if (!exists) {
            onFailure();
            return;
        }

        onSuccess({uri: itemReceiptPath, name: itemReceiptFilename, type: itemReceiptType, source: itemReceiptPath} as unknown as File);
    });
}

export default validateReceiptFile;
