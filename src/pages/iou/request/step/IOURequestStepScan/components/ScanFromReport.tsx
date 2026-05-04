import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import withCurrentUserPersonalDetails from '@components/withCurrentUserPersonalDetails';
import type {WithCurrentUserPersonalDetailsProps} from '@components/withCurrentUserPersonalDetails';
import useOnyx from '@hooks/useOnyx';
import {navigateToConfirmationPage} from '@libs/IOUUtils';
import useScanCapture from '@pages/iou/request/step/IOURequestStepScan/hooks/useScanCapture';
import type {ReceiptFile} from '@pages/iou/request/step/IOURequestStepScan/types';
import buildReceiptFiles from '@pages/iou/request/step/IOURequestStepScan/utils/buildReceiptFiles';
import getFileSource from '@pages/iou/request/step/IOURequestStepScan/utils/getFileSource';
import startScanProcessSpan from '@pages/iou/request/step/IOURequestStepScan/utils/startScanProcessSpan';
import useScanFileReadabilityCheck from '@pages/iou/request/step/IOURequestStepScan/utils/useScanFileReadabilityCheck';
import {setMultipleMoneyRequestParticipantsFromReport} from '@userActions/IOU';
import {removeDraftTransactionsByIDs} from '@userActions/TransactionEdit';
import type {IOUType} from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {validTransactionDraftIDsSelector} from '@src/selectors/TransactionDraft';
import type {Report} from '@src/types/onyx';
import type Transaction from '@src/types/onyx/Transaction';
import type {FileObject} from '@src/types/utils/Attachment';
import Camera from './Camera';
import {useMultiScanState} from './MultiScanContext';

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

    // TODO: derive transactions from useOptimisticDraftTransactions when wired up
    const transactions = transaction ? [transaction] : [];

    useScanFileReadabilityCheck(transactions, Object.keys(draftTransactionIDs ?? {}), () => {});

    const processReceipts = (files: FileObject[]) => {
        if (files.length === 0) {
            return;
        }

        if (!isMultiScanEnabled) {
            removeDraftTransactionsByIDs(Object.keys(draftTransactionIDs ?? {}), true);
        }

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
        });

        startScanProcessSpan(isMultiScanEnabled);

        const fileTransactionIDs = receiptFiles.map((rf: ReceiptFile) => rf.transactionID);
        setMultipleMoneyRequestParticipantsFromReport(fileTransactionIDs, report, currentUserPersonalDetails.accountID).then(() =>
            navigateToConfirmationPage(iouType, transactionID, reportID, backToReport),
        );
    };

    const {validateFiles, PDFValidationComponent, ErrorModal} = useScanCapture((files: FileObject[]) => {
        processReceipts(files);
    });

    return (
        <>
            {PDFValidationComponent}
            <Camera
                onCapture={(file) => {
                    processReceipts([file]);
                }}
                onDrop={validateFiles}
                shouldAcceptMultipleFiles
            />
            {ErrorModal}
        </>
    );
}

ScanFromReport.displayName = 'ScanFromReport';

export default withCurrentUserPersonalDetails(ScanFromReport);
