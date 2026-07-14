import {useFullScreenLoaderActions} from '@components/FullScreenLoaderContext';
import withCurrentUserPersonalDetails from '@components/withCurrentUserPersonalDetails';
import type {WithCurrentUserPersonalDetailsProps} from '@components/withCurrentUserPersonalDetails';

import useDelegateAccountID from '@hooks/useDelegateAccountID';
import useFilesValidation from '@hooks/useFilesValidation';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useOptimisticDraftTransactions from '@hooks/useOptimisticDraftTransactions';
import useParticipantsPolicyTags from '@hooks/useParticipantsPolicyTags';
import usePermissions from '@hooks/usePermissions';
import usePolicy from '@hooks/usePolicy';
import usePolicyForMovingExpenses from '@hooks/usePolicyForMovingExpenses';
import useReportAttributes from '@hooks/useReportAttributes';
import useReportIsArchived from '@hooks/useReportIsArchived';
import useSelfDMReport from '@hooks/useSelfDMReport';
import useSkipConfirmationPreInsert from '@hooks/useSkipConfirmationPreInsert';

import {createTransaction, getMoneyRequestParticipantOptions} from '@libs/actions/IOU/MoneyRequest';
import {startSplitBill} from '@libs/actions/IOU/Split';
import {clearUserLocation, setUserLocation} from '@libs/actions/UserLocation';
import getCurrentPosition from '@libs/getCurrentPosition';
import {calculateDefaultReimbursable, getExistingTransactionID} from '@libs/IOUUtils';
import Log from '@libs/Log';
import cleanupAfterSkipConfirmSubmit from '@libs/Navigation/helpers/cleanupAfterSkipConfirmSubmit';
import {submitWithDismissFirst} from '@libs/Navigation/helpers/submitWithDismissFirst';
import {rand64} from '@libs/NumberUtils';
import {isMoneyRequestReport} from '@libs/ReportUtils';
import {cancelSpan} from '@libs/telemetry/activeSpans';
import type {ReceiptCaptureSource} from '@libs/telemetry/ReceiptObservability';
import {getPickerCaptureSource} from '@libs/telemetry/ReceiptObservability';
import {getDefaultTaxCode, getIsFromGlobalCreate, getTaxValue} from '@libs/TransactionUtils';

import {getLocationPermission} from '@pages/iou/request/step/IOURequestStepScan/LocationPermission';
import type {ReceiptFile} from '@pages/iou/request/step/IOURequestStepScan/types';
import buildReceiptFiles from '@pages/iou/request/step/IOURequestStepScan/utils/buildReceiptFiles';
import getFileSource from '@pages/iou/request/step/IOURequestStepScan/utils/getFileSource';
import useScanFileReadabilityCheck from '@pages/iou/request/step/IOURequestStepScan/utils/useScanFileReadabilityCheck';
import {resolveChatTargetForScan} from '@pages/iou/request/step/resolveChatTarget';

import CONST from '@src/CONST';
import type {IOUAction, IOUType} from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {validTransactionDraftIDsSelector, validTransactionDraftsSelector} from '@src/selectors/TransactionDraft';
import type {Report} from '@src/types/onyx';
import type Transaction from '@src/types/onyx/Transaction';
import type {Receipt} from '@src/types/onyx/Transaction';
import type {FileObject} from '@src/types/utils/Attachment';

import type {OnyxEntry} from 'react-native-onyx';

import shouldStartLocationPermissionFlowSelector from '@selectors/LocationPermission';
import React, {useEffect, useState} from 'react';
import {RESULTS} from 'react-native-permissions';

import Camera from './Camera';
import GpsPermissionGate from './GpsPermissionGate';
import {useMultiScanActions, useMultiScanState} from './MultiScanContext';

