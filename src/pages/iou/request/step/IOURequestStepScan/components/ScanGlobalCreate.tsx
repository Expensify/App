import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {useFullScreenLoaderActions} from '@components/FullScreenLoaderContext';
import withCurrentUserPersonalDetails from '@components/withCurrentUserPersonalDetails';
import type {WithCurrentUserPersonalDetailsProps} from '@components/withCurrentUserPersonalDetails';
import useFilesValidation from '@hooks/useFilesValidation';
import {precacheReceiptImage} from '@hooks/useLocalReceiptThumbnail';
import useOnyx from '@hooks/useOnyx';
import useOptimisticDraftTransactions from '@hooks/useOptimisticDraftTransactions';
import type {ReceiptFile} from '@pages/iou/request/step/IOURequestStepScan/types';
import buildReceiptFiles from '@pages/iou/request/step/IOURequestStepScan/utils/buildReceiptFiles';
import getFileSource from '@pages/iou/request/step/IOURequestStepScan/utils/getFileSource';
import navigateGlobalCreate from '@pages/iou/request/step/IOURequestStepScan/utils/navigateGlobalCreate';
import useScanFileReadabilityCheck from '@pages/iou/request/step/IOURequestStepScan/utils/useScanFileReadabilityCheck';
import type {IOUType} from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {validTransactionDraftIDsSelector} from '@src/selectors/TransactionDraft';
import type Transaction from '@src/types/onyx/Transaction';
import type {FileObject} from '@src/types/utils/Attachment';
import Camera from './Camera';
import {useMultiScanActions, useMultiScanState} from './MultiScanContext';

type ScanGlobalCreateProps = WithCurrentUserPersonalDetailsProps & {
    iouType: IOUType;
    reportID: string;
    transactionID: string;
    transaction: OnyxEntry<Transaction>;
    backToReport: string | undefined;
};

/**
 * ScanGlobalCreate — initiated from the FAB (+) button (no specific report).
 * Default-expense-policy / self-DM / billing data is read at shutter time from
 * the module-level mirror in `src/libs/ScanGlobalCreateNavigationData.ts`, so
 * this screen no longer subscribes to those Onyx keys on mount and the Camera
 * renders on the critical path without contention.
 */
function ScanGlobalCreate({iouType, reportID, transactionID, transaction, backToReport, currentUserPersonalDetails}: ScanGlobalCreateProps) {
    const [draftTransactionIDs] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_DRAFT, {selector: validTransactionDraftIDsSelector});
    const {isMultiScanEnabled} = useMultiScanState();
    const {disableMultiScan} = useMultiScanActions();
    const {setIsLoaderVisible} = useFullScreenLoaderActions();
    const [transactions] = useOptimisticDraftTransactions(transaction);

    useScanFileReadabilityCheck(transactions, draftTransactionIDs ?? [], disableMultiScan);

    const processReceipts = (files: FileObject[]) => {
        const receiptFiles = buildReceiptFiles({
            files,
            getFileSource,
            initialTransaction: transaction,
            initialTransactionID: transactionID,
            currentUserPersonalDetails,
            reportID,
            shouldAcceptMultipleFiles: true,
            isMultiScanEnabled,
            transactions,
            draftTransactionIDsToCleanUp: draftTransactionIDs,
        });

        if (receiptFiles.length === 0 || isMultiScanEnabled) {
            return;
        }

        navigateGlobalCreate({
            iouType,
            reportID,
            transactionID,
            transaction,
            backToReport,
            transactionIDs: receiptFiles.map((rf: ReceiptFile) => rf.transactionID),
            isMultiScanEnabled,
            accountID: currentUserPersonalDetails.accountID,
        });
    };

    const submitMultiScan = () => {
        const ids = transactions.map((t) => t.transactionID).filter((id): id is string => !!id);
        if (ids.length === 0) {
            return;
        }
        navigateGlobalCreate({
            iouType,
            reportID,
            transactionID,
            transaction,
            backToReport,
            transactionIDs: ids,
            isMultiScanEnabled,
            accountID: currentUserPersonalDetails.accountID,
        });
    };

    const {validateFiles, PDFValidationComponent, ErrorModal} = useFilesValidation((files: FileObject[]) => {
        processReceipts(files);
    });

    return (
        <>
            {PDFValidationComponent}
            <Camera
                onCapture={(file, source) => {
                    if (isMultiScanEnabled) {
                        processReceipts([file]);
                        return;
                    }
                    // Pre-warm the thumbnail cache before navigating so the confirm page
                    // doesn't flash an un-thumbnail receipt.
                    precacheReceiptImage(source).then(() => processReceipts([file]));
                }}
                onPicked={validateFiles}
                onAttachmentPickerStatusChange={setIsLoaderVisible}
                onMultiScanSubmit={submitMultiScan}
                shouldAcceptMultipleFiles
            />
            {ErrorModal}
        </>
    );
}

ScanGlobalCreate.displayName = 'ScanGlobalCreate';

export default withCurrentUserPersonalDetails(ScanGlobalCreate);
