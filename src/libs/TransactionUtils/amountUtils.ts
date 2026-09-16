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
    // OPEN is included since editing another field (e.g. merchant) optimistically flips receipt.state to OPEN,
    // which would otherwise flicker the amount back to "$0.00" until the server confirms it's still missing.
    // isAmountSet is exclusively a draft-transaction concept (set by setMoneyRequestAmount during the
    // create/confirmation flow, before the transaction has a modifiedAmount). It's never set on an already-created
    // transaction, so this only affects drafts and leaves every other caller (editing an existing transaction)
    // unaffected — the true signal for those remains hasValidModifiedAmount.
    return (
        transaction?.iouRequestType === CONST.IOU.REQUEST_TYPE.SCAN &&
        (transaction?.receipt?.state === CONST.IOU.RECEIPT_STATE.SCAN_FAILED || transaction?.receipt?.state === CONST.IOU.RECEIPT_STATE.OPEN) &&
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
