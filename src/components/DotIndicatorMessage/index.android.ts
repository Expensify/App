import RNFS from 'react-native-fs';
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
    // Android-specific logic using RNFS
    const filePath = message.source.replace('file://', '');
    RNFS.readFile(filePath, 'base64')
        .then((fileContent) => {
            const file = new File([fileContent], message.filename, {type: 'image/jpeg'});
            file.uri = message.source;
            file.source = message.source;
            handleFileRetry(message, file, dismissError, setShouldShowErrorModal);
        })
        .catch(() => {
            setShouldShowErrorModal(true);
        });
}
