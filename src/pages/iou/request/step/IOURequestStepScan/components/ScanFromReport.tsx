import {useFullScreenLoaderActions} from '@components/FullScreenLoaderContext';
import withCurrentUserPersonalDetails from '@components/withCurrentUserPersonalDetails';
import type {WithCurrentUserPersonalDetailsProps} from '@components/withCurrentUserPersonalDetails';

import useFilesValidation from '@hooks/useFilesValidation';
import {precacheReceiptImage} from '@hooks/useLocalReceiptThumbnail';
import useOnyx from '@hooks/useOnyx';
import useOptimisticDraftTransactions from '@hooks/useOptimisticDraftTransactions';

import {navigateToConfirmationPage} from '@libs/IOUUtils';
import type {ReceiptCaptureSource} from '@libs/telemetry/ReceiptObservability';
import {getPickerCaptureSource} from '@libs/telemetry/ReceiptObservability';

import type {ReceiptFile} from '@pages/iou/request/step/IOURequestStepScan/types';
import buildReceiptFiles from '@pages/iou/request/step/IOURequestStepScan/utils/buildReceiptFiles';
import getFileSource from '@pages/iou/request/step/IOURequestStepScan/utils/getFileSource';
import startScanProcessSpan from '@pages/iou/request/step/IOURequestStepScan/utils/startScanProcessSpan';
import useScanFileReadabilityCheck from '@pages/iou/request/step/IOURequestStepScan/utils/useScanFileReadabilityCheck';

import {setMultipleMoneyRequestParticipantsFromReport} from '@userActions/IOU/MoneyRequest';

import type {IOUType} from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {validTransactionDraftIDsSelector} from '@src/selectors/TransactionDraft';
import type {Report} from '@src/types/onyx';
import type Transaction from '@src/types/onyx/Transaction';
import type {FileObject} from '@src/types/utils/Attachment';

import type {OnyxEntry} from 'react-native-onyx';

import React from 'react';

import Camera from './Camera';
import {useMultiScanActions, useMultiScanState} from './MultiScanContext';

type ScanFromReportProps = WithCurrentUserPersonalDetailsProps & {
    report: OnyxEntry<Report>;
    iouType: IOUType;
    reportID: string;
    transactionID: string;
    transaction: OnyxEntry<Transaction>;
    backToReport: string | undefined;
};

/**
 * ScanFromReport — initiated from a report's (+) button.
 * Sets participants from the report and navigates to the confirmation page.
 */
function ScanFromReport({report, iouType, reportID, transactionID, transaction, backToReport, currentUserPersonalDetails}: ScanFromReportProps) {
    const [draftTransactionIDs] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_DRAFT, {selector: validTransactionDraftIDsSelector});
    const {isMultiScanEnabled} = useMultiScanState();
    const {disableMultiScan} = useMultiScanActions();
    const {setIsLoaderVisible} = useFullScreenLoaderActions();

    const [transactions] = useOptimisticDraftTransactions(transaction);

    useScanFileReadabilityCheck(transactions, draftTransactionIDs ?? [], disableMultiScan);

    const navigateFromReport = (fileTransactionIDs: string[]) => {
        startScanProcessSpan(isMultiScanEnabled);
        setMultipleMoneyRequestParticipantsFromReport(fileTransactionIDs, report, currentUserPersonalDetails.accountID).then(() =>
            navigateToConfirmationPage(iouType, transactionID, reportID, backToReport),
        );
    };

    const processReceipts = (files: FileObject[], captureSource: ReceiptCaptureSource) => {
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
            captureSource,
        });

        if (receiptFiles.length === 0) {
            return;
        }

        if (isMultiScanEnabled) {
            return;
        }

        navigateFromReport(receiptFiles.map((rf: ReceiptFile) => rf.transactionID));
    };

    const submitMultiScan = () => {
        const ids = transactions.map((t) => t.transactionID).filter((id): id is string => !!id);
        if (ids.length === 0) {
            return;
        }
        navigateFromReport(ids);
    };

    const {validateFiles, PDFValidationComponent, ErrorModal} = useFilesValidation((files: FileObject[]) => {
        processReceipts(files, getPickerCaptureSource());
    });

    return (
        <>
            {PDFValidationComponent}
            <Camera
                onCapture={(file, source) => {
                    if (isMultiScanEnabled) {
                        processReceipts([file], 'camera');
                        return;
                    }
                    // Pre-warm the thumbnail cache before navigating so the confirm page
                    // doesn't flash an un-thumbnail receipt.
                    precacheReceiptImage(source).then(() => processReceipts([file], 'camera'));
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

ScanFromReport.displayName = 'ScanFromReport';

export default withCurrentUserPersonalDetails(ScanFromReport);
