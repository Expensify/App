import {appendTimeToFileName, getFileName} from '@libs/fileDownload/FileUtils';
import hasGalleryWritePermission from '@libs/fileDownload/hasGalleryWritePermission';
import saveLocalFileToGallery from '@libs/fileDownload/saveLocalFileToGallery';
import Log from '@libs/Log';

import CONST from '@src/CONST';

import type {PendingReceipt, SaveReceiptsResult} from './types';

function isPermissionError(reason: unknown): boolean {
    return reason instanceof Error && reason.message === CONST.IOS_CAMERA_ROLL_ACCESS_ERROR;
}

/** Writes each file with `Promise.allSettled` so one failure does not sink the rest, and swallows every throw so it can never block sign-out. Reports `permissionDenied` so the caller can surface a permission prompt. */
function saveReceiptsToGallery(receipts: PendingReceipt[]): Promise<SaveReceiptsResult> {
    if (receipts.length === 0) {
        return Promise.resolve({savedCount: 0, failedCount: 0, permissionDenied: false});
    }

    return hasGalleryWritePermission()
        .then((hasPermission) => {
            // Android gates permission up front, so a denial short-circuits here without attempting any write.
            if (!hasPermission) {
                return {savedCount: 0, failedCount: receipts.length, permissionDenied: true};
            }

            return Promise.allSettled(
                receipts.map((receipt) => saveLocalFileToGallery(receipt.localPath, appendTimeToFileName(receipt.filename ?? getFileName(receipt.localPath)), receipt.type)),
            ).then((results) => {
                const savedCount = results.filter((result) => result.status === 'fulfilled').length;
                // iOS's gate always returns true, then the write itself rejects when access is None
                const permissionDenied = results.some((result) => result.status === 'rejected' && isPermissionError(result.reason));
                return {savedCount, failedCount: results.length - savedCount, permissionDenied};
            });
        })
        .catch((error: unknown) => {
            Log.hmmm('[Receipt] Gallery save batch failed', {error, receiptCount: receipts.length});
            return {savedCount: 0, failedCount: receipts.length, permissionDenied: isPermissionError(error)};
        });
}

export default saveReceiptsToGallery;
