import type {RequestMoneyInformation} from '@userActions/IOU/MoneyRequestBuilder';
import type {ReplaceReceipt} from '@userActions/IOU/Receipt';
import {replaceReceipt} from '@userActions/IOU/Receipt';
import type {StartSplitBilActionParams} from '@userActions/IOU/Split';
import {startSplitBill} from '@userActions/IOU/Split';
import * as TrackExpense from '@userActions/IOU/TrackExpense';
import CONST from '@src/CONST';
import type {ReceiptError} from '@src/types/onyx/Transaction';

export default function handleFileRetry(message: ReceiptError, file: File, dismissError: () => void, setShouldShowErrorModal: (value: boolean) => void) {
    if (!message.action || !message.retryParams) {
        setShouldShowErrorModal(true);
        return;
    }

    const retryParams: ReplaceReceipt | StartSplitBilActionParams | TrackExpense.CreateTrackExpenseParams | RequestMoneyInformation =
        typeof message.retryParams === 'string'
            ? (JSON.parse(message.retryParams) as ReplaceReceipt | StartSplitBilActionParams | TrackExpense.CreateTrackExpenseParams | RequestMoneyInformation)
            : message.retryParams;

    switch (message.action) {
        case CONST.IOU.ACTION_PARAMS.REPLACE_RECEIPT: {
            dismissError();
            const replaceReceiptParams = {...retryParams} as ReplaceReceipt;
            replaceReceiptParams.file = file;
            replaceReceipt(replaceReceiptParams);
            break;
        }
        case CONST.IOU.ACTION_PARAMS.START_SPLIT_BILL: {
            dismissError();
            const startSplitBillParams = {...retryParams} as StartSplitBilActionParams;
            startSplitBillParams.receipt = file;
            startSplitBillParams.shouldPlaySound = false;
            startSplitBill(startSplitBillParams);
            break;
        }
        case CONST.IOU.ACTION_PARAMS.TRACK_EXPENSE: {
            dismissError();
            const trackExpenseParams = {...retryParams} as TrackExpense.CreateTrackExpenseParams;
            trackExpenseParams.transactionParams.receipt = file;
            trackExpenseParams.isRetry = true;
            trackExpenseParams.shouldPlaySound = false;
            TrackExpense.trackExpense(trackExpenseParams);
            break;
        }
        case CONST.IOU.ACTION_PARAMS.MONEY_REQUEST: {
            dismissError();
            const requestMoneyParams = {...retryParams} as RequestMoneyInformation;
            requestMoneyParams.transactionParams.receipt = file;
            requestMoneyParams.isRetry = true;
            requestMoneyParams.shouldPlaySound = false;
            TrackExpense.requestMoney(requestMoneyParams);
            break;
        }
        default:
            setShouldShowErrorModal(true);
            break;
    }
}
