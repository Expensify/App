import type {OnyxEntry} from 'react-native-onyx';
import {shouldReuseInitialTransaction} from '@libs/TransactionUtils';
import type {ReceiptFile} from '@pages/iou/request/step/IOURequestStepScan/types';
import {setMoneyRequestReceipt} from '@userActions/IOU';
import {buildOptimisticTransactionAndCreateDraft} from '@userActions/TransactionEdit';
import type {CurrentUserPersonalDetails} from '@src/types/onyx/PersonalDetails';
import type Transaction from '@src/types/onyx/Transaction';
import type {FileObject} from '@src/types/utils/Attachment';

type BuildReceiptFilesParams = {
    files: FileObject[];
    getSource: (file: FileObject) => string;
    initialTransaction: OnyxEntry<Transaction>;
    initialTransactionID: string;
    shouldAcceptMultipleFiles: boolean;
    transactions: Transaction[];
    currentUserPersonalDetails: CurrentUserPersonalDetails;
    reportID: string;
};

/**
 * Builds an array of ReceiptFile objects from the given files, reusing or creating
 * optimistic transactions as needed, and setting the money request receipt for each.
 */
function buildReceiptFiles({
    files,
    getSource,
    initialTransaction,
    initialTransactionID,
    shouldAcceptMultipleFiles,
    transactions,
    currentUserPersonalDetails,
    reportID,
}: BuildReceiptFilesParams): ReceiptFile[] {
    const receiptFiles: ReceiptFile[] = [];

    for (const [index, file] of files.entries()) {
        const source = getSource(file);
        const transaction: Partial<Transaction> = shouldReuseInitialTransaction(initialTransaction, shouldAcceptMultipleFiles, index, false, transactions)
            ? (initialTransaction ?? {})
            : buildOptimisticTransactionAndCreateDraft({
                  initialTransaction: initialTransaction ?? {},
                  currentUserPersonalDetails,
                  reportID,
              });

        const transactionID = transaction.transactionID ?? initialTransactionID;
        receiptFiles.push({file, source, transactionID});
        setMoneyRequestReceipt(transactionID, source, file.name ?? '', true, file.type);
    }

    return receiptFiles;
}

export default buildReceiptFiles;
