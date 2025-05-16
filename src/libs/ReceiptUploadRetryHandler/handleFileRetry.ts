import * as IOU from '@userActions/IOU';
import CONST from '@src/CONST';
import type {ReceiptError} from '@src/types/onyx/Transaction';

export default function handleFileRetry(message: ReceiptError, file: File, dismissError: () => void, setShouldShowErrorModal: (value: boolean) => void) {
    const retryParams: IOU.ReplaceReceipt | IOU.StartSplitBilActionParams | IOU.CreateTrackExpenseParams | IOU.RequestMoneyInformation =
        typeof message.retryParams === 'string'
            ? (JSON.parse(message.retryParams) as IOU.ReplaceReceipt | IOU.StartSplitBilActionParams | IOU.CreateTrackExpenseParams | IOU.RequestMoneyInformation)
            : message.retryParams;

    switch (message.action) {
        case CONST.IOU.ACTION_PARAMS.REPLACE_RECEIPT: {
            dismissError();
            const replaceReceiptParams = {...retryParams} as IOU.ReplaceReceipt;
            replaceReceiptParams.file = file;
            IOU.replaceReceipt(replaceReceiptParams);
            break;
        }
        case CONST.IOU.ACTION_PARAMS.START_SPLIT_BILL: {
            dismissError();
            const startSplitBillParams = {...retryParams} as IOU.StartSplitBilActionParams;
            startSplitBillParams.receipt = file;
            startSplitBillParams.shouldPlaySound = false;
            IOU.startSplitBill(startSplitBillParams);
            break;
        }
        case CONST.IOU.ACTION_PARAMS.TRACK_EXPENSE: {
            dismissError();
            const trackExpenseParams = {...retryParams} as IOU.CreateTrackExpenseParams;
            trackExpenseParams.transactionParams.receipt = file;
            trackExpenseParams.isRetry = true;
            trackExpenseParams.shouldPlaySound = false;
            IOU.trackExpense(trackExpenseParams);
            break;
        }
        case CONST.IOU.ACTION_PARAMS.MONEY_REQUEST: {
            dismissError();
            const requestMoneyParams = {...retryParams} as IOU.RequestMoneyInformation;
            requestMoneyParams.transactionParams.receipt = file;
            requestMoneyParams.isRetry = true;
            requestMoneyParams.shouldPlaySound = false;
            IOU.requestMoney(requestMoneyParams);
            break;
        }
        default:
            setShouldShowErrorModal(true);
            break;
    }
}
