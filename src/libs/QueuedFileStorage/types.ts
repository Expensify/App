/**
 * A small serializable reference that stands in for a File/Blob inside a queued request.
 * The bytes live in a separate file store (see storeFile); this ref points at them.
 */
type QueuedFileRef = {queuedFileKey: string; name?: string; type?: string};

/** Narrow an unknown value to a QueuedFileRef (truthy object carrying a string key). */
function isQueuedFileRef(value: unknown): value is QueuedFileRef {
    return typeof value === 'object' && value !== null && 'queuedFileKey' in value && typeof value.queuedFileKey === 'string';
}

type StoreFile = (blob: Blob) => Promise<string>;
// Returns the stored value (a Blob in the browser); typed as unknown because IndexedDB reads are untyped.
type GetFile = (key: string) => Promise<unknown>;
type DeleteFiles = (keys: string[]) => Promise<void>;
type KeepOnly = (keysToKeep: string[]) => Promise<void>;

export {isQueuedFileRef};
export type {QueuedFileRef, StoreFile, GetFile, DeleteFiles, KeepOnly};
