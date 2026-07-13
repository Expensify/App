import type {PendingReceipt} from './types';

/** Web has no device gallery target, so the caller (sign-out modal gate) sees an empty list and skips the save flow entirely. */
function getPendingReceiptRequests(): PendingReceipt[] {
    return [];
}

/** Web no-op counterpart to the native saveable filter. See the native file for rationale. */
function getSaveablePendingReceiptRequests(): PendingReceipt[] {
    return [];
}

export default getPendingReceiptRequests;
export {getSaveablePendingReceiptRequests};
