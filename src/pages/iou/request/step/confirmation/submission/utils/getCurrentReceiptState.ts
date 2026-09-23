import {hasAllManuallyEnteredScanFields, isScanRequest as isScanRequestTransactionUtils} from '@libs/TransactionUtils';

import CONST from '@src/CONST';
import type {Receipt} from '@src/types/onyx/Transaction';
import type Transaction from '@src/types/onyx/Transaction';

import type {ValueOf} from 'type-fest';

type GetCurrentReceiptStateParams = {
    item: Transaction;
    receiptFiles: Record<string, Receipt>;
    canEnterScanFieldsManually: boolean;
};

function getCurrentReceiptState({item, receiptFiles, canEnterScanFieldsManually}: GetCurrentReceiptStateParams): ValueOf<typeof CONST.IOU.RECEIPT_STATE> | undefined {
    const receipt = receiptFiles[item.transactionID];
    if (!receipt || !canEnterScanFieldsManually || receipt.isTestReceipt || receipt.isTestDriveReceipt || !isScanRequestTransactionUtils(item)) {
        return undefined;
    }
    return hasAllManuallyEnteredScanFields(item) ? CONST.IOU.RECEIPT_STATE.OPEN : CONST.IOU.RECEIPT_STATE.SCAN_READY;
}

export default getCurrentReceiptState;
