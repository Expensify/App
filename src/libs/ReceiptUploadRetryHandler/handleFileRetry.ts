import * as IOU from '@userActions/IOU';
import {startSplitBill} from '@userActions/IOU/Split';
import {clearError} from '@userActions/Transaction';
import CONST from '@src/CONST';
import type Transaction from '@src/types/onyx/Transaction';
import type {ReceiptError} from '@src/types/onyx/Transaction';

export default function handleFileRetry(message: ReceiptError, file: File, dismissError: () => void, setShouldShowErrorModal: (value: boolean) => void) {
    const retryParams: IOU.ReplaceReceipt | IOU.StartSplitBilActionParams | IOU.CreateTrackExpenseParams | IOU.RequestMoneyInformation =
        typeof message.retryParams === 'string'
            ? (JSON.parse(message.retryParams) as IOU.ReplaceReceipt | IOU.StartSplitBilActionParams | IOU.CreateTrackExpenseParams | IOU.RequestMoneyInformation)
            : message.retryParams;

    // Use non-destructive error clearing when transactionID is available.
    // The full dismissError() triggers cleanUpMoneyRequest() for pending ADD transactions,
    // which deletes the transaction/report and navigates away before the retry can complete.
    const clearReceiptError = () => {
        if (message.transactionID) {
            clearError(message.transactionID);
        } else {
            dismissError();
        }
    };

    switch (message.action) {
        case CONST.IOU.ACTION_PARAMS.REPLACE_RECEIPT: {
            clearReceiptError();
            const replaceReceiptParams = {...retryParams} as IOU.ReplaceReceipt;
            replaceReceiptParams.file = file;
            IOU.replaceReceipt(replaceReceiptParams);
            break;
        }
        case CONST.IOU.ACTION_PARAMS.START_SPLIT_BILL: {
            clearReceiptError();
            const startSplitBillParams = {...retryParams} as IOU.StartSplitBilActionParams;
            startSplitBillParams.receipt = file;
            startSplitBillParams.shouldPlaySound = false;
            startSplitBill(startSplitBillParams);
            break;
        }
        case CONST.IOU.ACTION_PARAMS.TRACK_EXPENSE: {
            clearReceiptError();
            const trackExpenseParams = {...retryParams} as IOU.CreateTrackExpenseParams;
            trackExpenseParams.transactionParams.receipt = file;
            trackExpenseParams.isRetry = true;
            trackExpenseParams.shouldPlaySound = false;
            trackExpenseParams.shouldHandleNavigation = false;
            // Reuse the existing transaction so retry errors appear on the same
            // transaction the user is viewing instead of creating a new one.
            if (message.transactionID) {
                trackExpenseParams.existingTransaction = {transactionID: message.transactionID} as Transaction;
            }
            IOU.trackExpense(trackExpenseParams);
            break;
        }
        case CONST.IOU.ACTION_PARAMS.MONEY_REQUEST: {
            clearReceiptError();
            const requestMoneyParams = {...retryParams} as IOU.RequestMoneyInformation;
            requestMoneyParams.transactionParams.receipt = file;
            requestMoneyParams.isRetry = true;
            requestMoneyParams.shouldPlaySound = false;
            requestMoneyParams.shouldHandleNavigation = false;
            // Reuse the existing transaction so retry errors appear on the same
            // transaction the user is viewing instead of creating a new one.
            if (message.transactionID) {
                requestMoneyParams.existingTransactionDraft = {transactionID: message.transactionID} as Transaction;
            }
            IOU.requestMoney(requestMoneyParams);
            break;
        }
        default:
            setShouldShowErrorModal(true);
            break;
    }
}
