import RNFS from 'react-native-fs';
import getReceiptsUploadFolderPath from '@libs/getReceiptsUploadFolderPath';
import Log from '@libs/Log';
import type MoveReceiptToDurableStorage from './types';

/**
 * Moves a receipt image from an ephemeral location (e.g., ImageManipulator cache)
 * to the durable Receipts-Upload directory so it persists until the upload completes.
 *
 * iOS can purge files in Library/Caches/ at any time, so receipts that are queued
 * for upload via the SequentialQueue must live in a durable directory.
 */
const moveReceiptToDurableStorage: MoveReceiptToDurableStorage = async (sourceUri, fileName) => {
    const uploadFolder = getReceiptsUploadFolderPath();
    if (!uploadFolder) {
        return sourceUri;
    }

    try {
        const folderExists = await RNFS.exists(uploadFolder);
        if (!folderExists) {
            await RNFS.mkdir(uploadFolder);
        }

        const sourcePath = sourceUri.replace('file://', '');
        const destPath = `${uploadFolder}/${fileName}`;

        await RNFS.moveFile(sourcePath, destPath);

        return `file://${destPath}`;
    } catch (error) {
        Log.warn('[moveReceiptToDurableStorage] Failed to move receipt, using original path', {error: error instanceof Error ? error.message : String(error)});
        return sourceUri;
    }
};

export default moveReceiptToDurableStorage;
