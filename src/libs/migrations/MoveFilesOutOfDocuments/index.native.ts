import Log from '@libs/Log';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Attachment} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import type {OnyxCollection} from 'react-native-onyx';

import RNFS from 'react-native-fs';
import Onyx from 'react-native-onyx';
import OnyxUtils from 'react-native-onyx/dist/OnyxUtils';

const OLD_ATTACHMENT_DIR = `${RNFS.DocumentDirectoryPath}/attachments`;
const NEW_ATTACHMENT_DIR = `${RNFS.CachesDirectoryPath}/attachments`;

/**
 * The attachment cache now lives in Caches. The old files are moved rather than deleted because
 * attachments composed offline have no remote source to re-download from yet, so their cached
 * copy is the only one that survives a relaunch.
 */
function moveAttachmentCache(): Promise<void> {
    return RNFS.exists(OLD_ATTACHMENT_DIR).then((oldDirExists) => {
        if (!oldDirExists) {
            return;
        }
        return RNFS.exists(NEW_ATTACHMENT_DIR)
            .then((newDirExists) => {
                if (!newDirExists) {
                    return RNFS.moveFile(OLD_ATTACHMENT_DIR, NEW_ATTACHMENT_DIR);
                }
                // The new directory already holds files cached since this app version started, so
                // the old files are moved one by one, keeping the newer copy on a name collision
                return RNFS.readDir(OLD_ATTACHMENT_DIR)
                    .then((oldFiles) =>
                        Promise.all(
                            oldFiles.map((oldFile) =>
                                RNFS.exists(`${NEW_ATTACHMENT_DIR}/${oldFile.name}`).then((alreadyCached) => {
                                    if (alreadyCached) {
                                        return;
                                    }
                                    return RNFS.moveFile(oldFile.path, `${NEW_ATTACHMENT_DIR}/${oldFile.name}`);
                                }),
                            ),
                        ),
                    )
                    .then(() => RNFS.unlink(OLD_ATTACHMENT_DIR));
            })
            .then(() => {
                Log.info('[Migrate Onyx] MoveFilesOutOfDocuments moved the attachment cache out of the document directory');
            });
    });
}

/**
 * Attachment records written by older app versions point into the old attachment directory, so
 * their paths are rewritten to the new location. Records are rewritten even when the files
 * themselves are gone (on iOS the user can delete them via the Files app): reads verify the file
 * exists and re-cache on a miss, so a rewritten record never renders a dead path.
 *
 * The scan reads the whole attachment collection, so once it completes a flag is stored and
 * later launches skip it entirely.
 */
function updateAttachmentRecordPaths(): Promise<void> {
    return OnyxUtils.get(ONYXKEYS.ATTACHMENT_RECORD_PATHS_MIGRATED).then((hasMigrated) => {
        if (hasMigrated) {
            return;
        }
        return new Promise<void>((resolve, reject) => {
            // connectWithoutView is appropriate here because migrations run once at startup, before anything renders
            const connection = Onyx.connectWithoutView({
                key: ONYXKEYS.COLLECTION.ATTACHMENT,
                callback: (attachments: OnyxCollection<Attachment>) => {
                    Onyx.disconnect(connection);

                    const updates: Record<string, Attachment> = {};
                    for (const [key, attachment] of Object.entries(attachments ?? {})) {
                        if (!attachment?.source?.startsWith(`${OLD_ATTACHMENT_DIR}/`)) {
                            continue;
                        }
                        updates[key] = {...attachment, source: `${NEW_ATTACHMENT_DIR}/${attachment.source.slice(OLD_ATTACHMENT_DIR.length + 1)}`};
                    }

                    // No need to add a new action just for this migration
                    const rewrite = isEmptyObject(updates)
                        ? Promise.resolve()
                        : // eslint-disable-next-line rulesdir/prefer-actions-set-data
                          Onyx.mergeCollection(ONYXKEYS.COLLECTION.ATTACHMENT, updates).then(() => {
                              Log.info('[Migrate Onyx] MoveFilesOutOfDocuments updated attachment records to the new cache directory');
                          });

                    rewrite
                        // The flag is only set after a successful rewrite so a failed run retries on the next launch
                        // eslint-disable-next-line rulesdir/prefer-actions-set-data
                        .then(() => Onyx.set(ONYXKEYS.ATTACHMENT_RECORD_PATHS_MIGRATED, true))
                        .then(() => resolve())
                        // The rejection must propagate so the startup fallback in the migration's
                        // catch handler runs instead of leaving migrateOnyx() pending forever
                        .catch(reject);
                },
            });
        });
    });
}

/**
 * Onyx state dumps were previously written to the document directory and never deleted after
 * sharing, so a stale dump may still sit there. It is an internal debug file, so it is removed.
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
 * Older app versions staged CSV/report exports in Documents/Expensify before handing them to the
 * iOS share sheet, and cancelling the sheet leaked the staged file. Exports are internal files
 * (current versions stage them in Caches), so the whole staging directory is removed.
 */
function removeStaleExportStagingDir(): Promise<void> {
    const stagingDir = `${RNFS.DocumentDirectoryPath}/Expensify`;
    return RNFS.exists(stagingDir).then((exists) => {
        if (!exists) {
            return;
        }
        return RNFS.unlink(stagingDir).then(() => {
            Log.info('[Migrate Onyx] MoveFilesOutOfDocuments removed the old export staging directory');
        });
    });
}

/**
 * Internal app files used to live in the app's document directory, which iOS shows to the user
 * (and other apps) through the Files app because file sharing is enabled. This moves or removes
 * the ones older app versions left behind, so on iOS the directory only holds files the user
 * expects to see there: their downloads and queued receipt uploads. Android keeps the same
 * internal files under the same relative paths, so it runs the same cleanup.
 */
export default function (): Promise<void> {
    return (
        Promise.all([moveAttachmentCache().then(() => updateAttachmentRecordPaths()), removeStaleOnyxDump(), removeStaleExportStagingDir()])
            .then(() => undefined)
            // A failed cleanup must never block app startup. New files already go to the new
            // locations, and the cleanup runs again on the next launch.
            .catch((error) => {
                Log.warn('[Migrate Onyx] MoveFilesOutOfDocuments failed', {error: error instanceof Error ? error.message : String(error)});
            })
    );
}
