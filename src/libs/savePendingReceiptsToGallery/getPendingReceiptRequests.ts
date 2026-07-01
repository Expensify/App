import type {PendingReceipt} from './types';

/** Web has no device gallery target, so the caller (sign-out redirect + settings modal gate) sees an empty list and skips the save flow entirely. */
function getPendingReceiptRequests(): PendingReceipt[] {
    return [];
}

export default getPendingReceiptRequests;
