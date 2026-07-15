import type {DeleteFiles, GetFile, KeepOnly, QueuedFileRef, StoreFile} from './types';

import {isQueuedFileRef} from './types';

/**
 * Native receipts are plain {uri, ...} descriptors persisted directly in the queue, never
 * File/Blob instances — so there is nothing to store separately. These stubs keep the API
 * shape identical to web; storeFile rejects because it should never be reached on native.
 */
const storeFile: StoreFile = () => Promise.reject(new Error('[QueuedFileStorage] storeFile is not supported on native'));

const getFile: GetFile = () => Promise.resolve(undefined);

const deleteFiles: DeleteFiles = () => Promise.resolve();

const keepOnly: KeepOnly = () => Promise.resolve();

export {storeFile, getFile, deleteFiles, keepOnly, isQueuedFileRef};
export type {QueuedFileRef};
