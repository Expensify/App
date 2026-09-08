import type ReceiptStorage from './types';

/** Web has no filesystem to move receipts into, and a blob URL already lives as long as the document. */
const receiptStorage: ReceiptStorage = {
    adopt: (uriOrPath) => Promise.resolve(uriOrPath),
    // Web captures through a canvas at full resolution, so there is nothing to swap or clean up.
    replace: (durableName) => Promise.resolve(durableName),
    discard: () => Promise.resolve(),
    toLocalUri: (durableName) => durableName,
    resolve: (source) => (typeof source === 'string' ? source : undefined),
};

export default receiptStorage;
