import getReceiptsUploadFolderPath from '@libs/getReceiptsUploadFolderPath';
import Log from '@libs/Log';

import ONYXKEYS from '@src/ONYXKEYS';

import RNFS from 'react-native-fs';
import Onyx from 'react-native-onyx';

const OLD_ATTACHMENT_DIR = `${RNFS.DocumentDirectoryPath}/attachments`;
const OLD_RECEIPTS_UPLOAD_DIR = `${RNFS.DocumentDirectoryPath}/Receipts-Upload`;

/**
 * The attachment cache now lives in Library/Caches. The old copies in Documents are
 * deleted rather than moved because cached attachments re-download on demand, and the
 * Onyx attachment collection is cleared since its sources point at the old directory.
 */
function migrateAttachmentCache(): Promise<void> {
    return RNFS.exists(OLD_ATTACHMENT_DIR).then((exists) => {
        if (!exists) {
            return;
        }
        return RNFS.unlink(OLD_ATTACHMENT_DIR)
            .then(() => Onyx.setCollection(ONYXKEYS.COLLECTION.ATTACHMENT, {}))
            .then(() => {
                Log.info('[Migrate Onyx] MoveFilesOutOfDocuments removed the old attachment cache');
            });
    });
}

/**
 * Receipts queued for upload now live in Library/Application Support. Existing queued
 * receipts are moved so pending uploads keep working after the app updates.
 */
function migrateQueuedReceipts(): Promise<void> {
    return RNFS.exists(OLD_RECEIPTS_UPLOAD_DIR).then((exists) => {
        if (!exists) {
            return;
        }
        const uploadFolder = getReceiptsUploadFolderPath();
        return RNFS.mkdir(uploadFolder)
            .then(() => RNFS.readDir(OLD_RECEIPTS_UPLOAD_DIR))
            .then((files) =>
                Promise.all(
                    files.map((file) =>
                        RNFS.moveFile(file.path, `${uploadFolder}/${file.name}`).catch((error) => {
                            Log.warn('[Migrate Onyx] MoveFilesOutOfDocuments failed to move a queued receipt', {error: error instanceof Error ? error.message : String(error)});
                        }),
                    ),
                ),
            )
            .then(() => RNFS.unlink(OLD_RECEIPTS_UPLOAD_DIR))
            .then(() => {
                Log.info('[Migrate Onyx] MoveFilesOutOfDocuments moved queued receipts');
            });
    });
}

/**
 * Internal app files used to live in the Documents directory, which iOS exposes to the
 * user (and other apps) through the Files app when file sharing is enabled. This moves
 * them into locations that are never user-visible.
 */
export default function (): Promise<void> {
    return Promise.all([migrateAttachmentCache(), migrateQueuedReceipts()])
        .then(() => undefined)
        .catch((error) => {
            // A failed cleanup must never block app startup; new files already go to the new locations
            Log.warn('[Migrate Onyx] MoveFilesOutOfDocuments failed', {error: error instanceof Error ? error.message : String(error)});
        });
}
