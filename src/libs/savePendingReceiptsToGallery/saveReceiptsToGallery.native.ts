import {appendTimeToFileName, getFileName} from '@libs/fileDownload/FileUtils';
import hasGalleryWritePermission from '@libs/fileDownload/hasGalleryWritePermission';
import saveLocalFileToGallery from '@libs/fileDownload/saveLocalFileToGallery';
import Log from '@libs/Log';

import type {PendingReceipt, SaveReceiptsResult} from './types';

/** Writes each file with `Promise.allSettled` so one failure does not sink the rest, and swallows every throw so it can never block sign-out. */
function saveReceiptsToGallery(receipts: PendingReceipt[]): Promise<SaveReceiptsResult> {
    if (receipts.length === 0) {
        return Promise.resolve({savedCount: 0, failedCount: 0});
    }

    return hasGalleryWritePermission()
        .then((hasPermission) => {
            if (!hasPermission) {
                return {savedCount: 0, failedCount: receipts.length};
            }

            return Promise.allSettled(
                receipts.map((receipt) => saveLocalFileToGallery(receipt.localPath, appendTimeToFileName(receipt.filename ?? getFileName(receipt.localPath)), receipt.type)),
            ).then((results) => {
                const savedCount = results.filter((result) => result.status === 'fulfilled').length;
                return {savedCount, failedCount: results.length - savedCount};
            });
        })
        .catch((error: unknown) => {
            Log.hmmm('[Receipt] Gallery save batch failed', {error, receiptCount: receipts.length});
            return {savedCount: 0, failedCount: receipts.length};
        });
}

export default saveReceiptsToGallery;
