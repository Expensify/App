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

/** Where a receipt source points, coarse enough to send to Sentry in place of the path. */
type ReceiptSourceKind = 'receiptsFolder' | 'imageManipulatorCache' | 'otherTemp' | 'remote';

// expo-image-manipulator saves every result into this folder inside the app cache, on iOS and on Android. The OS can
// clear it at any time, so a receipt left there can be gone by the time its upload runs.
const IMAGE_MANIPULATOR_CACHE_FOLDER = '/ImageManipulator/';

/** Says where a receipt source points without exposing the path. Undefined for an empty source and on platforms with no receipts folder. */
function getReceiptSourceKind(source: unknown): ReceiptSourceKind | undefined {
    if (typeof source !== 'string' || !source) {
        return undefined;
    }

    let receiptsFolderPath: string;
    try {
        receiptsFolderPath = getReceiptsUploadFolderPath();
    } catch {
        // getReceiptsUploadFolderPath reaches the native filesystem module, which is not always available.
        return undefined;
    }

    // Web keeps receipts as object URLs, not files, so none of these kinds apply there.
    if (!receiptsFolderPath) {
        return undefined;
    }
    if (source.startsWith('http:') || source.startsWith('https:')) {
        return 'remote';
    }
    if (isInDurableFolder(source)) {
        return 'receiptsFolder';
    }
    if (source.includes(IMAGE_MANIPULATOR_CACHE_FOLDER)) {
        return 'imageManipulatorCache';
    }
    return 'otherTemp';
}

export {toDurableName, isInDurableFolder, getReceiptSourceKind};
