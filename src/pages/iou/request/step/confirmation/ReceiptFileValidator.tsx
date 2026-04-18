import {useEffect} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {isLocalFile as isLocalFileFileUtils} from '@libs/fileDownload/FileUtils';
import validateReceiptFile from '@libs/fileDownload/validateReceiptFile';
import {navigateToStartMoneyRequestStep} from '@libs/IOUUtils';
import Navigation from '@libs/Navigation/Navigation';
import {setMoneyRequestReceipt} from '@userActions/IOU/Receipt';
import {removeDraftTransactionsByIDs} from '@userActions/TransactionEdit';
import CONST from '@src/CONST';
import type {IOUAction, IOURequestType, IOUType} from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {Report, Transaction} from '@src/types/onyx';
import type {Participant} from '@src/types/onyx/IOU';
import type {Receipt} from '@src/types/onyx/Transaction';

type ReceiptFileValidatorProps = {
    transactions: Transaction[];
    requestType: IOURequestType | undefined;
    iouType: IOUType;
    initialTransactionID: string;
    reportID: string;
    action: IOUAction;
    backToReport: string | undefined;
    report: OnyxEntry<Report>;
    participants: Participant[];
    draftTransactionIDs: string[] | undefined;
    onReceiptFilesChange: (files: Record<string, Receipt>) => void;
};

/**
 * Side-effect-only component that validates receipt files when transactions,
 * participants, or report change. If blob URLs have expired (e.g. after a
 * browser refresh), navigates the user back to the start of the request flow.
 */
function ReceiptFileValidator({
    transactions,
    requestType,
    iouType,
    initialTransactionID,
    reportID,
    action,
    backToReport,
    report,
    participants,
    draftTransactionIDs,
    onReceiptFilesChange,
}: ReceiptFileValidatorProps) {
    // When the component mounts, if there is a receipt, see if the image can be read from the disk. If not, redirect the user to the starting step of the flow.
    // This is because until the request is saved, the receipt file is only stored in the browsers memory as a blob:// and if the browser is refreshed, then
    // the image ceases to exist. The best way for the user to recover from this is to start over from the start of the request process.
    // skip this in case user is moving the transaction as the receipt path will be valid in that case
    useEffect(() => {
        let ignore = false;
        let newReceiptFiles: Record<string, Receipt> = {};
        let isScanFilesCanBeRead = true;

        Promise.all(
            transactions.map((item) => {
                const itemReceiptFilename = item.receipt?.filename;
                const itemReceiptPath = item.receipt?.source;
                const itemReceiptType = item.receipt?.type;
                const isLocalFile = isLocalFileFileUtils(itemReceiptPath);

                if (!isLocalFile) {
                    if (item.receipt) {
                        newReceiptFiles = {...newReceiptFiles, [item.transactionID]: item.receipt};
                    }
                    return Promise.resolve();
                }

                const onSuccess = (file: File) => {
                    const receipt: Receipt = file;
                    if (item?.receipt?.isTestReceipt) {
                        receipt.isTestReceipt = true;
                        receipt.state = CONST.IOU.RECEIPT_STATE.SCAN_COMPLETE;
                    } else if (item?.receipt?.isTestDriveReceipt) {
                        receipt.isTestDriveReceipt = true;
                        receipt.state = CONST.IOU.RECEIPT_STATE.SCAN_COMPLETE;
                    } else {
                        receipt.state = file && requestType === CONST.IOU.REQUEST_TYPE.MANUAL ? CONST.IOU.RECEIPT_STATE.OPEN : CONST.IOU.RECEIPT_STATE.SCAN_READY;
                    }

                    newReceiptFiles = {...newReceiptFiles, [item.transactionID]: receipt};
                };

                const onFailure = () => {
                    isScanFilesCanBeRead = false;
                    if (initialTransactionID === item.transactionID) {
                        setMoneyRequestReceipt(item.transactionID, '', '', true, '');
                    }
                };

                return validateReceiptFile(itemReceiptFilename, itemReceiptPath, itemReceiptType, onSuccess, onFailure) ?? Promise.resolve();
            }),
        ).then(() => {
            if (ignore) {
                return;
            }
            if (isScanFilesCanBeRead) {
                onReceiptFilesChange(newReceiptFiles);
                return;
            }
            if (requestType === CONST.IOU.REQUEST_TYPE.MANUAL) {
                Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_SCAN.getRoute(CONST.IOU.ACTION.CREATE, iouType, initialTransactionID, reportID, Navigation.getActiveRouteWithoutParams()));
                return;
            }
            removeDraftTransactionsByIDs(draftTransactionIDs, true);
            if (requestType) {
                navigateToStartMoneyRequestStep(requestType, iouType, initialTransactionID, reportID, action, backToReport);
            }
        });

        return () => {
            ignore = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps -- draftTransactionIDs is intentionally excluded to avoid re-running on draft changes
    }, [requestType, iouType, initialTransactionID, reportID, action, backToReport, report, transactions, participants, onReceiptFilesChange]);

    return null;
}

ReceiptFileValidator.displayName = 'ReceiptFileValidator';

export default ReceiptFileValidator;
