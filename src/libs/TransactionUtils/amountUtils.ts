import CONST from '@src/CONST';
import type {Transaction} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

function hasValidModifiedAmount(transaction: OnyxEntry<Transaction> | null): boolean {
    if (!transaction) {
        return false;
    }
    return transaction.modifiedAmount !== undefined && transaction.modifiedAmount !== null && transaction.modifiedAmount !== '';
}

function isFailedScanAmountPlaceholder(transaction: OnyxEntry<Transaction>) {
    // A failed Scan can temporarily become OPEN while another field is being edited. A newly submitted Scan
    // with manually entered fields is also OPEN, but the server does not persist the draft's isAmountSet flag.
    // Only treat OPEN as a placeholder while the amount is still unset in a draft or another field edit is pending.
    const isOpenWithUnconfirmedAmount =
        transaction?.receipt?.state === CONST.IOU.RECEIPT_STATE.OPEN &&
        (transaction?.isAmountSet === false ||
            !!transaction?.isMerchantSet ||
            !!transaction?.isCreatedSet ||
            !!transaction?.pendingFields?.merchant ||
            !!transaction?.pendingFields?.created ||
            !!transaction?.pendingFields?.currency);
    return (
        transaction?.iouRequestType === CONST.IOU.REQUEST_TYPE.SCAN &&
        (transaction?.receipt?.state === CONST.IOU.RECEIPT_STATE.SCAN_FAILED || isOpenWithUnconfirmedAmount) &&
        (transaction?.amount === 0 || transaction?.amount === undefined) &&
        !hasValidModifiedAmount(transaction) &&
        !transaction?.isAmountSet
    );
}

function isAmountMissing(transaction: OnyxEntry<Transaction>, isFromExpenseReport = true) {
    if (isFailedScanAmountPlaceholder(transaction)) {
        return true;
    }

    if (isFromExpenseReport) {
        return transaction?.amount === undefined && (transaction?.modifiedAmount === undefined || transaction?.modifiedAmount === '');
    }
    return (transaction?.amount === 0 || transaction?.amount === undefined) && !hasValidModifiedAmount(transaction);
}

export {hasValidModifiedAmount, isAmountMissing, isFailedScanAmountPlaceholder};
