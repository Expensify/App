import {useEffect} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {checkIfScanFileCanBeRead, setMoneyRequestReceipt} from '@libs/actions/IOU/Receipt';
import {removeDraftTransactionsByIDs} from '@libs/actions/TransactionEdit';
import {isLocalFile as isLocalFileUtil} from '@libs/fileDownload/FileUtils';
import {navigateToStartMoneyRequestStep} from '@libs/IOUUtils';
import {getRequestType} from '@libs/TransactionUtils';
import type {IOUAction, IOUType} from '@src/CONST';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {validTransactionDraftIDsSelector} from '@src/selectors/TransactionDraft';
import type {Transaction} from '@src/types/onyx';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import useOnyx from './useOnyx';

const useRestartOnReceiptFailure = (transaction: OnyxEntry<Transaction>, reportID: string, iouType: IOUType, action: IOUAction) => {
    const [draftTransactionIDs, draftTransactionsMetadata] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_DRAFT, {selector: validTransactionDraftIDsSelector});

    // When the component mounts, if there is a receipt, see if the image can be read from the disk. If not, redirect the user to the starting step of the flow.
    // This is because until the request is saved, the receipt file is only stored in the browsers memory as a blob:// and if the browser is refreshed, then
    // the image ceases to exist. The best way for the user to recover from this is to start over from the start of the request process.
    // skip this in case user is moving the transaction as the receipt path will be valid in that case
    useEffect(() => {
        let isScanFilesCanBeRead = true;

        if (!transaction || action !== CONST.IOU.ACTION.CREATE || isLoadingOnyxValue(draftTransactionsMetadata)) {
            return;
        }
        const itemReceiptFilename = transaction.receipt?.filename;
        const itemReceiptPath = transaction.receipt?.source;
        const itemReceiptType = transaction.receipt?.type;
        const isLocalFile = isLocalFileUtil(itemReceiptPath);

        if (!itemReceiptPath || !isLocalFile) {
            return;
        }

        const onFailure = () => {
            isScanFilesCanBeRead = false;
            setMoneyRequestReceipt(transaction.transactionID, '', '', true);
        };

        checkIfScanFileCanBeRead(itemReceiptFilename, itemReceiptPath, itemReceiptType, () => {}, onFailure)?.then(() => {
            const requestType = getRequestType(transaction);
            if (isScanFilesCanBeRead || requestType !== CONST.IOU.REQUEST_TYPE.SCAN) {
                return;
            }

            removeDraftTransactionsByIDs(draftTransactionIDs, true);
            navigateToStartMoneyRequestStep(requestType, iouType, transaction.transactionID, reportID);
        });

        // We want this hook to run on mounting only
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [draftTransactionsMetadata]);
};

export default useRestartOnReceiptFailure;
