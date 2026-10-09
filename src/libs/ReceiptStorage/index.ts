import type ReceiptStorage from './types';

/**
 * Web has no filesystem to move receipts into. A blob:/file: object URL is only valid for this
 * document. Onyx may still restore the string after a reload, but the Blob is gone. Track the
 * URIs this document created so resolve() can refuse stale ones and callers fall back to the
 * server receipt.
 *
 * Prefer a blob:/file: prefix check over isLocalFile(): that helper also matches root-relative
 * remote URLs like `/staging/chat-attachments/...`.
 */
const sessionLocalSources = new Set<string>();

function isSessionLocalUri(source: string): boolean {
    return source.startsWith('blob:') || source.startsWith('file:');
}

const retain: ReceiptStorage['retain'] = (source) => {
    if (!isSessionLocalUri(source)) {
        return;
    }
    sessionLocalSources.add(source);
};

const resolve: ReceiptStorage['resolve'] = (source) => {
    if (typeof source !== 'string') {
        return undefined;
    }
    if (isSessionLocalUri(source)) {
        return sessionLocalSources.has(source) ? source : undefined;
    }
    return source;
};

const receiptStorage: ReceiptStorage = {
    adopt: (uriOrPath) => Promise.resolve(uriOrPath),
    toLocalUri: (durableName) => durableName,
    retain,
    resolve,
};

export default receiptStorage;
