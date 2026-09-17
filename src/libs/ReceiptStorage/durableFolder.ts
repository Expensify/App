import fileURIToPath from '@libs/fileURIToPath';
import getReceiptsUploadFolderPath from '@libs/getReceiptsUploadFolderPath';

/**
 * Matches on the folder name and ignores the container prefix. The app reads this directory through two filesystem
 * libraries whose absolute forms can differ (/private/var and /var), but the trailing segments stay stable.
 *
 * Kept in its own leaf module rather than in ReceiptStorage: the telemetry snapshot needs the same check, and
 * importing ReceiptStorage there would pull in fileDownload/FileUtils and, through it, Localize.
 */
function toDurableName(storedPath: string): string | undefined {
    const dirName = getReceiptsUploadFolderPath().split('/').pop();
    const path = fileURIToPath(storedPath);
    if (!dirName || !path.includes(`/${dirName}/`)) {
        return undefined;
    }
    return path.split('/').pop();
}

/**
 * Whether a stored path sits in the receipts folder. A check on the path, not on the bytes: it says where the receipt
 * was rooted, not that the file is still there. False on platforms with no receipts folder.
 */
function isInDurableFolder(storedPath: unknown): boolean {
    if (typeof storedPath !== 'string') {
        return false;
    }
    try {
        return toDurableName(storedPath) !== undefined;
    } catch {
        // getReceiptsUploadFolderPath reaches the native filesystem module, which is not always available.
        return false;
    }
}

export {toDurableName, isInDurableFolder};
