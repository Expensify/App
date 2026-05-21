import shouldStartLocationPermissionFlowSelector from '@selectors/LocationPermission';
import React, {useEffect, useState} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {RESULTS} from 'react-native-permissions';
import {useFullScreenLoaderActions} from '@components/FullScreenLoaderContext';
import withCurrentUserPersonalDetails from '@components/withCurrentUserPersonalDetails';
import type {WithCurrentUserPersonalDetailsProps} from '@components/withCurrentUserPersonalDetails';
import useFilesValidation from '@hooks/useFilesValidation';
import useOnyx from '@hooks/useOnyx';
import useOptimisticDraftTransactions from '@hooks/useOptimisticDraftTransactions';
import useParticipantsPolicyTags from '@hooks/useParticipantsPolicyTags';
import usePermissions from '@hooks/usePermissions';
import usePolicy from '@hooks/usePolicy';
import usePolicyForMovingExpenses from '@hooks/usePolicyForMovingExpenses';
import useReportAttributes from '@hooks/useReportAttributes';
import useReportIsArchived from '@hooks/useReportIsArchived';
import {createTransaction, getMoneyRequestParticipantOptions} from '@libs/actions/IOU/MoneyRequest';
import {startSplitBill} from '@libs/actions/IOU/Split';
import {clearUserLocation, setUserLocation} from '@libs/actions/UserLocation';
import getCurrentPosition from '@libs/getCurrentPosition';
import {calculateDefaultReimbursable} from '@libs/IOUUtils';
import Log from '@libs/Log';
import {isMoneyRequestReport} from '@libs/ReportUtils';
import {cancelSpan} from '@libs/telemetry/activeSpans';
import {getDefaultTaxCode, getTaxValue} from '@libs/TransactionUtils';
import {getLocationPermission} from '@pages/iou/request/step/IOURequestStepScan/LocationPermission';
import type {ReceiptFile} from '@pages/iou/request/step/IOURequestStepScan/types';
import buildReceiptFiles from '@pages/iou/request/step/IOURequestStepScan/utils/buildReceiptFiles';
import getFileSource from '@pages/iou/request/step/IOURequestStepScan/utils/getFileSource';
import useScanFileReadabilityCheck from '@pages/iou/request/step/IOURequestStepScan/utils/useScanFileReadabilityCheck';
import CONST from '@src/CONST';
import type {IOUType} from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {validTransactionDraftIDsSelector, validTransactionDraftsSelector} from '@src/selectors/TransactionDraft';
import type {Report} from '@src/types/onyx';
import type Transaction from '@src/types/onyx/Transaction';
import type {Receipt} from '@src/types/onyx/Transaction';
import type {FileObject} from '@src/types/utils/Attachment';
import Camera from './Camera';
import GpsPermissionGate from './GpsPermissionGate';
import {useMultiScanActions, useMultiScanState} from './MultiScanContext';

type ScanSkipConfirmationProps = WithCurrentUserPersonalDetailsProps & {
    report: OnyxEntry<Report>;
    iouType: IOUType;
    reportID: string;
    transactionID: string;
    transaction: OnyxEntry<Transaction>;
    backToReport: string | undefined;
};

/**
 * ScanSkipConfirmation — directly creates the transaction without showing the confirmation page.
 * Handles GPS permission flow, split bills, and direct submission.
 * Most complex variant with the most Onyx subscriptions.
 */
