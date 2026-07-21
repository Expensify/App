import getReceiptsUploadFolderPath from '@libs/getReceiptsUploadFolderPath';
import Log from '@libs/Log';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Transaction} from '@src/types/onyx';

import type {OnyxCollection} from 'react-native-onyx';

import RNFS from 'react-native-fs';
import Onyx from 'react-native-onyx';

const OLD_ATTACHMENT_DIR = `${RNFS.DocumentDirectoryPath}/attachments`;
const OLD_RECEIPTS_UPLOAD_DIR = `${RNFS.DocumentDirectoryPath}${CONST.RECEIPTS_UPLOAD_PATH}`;

// Persisted receipt paths are matched by this suffix instead of the full old directory path
// because iOS moves the app container (changing its absolute path) on every app update.
const OLD_RECEIPTS_PATH_MARKER = `/Documents${CONST.RECEIPTS_UPLOAD_PATH}/`;

type RewriteReceiptPath = (value: string) => string | null;

type DeepRewriteResult<T> = {result: T; changed: boolean};

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
 * Builds the rewriter used to fix persisted receipt references. Values pointing at a copied
 * receipt are rewritten to the new upload folder. Values pointing at a receipt that could
 * not be copied are rewritten to the old directory under the current container path, since
 * the container path persisted before the update no longer exists. Returns null when the
 * value does not reference a known receipt or is already correct.
 */
function buildReceiptPathRewriter(uploadFolder: string, copiedFileNames: Set<string>, failedFileNames: Set<string>): RewriteReceiptPath {
    return (value) => {
        const markerIndex = value.indexOf(OLD_RECEIPTS_PATH_MARKER);
        if (markerIndex === -1) {
            return null;
        }
        const fileName = value.slice(markerIndex + OLD_RECEIPTS_PATH_MARKER.length);
        if (!fileName || fileName.includes('/')) {
            return null;
        }
        let newFolder: string;
        if (copiedFileNames.has(fileName)) {
            newFolder = uploadFolder;
        } else if (failedFileNames.has(fileName)) {
            newFolder = OLD_RECEIPTS_UPLOAD_DIR;
        } else {
            return null;
        }
        const rewritten = `${value.startsWith('file://') ? 'file://' : ''}${newFolder}/${fileName}`;
        return rewritten === value ? null : rewritten;
    };
}

/**
 * Recursively rewrites every string in a value, returning the original object untouched
 * when nothing changed so callers can skip unnecessary Onyx writes.
 */
function deepRewriteStrings<T>(value: T, rewrite: RewriteReceiptPath): DeepRewriteResult<T> {
    if (typeof value === 'string') {
        const rewritten = rewrite(value);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- T is a string here, so the rewritten string is a valid T
        return rewritten === null ? {result: value, changed: false} : {result: rewritten as T, changed: true};
    }
    if (Array.isArray(value)) {
        let changed = false;
        const result = value.map((item: unknown) => {
            const child = deepRewriteStrings(item, rewrite);
            changed = changed || child.changed;
            return child.result;
        });
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- the rewritten array has the same shape as the original T
        return changed ? {result: result as T, changed: true} : {result: value, changed: false};
    }
    if (value !== null && typeof value === 'object') {
        let changed = false;
        const result: Record<string, unknown> = {};
        for (const [key, item] of Object.entries(value)) {
            const child = deepRewriteStrings(item, rewrite);
            changed = changed || child.changed;
            result[key] = child.result;
        }
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- the rewritten object has the same shape as the original T
        return changed ? {result: result as T, changed: true} : {result: value, changed: false};
    }
    return {result: value, changed: false};
}

/**
 * Queued requests persist the receipt's absolute path in their data (and in their optimistic
 * Onyx updates), and the native payload preparation drops the receipt when that path no
 * longer exists. Every persisted reference is rewritten to where the file actually is now.
 */
function rewritePersistedRequests(key: typeof ONYXKEYS.PERSISTED_REQUESTS | typeof ONYXKEYS.PERSISTED_ONGOING_REQUESTS, rewrite: RewriteReceiptPath): Promise<void> {
    return new Promise((resolve) => {
        const connection = Onyx.connectWithoutView({
            key,
            callback: (requests) => {
                Onyx.disconnect(connection);
                if (!requests) {
                    return resolve();
                }
                const {result, changed} = deepRewriteStrings(requests, rewrite);
                if (!changed) {
                    return resolve();
                }
                // No need to add a new action just for this migration
                // eslint-disable-next-line rulesdir/prefer-actions-set-data
                Onyx.set(key, result).then(() => resolve());
            },
        });
    });
}

/**
 * Offline-created transactions keep the receipt's local path in receipt.source until the
 * upload completes, so those references are rewritten to where the file actually is now.
 */
