import type {OnyxEntry} from 'react-native-onyx';
import CONST from '@src/CONST';
import type {Transaction} from '@src/types/onyx';
import {removeMoneyRequestOdometerImage, setMoneyRequestOdometerReading} from './actions/IOU';
import {setMoneyRequestReceipt} from './actions/IOU/Receipt';
import {removeDraftTransactionsByIDs, removeBackupTransaction} from './actions/TransactionEdit';

function clearOdometerTransactionState(transaction: OnyxEntry<Transaction>, isDraft: boolean): void {
    if (!transaction) {
        return;
    }
    setMoneyRequestReceipt(transaction.transactionID, '', '', isDraft);
    setMoneyRequestOdometerReading(transaction.transactionID, null, null, isDraft);
    removeMoneyRequestOdometerImage(transaction, CONST.IOU.ODOMETER_IMAGE_TYPE.START, isDraft, true);
    removeMoneyRequestOdometerImage(transaction, CONST.IOU.ODOMETER_IMAGE_TYPE.END, isDraft, true);
    removeDraftTransactionsByIDs([transaction.transactionID], true);
    removeBackupTransaction(transaction.transactionID);
}

export default clearOdometerTransactionState;