function ScanSkipConfirmation({report, iouType, reportID, transactionID, transaction, backToReport, currentUserPersonalDetails}: ScanSkipConfirmationProps) {
    const policy = usePolicy(report?.policyID);
    const {policyForMovingExpenses} = usePolicyForMovingExpenses();
    const isArchived = useReportIsArchived(report?.reportID);
    const reportAttributesDerived = useReportAttributes();
    const {isBetaEnabled} = usePermissions();
    const isASAPSubmitBetaEnabled = isBetaEnabled(CONST.BETAS.ASAP_SUBMIT);

    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);
    const [quickAction] = useOnyx(ONYXKEYS.NVP_QUICK_ACTION_GLOBAL_CREATE);
    const [policyRecentlyUsedCurrencies] = useOnyx(ONYXKEYS.RECENTLY_USED_CURRENCIES);
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID);
    const [isSelfTourViewed = false] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {selector: (value: OnyxEntry<Record<string, unknown>>) => !!value?.hasSeenTour});
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const [transactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS);
    const [recentWaypoints] = useOnyx(ONYXKEYS.NVP_RECENT_WAYPOINTS);
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const reportIDToCheck = isMoneyRequestReport(report) ? report?.chatReportID : report?.reportID;
    const [reportDraft] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_DRAFT}${reportIDToCheck}`);
    const [allTransactionDrafts] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_DRAFT, {selector: validTransactionDraftsSelector});
    const [draftTransactionIDs] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_DRAFT, {selector: validTransactionDraftIDsSelector});
    const [shouldStartLocationPermissionFlow] = useOnyx(ONYXKEYS.NVP_LAST_LOCATION_PERMISSION_PROMPT, {
        selector: shouldStartLocationPermissionFlowSelector,
    });

    const [transactions] = useOptimisticDraftTransactions(transaction);
    const {isMultiScanEnabled} = useMultiScanState();
    const {disableMultiScan} = useMultiScanActions();
    const {setIsLoaderVisible} = useFullScreenLoaderActions();
    const [startLocationPermissionFlow, setStartLocationPermissionFlow] = useState(false);
    const [receiptFiles, setReceiptFiles] = useState<ReceiptFile[]>([]);

    const participants = getMoneyRequestParticipantOptions(
        currentUserPersonalDetails.accountID,
        report,
        policy,
        personalDetails,
        conciergeReportID,
        isArchived,
        reportAttributesDerived,
        reportDraft,
    );
    const participantsPolicyTags = useParticipantsPolicyTags(participants);

    const defaultTaxCode = getDefaultTaxCode(policy, transaction);
    const transactionTaxCode = (transaction?.taxCode ? transaction.taxCode : defaultTaxCode) ?? '';
    const transactionTaxAmount = transaction?.taxAmount ?? 0;
    const transactionTaxValue = transaction?.taxValue ?? getTaxValue(policy, transaction, transactionTaxCode) ?? '';

    useScanFileReadabilityCheck(transactions, draftTransactionIDs ?? [], disableMultiScan);

    // Pre-fetch location if GPS is required and permission is already granted
    useEffect(() => {
        let ignore = false;
        const gpsRequired = transaction?.amount === 0 && iouType !== CONST.IOU.TYPE.SPLIT;
        if (!gpsRequired) {
            return;
        }

        getLocationPermission().then((status) => {
            if (ignore || (status !== RESULTS.GRANTED && status !== RESULTS.LIMITED)) {
                return;
            }

            clearUserLocation();
            getCurrentPosition(
                (successData) => {
                    if (ignore) {
                        return;
                    }
                    setUserLocation({longitude: successData.coords.longitude, latitude: successData.coords.latitude});
                },
                () => {},
            );
        });

        return () => {
            ignore = true;
        };
    }, [transaction?.amount, iouType]);

    const cancelShutterSpans = () => {
        cancelSpan(CONST.TELEMETRY.SPAN_SCAN_PROCESS_AND_NAVIGATE);
        cancelSpan(CONST.TELEMETRY.SPAN_CONFIRMATION_MOUNT);
        cancelSpan(CONST.TELEMETRY.SPAN_SHUTTER_TO_CONFIRMATION);
        cancelSpan(CONST.TELEMETRY.SPAN_ODOMETER_TO_CONFIRMATION);
        cancelSpan(CONST.TELEMETRY.SPAN_CONFIRMATION_LIST_READY);
        cancelSpan(CONST.TELEMETRY.SPAN_CONFIRMATION_RECEIPT_LOAD);
    };

    const submitDirectly = (files: ReceiptFile[], locationPermissionGranted: boolean) => {
        cancelShutterSpans();

        const firstReceiptFile = files.at(0);

        // Split bill flow
        if (iouType === CONST.IOU.TYPE.SPLIT && firstReceiptFile) {
            const splitReceipt: Receipt = firstReceiptFile.file ?? {};
            splitReceipt.source = firstReceiptFile.source;
            splitReceipt.state = CONST.IOU.RECEIPT_STATE.SCAN_READY;

            startSplitBill({
                participants,
                currentUserLogin: currentUserPersonalDetails.login ?? '',
                currentUserAccountID: currentUserPersonalDetails.accountID,
                comment: '',
                receipt: splitReceipt,
                existingSplitChatReportID: reportID,
                billable: false,
                category: '',
                tag: '',
                currency: transaction?.currency ?? CONST.CURRENCY.USD,
                taxCode: transactionTaxCode,
                taxAmount: transactionTaxAmount,
                taxValue: transactionTaxValue,
                quickAction,
                policyRecentlyUsedCurrencies: policyRecentlyUsedCurrencies ?? [],
                policyRecentlyUsedTags: undefined,
                participantsPolicyTags,
            });
            return;
        }

        // Single expense flow
        const participant = participants.at(0);
        if (!participant) {
            return;
        }

        const defaultReimbursable = calculateDefaultReimbursable({
            iouType,
            policy,
            policyForMovingExpenses,
            participant,
            transactionReportID: transaction?.reportID,
        });

        const baseParams = {
            transactions,
            iouType,
            report,
            currentUserAccountID: currentUserPersonalDetails.accountID,
            currentUserEmail: currentUserPersonalDetails.login,
            backToReport,
            shouldGenerateTransactionThreadReport: false,
            isASAPSubmitBetaEnabled,
            transactionViolations,
            quickAction,
            policyRecentlyUsedCurrencies,
            introSelected,
            activePolicyID,
            files,
            participant,
            policyParams: {policy},
            billable: false,
            reimbursable: defaultReimbursable,
            isSelfTourViewed,
            allTransactionDrafts,
            betas,
            personalDetails,
            recentWaypoints,
        };

        if (locationPermissionGranted) {
            getCurrentPosition(
                (successData) => {
                    createTransaction({
                        ...baseParams,
                        gpsPoint: {
                            lat: successData.coords.latitude,
                            long: successData.coords.longitude,
                        },
                    });
                },
                (errorData) => {
                    Log.info('[ScanSkipConfirmation] getCurrentPosition failed', false, errorData);
                    createTransaction(baseParams);
                },
            );
            return;
        }

        createTransaction(baseParams);
    };

    const submitWithGpsCheck = (files: ReceiptFile[]) => {
        const gpsRequired = transaction?.amount === 0 && iouType !== CONST.IOU.TYPE.SPLIT;
        if (gpsRequired) {
            if (shouldStartLocationPermissionFlow) {
                setStartLocationPermissionFlow(true);
                return;
            }
            submitDirectly(files, true);
            return;
        }
        submitDirectly(files, false);
    };

    const processReceipts = (files: FileObject[]) => {
        const newReceiptFiles = buildReceiptFiles({
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

        if (newReceiptFiles.length === 0) {
            return;
        }

        setReceiptFiles((prev) => (isMultiScanEnabled ? [...prev, ...newReceiptFiles] : newReceiptFiles));

        if (isMultiScanEnabled) {
            return;
        }

        submitWithGpsCheck(newReceiptFiles);
    };

    const submitMultiScan = () => {
        const draftIDs = new Set(transactions.map((t) => t.transactionID).filter((id): id is string => !!id));
        const validReceiptFiles = receiptFiles.filter((rf) => draftIDs.has(rf.transactionID));
        if (validReceiptFiles.length === 0) {
            return;
        }
        submitWithGpsCheck(validReceiptFiles);
    };

    const {validateFiles, PDFValidationComponent, ErrorModal} = useFilesValidation((files: FileObject[]) => {
        processReceipts(files);
    });

    return (
        <>
            {PDFValidationComponent}
            <Camera
                onCapture={(file) => {
                    processReceipts([file]);
                }}
                onPicked={validateFiles}
                onAttachmentPickerStatusChange={setIsLoaderVisible}
                onMultiScanSubmit={submitMultiScan}
                shouldAcceptMultipleFiles
            />
            {ErrorModal}
            <GpsPermissionGate
                startLocationPermissionFlow={startLocationPermissionFlow}
                receiptFiles={receiptFiles}
                resetPermissionFlow={() => setStartLocationPermissionFlow(false)}
                onComplete={submitDirectly}
            />
        </>
    );
}

ScanSkipConfirmation.displayName = 'ScanSkipConfirmation';

export default withCurrentUserPersonalDetails(ScanSkipConfirmation);
