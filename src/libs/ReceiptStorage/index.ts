import type ReceiptStorage from './types';

/** Web has no filesystem to move receipts into, and a blob URL already lives as long as the document. */
const receiptStorage: ReceiptStorage = {
    adopt: (uriOrPath) => Promise.resolve(uriOrPath),
    overwrite: (durableName) => Promise.resolve(durableName),
    discard: () => Promise.resolve(),
    locate: (source) => Promise.resolve(typeof source === 'string' ? source : undefined),
    settle: () => Promise.resolve(),
    toLocalUri: (durableName) => durableName,
    resolve: (source) => (typeof source === 'string' ? source : undefined),
    sweepLeftovers: () => Promise.resolve(),
};

export default receiptStorage;
