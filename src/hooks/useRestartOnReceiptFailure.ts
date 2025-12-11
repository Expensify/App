import {useEffect} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {checkIfScanFileCanBeRead, setMoneyRequestReceipt} from '@libs/actions/IOU';
import {removeDraftTransactions} from '@libs/actions/TransactionEdit';
import {isLocalFile as isLocalFileUtil} from '@libs/fileDownload/FileUtils';
import {navigateToStartMoneyRequestStep} from '@libs/IOUUtils';
import {getRequestType} from '@libs/TransactionUtils';
import type {IOUAction, IOUType} from '@src/CONST';
import CONST from '@src/CONST';
import type {Transaction} from '@src/types/onyx';
import Log from '@libs/Log';
import {AppState} from 'react-native';

const useRestartOnReceiptFailure = (transaction: OnyxEntry<Transaction>, reportID: string, iouType: IOUType, action: IOUAction) => {
    // When the component mounts, if there is a receipt, see if the image can be read from the disk. If not, redirect the user to the starting step of the flow.
    // This is because until the request is saved, the receipt file is only stored in the browsers memory as a blob:// and if the browser is refreshed, then
    // the image ceases to exist. The best way for the user to recover from this is to start over from the start of the request process.
    // skip this in case user is moving the transaction as the receipt path will be valid in that case
    useEffect(() => {

        const appState = AppState.currentState;
        const transactionID = transaction?.transactionID;

        Log.info('[useRestartOnReceiptFailure] Hook triggered', true, {
            transactionID,
            appState,
            action,
            iouType,
            reportID,
            hasTransaction: !!transaction,
        });
        let isScanFilesCanBeRead = true;

        if (!transaction || action !== CONST.IOU.ACTION.CREATE) {
            Log.info('[useRestartOnReceiptFailure] Skipping check - no transaction or not CREATE action', true, {
                hasTransaction: !!transaction,
                action,
                transaction,
            });
            return;
        }
        const itemReceiptFilename = transaction.receipt?.filename;
        const itemReceiptPath = transaction.receipt?.source;
        const itemReceiptType = transaction.receipt?.type;
        const isLocalFile = isLocalFileUtil(itemReceiptPath);
        Log

        Log.info('[useRestartOnReceiptFailure] Receipt validation starting', true, {
            transactionID,
            itemReceiptFilename,
            itemReceiptPath,
            itemReceiptType,
            isLocalFile,
            appState,
        });

        if (!itemReceiptPath || !isLocalFile) {
            Log.info('[useRestartOnReceiptFailure1] Skipping check - no receipt path or not local file', true, {
                transactionID,
                hasReceiptPath: !!itemReceiptPath,
                isLocalFile,
                transaction,
            });
            return;
        }

        const onFailure = () => {
            isScanFilesCanBeRead = false;
            Log.warn('[useRestartOnReceiptFailure] File read FAILED - clearing receipt', {
                transactionID,
                itemReceiptPath,
                itemReceiptFilename,
                appState: AppState.currentState,
            });
            setMoneyRequestReceipt(transaction.transactionID, '', '', true);
        };

        checkIfScanFileCanBeRead(itemReceiptFilename, itemReceiptPath, itemReceiptType, () => {}, onFailure)?.then(() => {
            const requestType = getRequestType(transaction);

            Log.info('[useRestartOnReceiptFailure] File check completed', true, {
                transactionID,
                isScanFilesCanBeRead,
                requestType,
                appState: AppState.currentState,
            });
            if (isScanFilesCanBeRead || requestType !== CONST.IOU.REQUEST_TYPE.SCAN) {
                Log.info('[useRestartOnReceiptFailure] Keeping transaction - file readable or not scan type', true, {
                    transactionID,
                    isScanFilesCanBeRead,
                    requestType,
                });

                return;
            }
            Log.warn('[useRestartOnReceiptFailure] DELETING DRAFT TRANSACTIONS - file unreadable', {
                transactionID,
                requestType,
                iouType,
                reportID,
                appState: AppState.currentState,
                receiptPath: itemReceiptPath,
            });

            removeDraftTransactions(true);
            navigateToStartMoneyRequestStep(requestType, iouType, transaction.transactionID, reportID);
        });

        // We want this hook to run on mounting only
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, []);
};

export default useRestartOnReceiptFailure;
