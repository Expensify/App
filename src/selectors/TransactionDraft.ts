import type {OnyxCollection} from 'react-native-onyx';
import type {ReceiptFile} from '@pages/iou/request/step/IOURequestStepScan/types';
import type Transaction from '@src/types/onyx/Transaction';
import type {Receipt} from '@src/types/onyx/Transaction';

type ReceiptWithTransactionIDAndSource = Receipt & ReceiptFile;
type ReceiptWithTransactionID = Receipt & {transactionID: string};

const transactionDraftValuesSelector = (items: OnyxCollection<Transaction>) => Object.values(items ?? {});

const transactionDraftReceiptsSelector = (items: OnyxCollection<Transaction>) =>
    Object.values(items ?? {})
        .map((transaction) => (transaction?.receipt ? {...transaction?.receipt, transactionID: transaction.transactionID} : undefined))
        .filter((receipt): receipt is ReceiptWithTransactionID => !!receipt);

const transactionDraftReceiptsViewSelector = (items: OnyxCollection<Transaction>) =>
    Object.values(items ?? {})
        .map((transaction) => (transaction?.receipt ? {...transaction?.receipt, transactionID: transaction.transactionID} : undefined))
        .filter((receipt): receipt is ReceiptWithTransactionIDAndSource => !!receipt);

export {transactionDraftValuesSelector, transactionDraftReceiptsSelector, transactionDraftReceiptsViewSelector};
