import Log from '@libs/Log';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import RNFS from 'react-native-fs';
import Onyx from 'react-native-onyx';

const OLD_ATTACHMENT_DIR = `${RNFS.DocumentDirectoryPath}/attachments`;

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
 * Onyx state dumps were previously written to Documents and never deleted after sharing,
 * so a stale dump may still sit there. It is an internal debug file, so it is removed.
 */
function removeStaleOnyxDump(): Promise<void> {
    const dumpPath = `${RNFS.DocumentDirectoryPath}/${CONST.DEFAULT_ONYX_DUMP_FILE_NAME}`;
    return RNFS.exists(dumpPath).then((exists) => {
        if (!exists) {
            return;
        }
        return RNFS.unlink(dumpPath).then(() => {
            Log.info('[Migrate Onyx] MoveFilesOutOfDocuments removed a stale Onyx state dump');
        });
    });
}

/**
 * Internal app files used to live in the Documents directory, which iOS shows to the
 * user (and other apps) through the Files app because file sharing is enabled. This
 * removes the ones older app versions left behind, so the directory only holds files
 * the user expects to see there: their downloads and queued receipt uploads.
 */
export default function (): Promise<void> {
    return (
        Promise.resolve()
            .then(() => Promise.all([migrateAttachmentCache(), removeStaleOnyxDump()]))
            .then(() => undefined)
            // A failed cleanup must never block app startup; new files already go to the new locations
            .catch((error) => {
                Log.warn('[Migrate Onyx] MoveFilesOutOfDocuments failed', {error: error instanceof Error ? error.message : String(error)});
            })
    );
}
