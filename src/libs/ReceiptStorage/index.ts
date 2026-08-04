import type ReceiptStorage from './types';

/**
 * Web has no filesystem to move receipts into. A blob URL lives as long as the document lives, which
 * is the guarantee the native store builds by hand. Every function here passes the URL through
 * unchanged.
 */
const receiptStorage: ReceiptStorage = {
    adopt: (uriOrPath) => Promise.resolve(uriOrPath),
    toLocalUri: (durableName) => durableName,
    resolve: (source) => (typeof source === 'string' ? source : undefined),
};

export default receiptStorage;
