import * as IOU from '@userActions/IOU';
import CONST from '@src/CONST';
import type {ReceiptError} from '@src/types/onyx/Transaction';

function handleFileRetry(message: ReceiptError, file: File, dismissError: () => void, setShouldShowErrorModal: (value: boolean) => void) {
    const retryParams: IOU.ReplaceReceipt | IOU.StartSplitBilActionParams | IOU.TrackExpense | IOU.RequestMoneyInformation =
        typeof message.retryParams === 'string'
            ? (JSON.parse(message.retryParams) as IOU.ReplaceReceipt | IOU.StartSplitBilActionParams | IOU.TrackExpense | IOU.RequestMoneyInformation)
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
            IOU.startSplitBill(startSplitBillParams);
            break;
        }
        case CONST.IOU.ACTION_PARAMS.TRACK_EXPENSE: {
            dismissError();
            const trackExpenseParams = {...retryParams} as IOU.TrackExpense;
            trackExpenseParams.receipt = file;
            IOU.trackExpense(trackExpenseParams);
            break;
        }
        case CONST.IOU.ACTION_PARAMS.MONEY_REQUEST: {
            dismissError();
            const requestMoneyParams = {...retryParams} as IOU.RequestMoneyInformation;
            requestMoneyParams.transactionParams.receipt = file;
            requestMoneyParams.isRetry = true;
            IOU.requestMoney(requestMoneyParams);
            break;
        }
        default:
            setShouldShowErrorModal(true);
            break;
    }
}

export default function handleRetryPress(message: ReceiptError, dismissError: () => void, setShouldShowErrorModal: (value: boolean) => void) {
    if (!message.source) {
        return;
    }

    fetch(message.source)
        .then((res) => res.blob())
        .then((blob) => {
            const reconstructedFile = new File([blob], message.filename);
            reconstructedFile.uri = message.source;
            reconstructedFile.source = message.source;
            handleFileRetry(message, reconstructedFile, dismissError, setShouldShowErrorModal);
        })
        .catch(() => {
            setShouldShowErrorModal(true);
        });
}