function rewriteTransactionReceipts(collectionKey: typeof ONYXKEYS.COLLECTION.TRANSACTION | typeof ONYXKEYS.COLLECTION.TRANSACTION_DRAFT, rewrite: RewriteReceiptPath): Promise<void> {
    return new Promise((resolve) => {
        const connection = Onyx.connectWithoutView({
            key: collectionKey,
            waitForCollectionCallback: true,
            callback: (transactions: OnyxCollection<Transaction>) => {
                Onyx.disconnect(connection);
                const updatePromises: Array<Promise<void>> = [];
                for (const [transactionKey, transaction] of Object.entries(transactions ?? {})) {
                    const source = transaction?.receipt?.source;
                    if (typeof source !== 'string') {
                        continue;
                    }
                    const rewritten = rewrite(source);
                    if (rewritten === null) {
                        continue;
                    }
                    // No need to add a new action just for this migration
                    // eslint-disable-next-line rulesdir/prefer-actions-set-data, @typescript-eslint/no-unsafe-type-assertion -- keys from a collection callback always carry the collection prefix
                    updatePromises.push(Onyx.merge(transactionKey as `${typeof collectionKey}${string}`, {receipt: {source: rewritten}}).then(() => undefined));
                }
                Promise.all(updatePromises).then(() => resolve());
            },
        });
    });
}

function updatePersistedReceiptPaths(uploadFolder: string, copiedFileNames: Set<string>, failedFileNames: Set<string>): Promise<void> {
    if (copiedFileNames.size === 0 && failedFileNames.size === 0) {
        return Promise.resolve();
    }
    const rewrite = buildReceiptPathRewriter(uploadFolder, copiedFileNames, failedFileNames);
    return Promise.all([
        rewritePersistedRequests(ONYXKEYS.PERSISTED_REQUESTS, rewrite),
        rewritePersistedRequests(ONYXKEYS.PERSISTED_ONGOING_REQUESTS, rewrite),
        rewriteTransactionReceipts(ONYXKEYS.COLLECTION.TRANSACTION, rewrite),
        rewriteTransactionReceipts(ONYXKEYS.COLLECTION.TRANSACTION_DRAFT, rewrite),
    ]).then(() => undefined);
}

/**
 * Receipts queued for upload now live in Library/Application Support. Existing queued
 * receipts are moved so pending uploads keep working after the app updates, and the
 * paths persisted in queued requests and transactions are rewritten to match.
 *
 * The files are copied first and the originals deleted only after the persisted paths are
 * rewritten, because the request queue can start replaying while this migration runs: the
 * old path must stay valid until the rewrite lands, or the replay drops the receipt.
 */
function migrateQueuedReceipts(): Promise<void> {
    return RNFS.exists(OLD_RECEIPTS_UPLOAD_DIR).then((exists) => {
        if (!exists) {
            return;
        }
        const uploadFolder = getReceiptsUploadFolderPath();
        const copiedFileNames = new Set<string>();
        const failedFileNames = new Set<string>();
        return RNFS.mkdir(uploadFolder)
            .then(() => RNFS.readDir(OLD_RECEIPTS_UPLOAD_DIR))
            .then((files) =>
                Promise.all(
                    files.map((file) => {
                        const destination = `${uploadFolder}/${file.name}`;
                        // Remove any partial copy left by an interrupted earlier run; copyFile fails when the destination exists
                        return RNFS.unlink(destination)
                            .catch(() => {})
                            .then(() => RNFS.copyFile(file.path, destination))
                            .then(() => {
                                copiedFileNames.add(file.name);
                            })
                            .catch((error) => {
                                failedFileNames.add(file.name);
                                Log.warn('[Migrate Onyx] MoveFilesOutOfDocuments failed to copy a queued receipt', {error: error instanceof Error ? error.message : String(error)});
                            });
                    }),
                ),
            )
            .then(() => updatePersistedReceiptPaths(uploadFolder, copiedFileNames, failedFileNames))
            .then(() => {
                if (failedFileNames.size === 0) {
                    return RNFS.unlink(OLD_RECEIPTS_UPLOAD_DIR).then(() => undefined);
                }
                // A receipt that failed to copy has its only copy in the old directory, so only
                // the successfully copied originals are removed and the directory is kept.
                Log.warn('[Migrate Onyx] MoveFilesOutOfDocuments kept the old receipts folder because some receipts could not be copied', {failedCopyCount: failedFileNames.size});
                return Promise.all([...copiedFileNames].map((fileName) => RNFS.unlink(`${OLD_RECEIPTS_UPLOAD_DIR}/${fileName}`).catch(() => {}))).then(() => undefined);
            })
            .then(() => {
                Log.info('[Migrate Onyx] MoveFilesOutOfDocuments moved queued receipts', false, {movedFileCount: copiedFileNames.size});
            });
    });
}

/**
 * Internal app files used to live in the Documents directory, which iOS exposes to the
 * user (and other apps) through the Files app when file sharing is enabled. This moves
 * them into locations that are never user-visible.
 */
export default function (): Promise<void> {
    return (
        Promise.resolve()
            .then(() => Promise.all([migrateAttachmentCache(), migrateQueuedReceipts()]))
            .then(() => undefined)
            // A failed cleanup must never block app startup; new files already go to the new locations
            .catch((error) => {
                Log.warn('[Migrate Onyx] MoveFilesOutOfDocuments failed', {error: error instanceof Error ? error.message : String(error)});
            })
    );
}
