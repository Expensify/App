import type {PendingReceipt, SaveReceiptsResult} from './types';

/** Web has no device gallery, so the sign-out redirect calls this no-op and web behavior is unchanged. */
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- kept for interface parity with the native implementation
function saveReceiptsToGallery(receipts: PendingReceipt[]): Promise<SaveReceiptsResult> {
    return Promise.resolve({savedCount: 0, failedCount: 0});
}

export default saveReceiptsToGallery;
