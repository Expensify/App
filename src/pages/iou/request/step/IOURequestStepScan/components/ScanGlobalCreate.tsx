import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import withCurrentUserPersonalDetails from '@components/withCurrentUserPersonalDetails';
import type {WithCurrentUserPersonalDetailsProps} from '@components/withCurrentUserPersonalDetails';
import useDefaultExpensePolicy from '@hooks/useDefaultExpensePolicy';
import {pregenerateThumbnail} from '@hooks/useLocalReceiptThumbnail';
import useOnyx from '@hooks/useOnyx';
import useSelfDMReport from '@hooks/useSelfDMReport';
import {navigateToConfirmationPage, navigateToParticipantPage} from '@libs/IOUUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getPolicyExpenseChat, isSelfDM} from '@libs/ReportUtils';
import shouldUseDefaultExpensePolicy from '@libs/shouldUseDefaultExpensePolicy';
import useScanCapture from '@pages/iou/request/step/IOURequestStepScan/hooks/useScanCapture';
import type {ReceiptFile} from '@pages/iou/request/step/IOURequestStepScan/types';
import buildReceiptFiles from '@pages/iou/request/step/IOURequestStepScan/utils/buildReceiptFiles';
import getFileSource from '@pages/iou/request/step/IOURequestStepScan/utils/getFileSource';
import startScanProcessSpan from '@pages/iou/request/step/IOURequestStepScan/utils/startScanProcessSpan';
import useScanFileReadabilityCheck from '@pages/iou/request/step/IOURequestStepScan/utils/useScanFileReadabilityCheck';
import {setMoneyRequestParticipants, setMoneyRequestParticipantsFromReport} from '@userActions/IOU';
import {setTransactionReport} from '@userActions/Transaction';
import {removeDraftTransactionsByIDs} from '@userActions/TransactionEdit';
import CONST from '@src/CONST';
import type {IOUType} from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
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
 * Uses default expense policy to auto-select workspace, or navigates to participant picker.
 */
function ScanGlobalCreate({iouType, reportID, transactionID, transaction, backToReport, currentUserPersonalDetails}: ScanGlobalCreateProps) {
    const defaultExpensePolicy = useDefaultExpensePolicy();
    const selfDMReport = useSelfDMReport();
    const [draftTransactionIDs] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_DRAFT, {selector: validTransactionDraftIDsSelector});
    const [amountOwed] = useOnyx(ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED);
    const [userBillingGracePeriodEnds] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_USER_BILLING_GRACE_PERIOD_END);
    const [ownerBillingGracePeriodEnd] = useOnyx(ONYXKEYS.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END);
    const {isMultiScanEnabled} = useMultiScanState();
    const {disableMultiScan} = useMultiScanActions();

    const transactions = transaction ? [transaction] : [];

    useScanFileReadabilityCheck(transactions, draftTransactionIDs ?? [], disableMultiScan);

    const navigateGlobalCreate = (receiptFiles: ReceiptFile[]) => {
        if (shouldUseDefaultExpensePolicy(iouType, defaultExpensePolicy, amountOwed, userBillingGracePeriodEnds, ownerBillingGracePeriodEnd)) {
            const shouldAutoReport = !!defaultExpensePolicy?.autoReporting;
            const targetReport = shouldAutoReport ? getPolicyExpenseChat(currentUserPersonalDetails.accountID, defaultExpensePolicy?.id) : selfDMReport;
            const transactionReportID = isSelfDM(targetReport) ? CONST.REPORT.UNREPORTED_REPORT_ID : targetReport?.reportID;
            const iouTypeTrackOrSubmit = transactionReportID === CONST.REPORT.UNREPORTED_REPORT_ID ? CONST.IOU.TYPE.TRACK : CONST.IOU.TYPE.SUBMIT;

            // If the user previously selected different participants in confirmation, preserve that choice
            if (transaction?.participants && transaction.participants.at(0)?.reportID !== targetReport?.reportID) {
                const isTrackExpense = transaction.participants.at(0)?.reportID === selfDMReport?.reportID;

                const setParticipantsPromises = receiptFiles.map((rf) => setMoneyRequestParticipants(rf.transactionID, transaction.participants));
                Promise.all(setParticipantsPromises).then(() => {
                    if (isTrackExpense) {
                        Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(CONST.IOU.ACTION.CREATE, CONST.IOU.TYPE.TRACK, transactionID, selfDMReport?.reportID));
                    } else {
                        navigateToConfirmationPage(iouType, transactionID, reportID, backToReport, iouType === CONST.IOU.TYPE.CREATE, transaction.reportID);
                    }
                });
                return;
            }

            const setParticipantsPromises = receiptFiles.map((rf) => {
                setTransactionReport(rf.transactionID, {reportID: transactionReportID}, true);
                return setMoneyRequestParticipantsFromReport(rf.transactionID, targetReport, currentUserPersonalDetails.accountID);
            });
            Promise.all(setParticipantsPromises).then(() =>
                Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(CONST.IOU.ACTION.CREATE, iouTypeTrackOrSubmit, transactionID, targetReport?.reportID)),
            );
        } else {
            navigateToParticipantPage(iouType, transactionID, reportID);
        }
    };

    const processReceipts = (files: FileObject[]) => {
        if (files.length === 0) {
            return;
        }

        if (!isMultiScanEnabled) {
            removeDraftTransactionsByIDs(draftTransactionIDs ?? [], true);
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

        if (isMultiScanEnabled) {
            return;
        }

        const firstSource = receiptFiles.at(0)?.source;
        if (typeof firstSource === 'string' && firstSource) {
            pregenerateThumbnail(firstSource).then(() => navigateGlobalCreate(receiptFiles));
        } else {
            navigateGlobalCreate(receiptFiles);
        }
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

ScanGlobalCreate.displayName = 'ScanGlobalCreate';

export default withCurrentUserPersonalDetails(ScanGlobalCreate);
