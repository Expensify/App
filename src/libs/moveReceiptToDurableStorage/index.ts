import type MoveReceiptToDurableStorage from './types';

/**
 * Web no-op: blob/object URLs are held in memory and don't need durable filesystem storage.
 */
const moveReceiptToDurableStorage: MoveReceiptToDurableStorage = (sourceUri) => Promise.resolve(sourceUri);

export default moveReceiptToDurableStorage;
