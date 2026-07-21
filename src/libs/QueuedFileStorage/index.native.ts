import type {DeleteFiles, GetFile, KeepOnly, QueuedFileRef, StoreFile} from './types';

import {isQueuedFileRef} from './types';

/**
 * Native storage has no IndexedDB blob-write limit, so files stay inline in the queue — there is
 * no out-of-band store. isFileStorageSupported is false so the queue skips the file swap; the other
 * stubs keep the API shape identical to web.
 */
const isFileStorageSupported = false;

const storeFile: StoreFile = () => Promise.reject(new Error('[QueuedFileStorage] storeFile is not supported on native'));

const getFile: GetFile = () => Promise.resolve(undefined);

const deleteFiles: DeleteFiles = () => Promise.resolve();

const keepOnly: KeepOnly = () => Promise.resolve();

export {storeFile, getFile, deleteFiles, keepOnly, isQueuedFileRef, isFileStorageSupported};
export type {QueuedFileRef};