type ScanSkipConfirmationProps = WithCurrentUserPersonalDetailsProps & {
    report: OnyxEntry<Report>;
    action: IOUAction;
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
function ScanSkipConfirmation({report, action, iouType, reportID, transactionID, transaction, backToReport, currentUserPersonalDetails}: ScanSkipConfirmationProps) {
    const policy = usePolicy(report?.policyID);
    const {policyForMovingExpenses} = usePolicyForMovingExpenses();
    const isArchived = useReportIsArchived(report?.reportID);
    const selfDMReport = useSelfDMReport();
    const reportAttributesDerived = useReportAttributes();
    const {isBetaEnabled} = usePermissions();
    const isASAPSubmitBetaEnabled = isBetaEnabled(CONST.BETAS.ASAP_SUBMIT);
    const delegateAccountID = useDelegateAccountID();

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
    const {translate} = useLocalize();
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
        translate,
    );
    const participantsPolicyTags = useParticipantsPolicyTags(participants);

    const defaultTaxCode = getDefaultTaxCode(policy, transaction);
    const transactionTaxCode = (transaction?.taxCode ? transaction.taxCode : defaultTaxCode) ?? '';
    const transactionTaxAmount = transaction?.taxAmount ?? 0;
    const transactionTaxValue = transaction?.taxValue ?? getTaxValue(policy, transaction, transactionTaxCode) ?? '';

    useScanFileReadabilityCheck(transactions, draftTransactionIDs ?? [], disableMultiScan);

    const preInsertReportID = iouType === CONST.IOU.TYPE.TRACK ? (report?.reportID ?? selfDMReport?.reportID) : report?.reportID;
    useSkipConfirmationPreInsert(true, preInsertReportID);

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

        const participant = participants.at(0);
        const {chatReportID, optimisticChatReportID} = resolveChatTargetForScan({
            iouType,
            participant,
            report,
            currentUserAccountID: currentUserPersonalDetails.accountID,
        });
        const optimisticTransactionIDs = files.map(() => rand64());
        const lastOptimisticTransactionID = optimisticTransactionIDs.at(-1) ?? transactionID;
        const linkedTrackedExpenseReportAction = transaction?.linkedTrackedExpenseReportAction;
        const isFromGlobalCreate = getIsFromGlobalCreate(transaction);

        const firstReceiptFile = files.at(0);

        // Split bill flow
        if (iouType === CONST.IOU.TYPE.SPLIT && firstReceiptFile) {
            const splitReceipt: Receipt = firstReceiptFile.file ?? {};
            splitReceipt.source = firstReceiptFile.source;
            splitReceipt.state = CONST.IOU.RECEIPT_STATE.SCAN_READY;

            const splitBaseParams = {
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
            };

            submitWithDismissFirst({
                executeWrite: (overrides) => {
                    startSplitBill({
                        ...splitBaseParams,
                        shouldHandleNavigation: overrides.shouldHandleNavigation,
                        shouldDeferForSearch: false,
                    });
                    cleanupAfterSkipConfirmSubmit(overrides.shouldHandleNavigation, {
                        report,
                        action,
                        draftTransactionIDs,
                        transactionID: getExistingTransactionID(linkedTrackedExpenseReportAction) ?? lastOptimisticTransactionID,
                        isFromGlobalCreate,
                        backToReport,
                        optimisticChatReportID: chatReportID,
                        linkedTrackedExpenseReportAction,
                    });
                },
                destinationReportID: reportID,
                telemetryContext: {
                    scenario: CONST.TELEMETRY.SUBMIT_EXPENSE_SCENARIO.SPLIT_RECEIPT,
                    iouType: CONST.IOU.TYPE.SPLIT,
                    requestType: CONST.IOU.REQUEST_TYPE.SCAN,
                    isFromGlobalCreate: !report?.reportID,
                    hasReceipt: true,
                },
            });
            return;
        }

        // Single expense flow
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
            optimisticTransactionIDs,
            optimisticChatReportID,
            currentUserLocalCurrency: currentUserPersonalDetails.localCurrencyCode ?? CONST.CURRENCY.USD,
            delegateAccountID,
        };

        const scanDestinationReportID = iouType === CONST.IOU.TYPE.TRACK ? (report?.reportID ?? selfDMReport?.reportID) : report?.reportID;
        submitWithDismissFirst({
            executeWrite: (overrides) => {
                // Cleanup runs after each write (not once up front) so a stalled GPS lookup can't clear the draft before the expense exists.
                const runCleanup = () =>
                    cleanupAfterSkipConfirmSubmit(overrides.shouldHandleNavigation, {
                        report,
                        action,
                        draftTransactionIDs,
                        transactionID: lastOptimisticTransactionID,
                        isFromGlobalCreate,
                        backToReport,
                        optimisticChatReportID: chatReportID,
                        linkedTrackedExpenseReportAction,
                    });
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
                            runCleanup();
                        },
                        (errorData) => {
                            Log.info('[ScanSkipConfirmation] getCurrentPosition failed', false, errorData);
                            // When there is an error, the money can still be requested, it just won't include the GPS coordinates
                            createTransaction(baseParams);
                            runCleanup();
                        },
                    );
                    return;
                }
                createTransaction(baseParams);
                runCleanup();
            },
            destinationReportID: scanDestinationReportID,
            telemetryContext: {
                scenario: iouType === CONST.IOU.TYPE.TRACK ? CONST.TELEMETRY.SUBMIT_EXPENSE_SCENARIO.TRACK_EXPENSE : CONST.TELEMETRY.SUBMIT_EXPENSE_SCENARIO.REQUEST_MONEY_SCAN,
                iouType,
                requestType: CONST.IOU.REQUEST_TYPE.SCAN,
                isFromGlobalCreate: !report?.reportID,
                hasReceipt: true,
            },
        });
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

    const processReceipts = (files: FileObject[], captureSource: ReceiptCaptureSource) => {
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
            captureSource,
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
        processReceipts(files, getPickerCaptureSource());
    });

    return (
        <>
            {PDFValidationComponent}
            <Camera
                onCapture={(file) => {
                    processReceipts([file], 'camera');
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
