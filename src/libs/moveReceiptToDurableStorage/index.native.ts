import RNFS from 'react-native-fs';
import getReceiptsUploadFolderPath from '@libs/getReceiptsUploadFolderPath';
import Log from '@libs/Log';
import {rand64} from '@libs/NumberUtils';
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
        await RNFS.mkdir(uploadFolder);

        if (!(await RNFS.exists(uploadFolder))) {
            Log.alert('[moveReceiptToDurableStorage] Upload folder does not exist after mkdir', {uploadFolder});
            return sourceUri;
        }

        const sourcePath = sourceUri.replace('file://', '');
        const dotIndex = fileName.lastIndexOf('.');
        const uniqueName = dotIndex > 0 ? `${fileName.slice(0, dotIndex)}_${rand64()}${fileName.slice(dotIndex)}` : `${fileName}_${rand64()}`;
        const destPath = `${uploadFolder}/${uniqueName}`;

        await RNFS.moveFile(sourcePath, destPath);

        return `file://${destPath}`;
    } catch (error) {
        Log.warn('[moveReceiptToDurableStorage] Failed to move receipt, using original path', {error: error instanceof Error ? error.message : String(error)});
        return sourceUri;
    }
};

export default moveReceiptToDurableStorage;
