import {useRoute} from '@react-navigation/native';
import shouldStartLocationPermissionFlowSelector from '@selectors/LocationPermission';
import {hasSeenTourSelector} from '@selectors/Onboarding';
import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import {RESULTS} from 'react-native-permissions';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useFilesValidation from '@hooks/useFilesValidation';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useOptimisticDraftTransactions from '@hooks/useOptimisticDraftTransactions';
import usePermissions from '@hooks/usePermissions';
import usePolicy from '@hooks/usePolicy';
import usePolicyForMovingExpenses from '@hooks/usePolicyForMovingExpenses';
import useReportAttributes from '@hooks/useReportAttributes';
import useReportIsArchived from '@hooks/useReportIsArchived';
import {createTransaction} from '@libs/actions/IOU/MoneyRequest';
import {clearUserLocation, setUserLocation} from '@libs/actions/UserLocation';
import getCurrentPosition from '@libs/getCurrentPosition';
import {calculateDefaultReimbursable} from '@libs/IOUUtils';
import Log from '@libs/Log';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {MoneyRequestNavigatorParamList} from '@libs/Navigation/types';
import {getParticipantsOption, getReportOption} from '@libs/OptionsListUtils';
import {isPolicyExpenseChat} from '@libs/ReportUtils';
import {cancelSpan, endSpan} from '@libs/telemetry/activeSpans';
import {getDefaultTaxCode} from '@libs/TransactionUtils';
import {getLocationPermission} from '@pages/iou/request/step/IOURequestStepScan/LocationPermission';
import type {ReceiptFile} from '@pages/iou/request/step/IOURequestStepScan/types';
import bridgeCameraToValidation from '@pages/iou/request/step/IOURequestStepScan/utils/bridgeCameraToValidation';
import buildReceiptFiles from '@pages/iou/request/step/IOURequestStepScan/utils/buildReceiptFiles';
import getFileSource from '@pages/iou/request/step/IOURequestStepScan/utils/getFileSource';
import startScanProcessSpan from '@pages/iou/request/step/IOURequestStepScan/utils/startScanProcessSpan';
import useScanFileReadabilityCheck from '@pages/iou/request/step/IOURequestStepScan/utils/useScanFileReadabilityCheck';
import StepScreenWrapper from '@pages/iou/request/step/StepScreenWrapper';
import {getMoneyRequestParticipantsFromReport, getPolicyTags} from '@userActions/IOU';
import {startSplitBill} from '@userActions/IOU/Split';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import {validTransactionDraftsSelector} from '@src/selectors/TransactionDraft';
import type {PolicyTagLists} from '@src/types/onyx';
import type {Receipt} from '@src/types/onyx/Transaction';
import type {FileObject} from '@src/types/utils/Attachment';
import Camera from './Camera';
import GpsPermissionGate from './GpsPermissionGate';

/**
 * ScanSkipConfirmation — skip-confirmation variant.
 * Used when !isFromGlobalCreate && shouldSkipConfirmation.
 *
 * Press handler: directly calls requestMoney/trackExpense/startSplitBill
 */
function ScanSkipConfirmation() {
    const route = useRoute<PlatformStackRouteProp<MoneyRequestNavigatorParamList, typeof SCREENS.MONEY_REQUEST.STEP_SCAN>>();
    const {action, iouType, reportID, transactionID: initialTransactionID, backTo, backToReport} = route.params;

    const {translate} = useLocalize();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const policy = usePolicy(report?.policyID);
    const [initialTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${initialTransactionID}`);
    const [transactions] = useOptimisticDraftTransactions(initialTransaction);

    const {isBetaEnabled} = usePermissions();
    const {policyForMovingExpenses} = usePolicyForMovingExpenses();
    const reportAttributesDerived = useReportAttributes();

    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);
    const [skipConfirmation] = useOnyx(`${ONYXKEYS.COLLECTION.SKIP_CONFIRMATION}${initialTransactionID}`);
    const [reportNameValuePairs] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${report?.reportID}`);
    const [quickAction] = useOnyx(ONYXKEYS.NVP_QUICK_ACTION_GLOBAL_CREATE);
    const [policyRecentlyUsedCurrencies] = useOnyx(ONYXKEYS.RECENTLY_USED_CURRENCIES);
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID);
    const [isSelfTourViewed = false] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {selector: hasSeenTourSelector});
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const [transactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS);
    const [allTransactionDrafts] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_DRAFT, {selector: validTransactionDraftsSelector});
    const [recentWaypoints] = useOnyx(ONYXKEYS.NVP_RECENT_WAYPOINTS);

    const [shouldStartLocationPermissionFlow] = useOnyx(ONYXKEYS.NVP_LAST_LOCATION_PERMISSION_PROMPT, {
        selector: shouldStartLocationPermissionFlowSelector,
    });

    const isEditing = action === CONST.IOU.ACTION.EDIT;
    const isArchived = useReportIsArchived(report?.reportID);
    const shouldAcceptMultipleFiles = !isEditing && !backTo;
    const shouldGenerateTransactionThreadReport = !isBetaEnabled(CONST.BETAS.NO_OPTIMISTIC_TRANSACTION_THREADS);
    const isASAPSubmitBetaEnabled = isBetaEnabled(CONST.BETAS.ASAP_SUBMIT);
    const shouldShowWrapper = !!backTo || isEditing;

    const defaultTaxCode = getDefaultTaxCode(policy, initialTransaction);
    const transactionTaxCode = (initialTransaction?.taxCode ? initialTransaction?.taxCode : defaultTaxCode) ?? '';
    const transactionTaxAmount = initialTransaction?.taxAmount ?? 0;

    // For quick button actions, we'll skip the confirmation page unless the report is archived or this is a workspace
    // request and the workspace requires a category or a tag
    const shouldSkipConfirmation =
        !!skipConfirmation && !!report?.reportID && !isArchived && !(isPolicyExpenseChat(report) && ((policy?.requiresCategory ?? false) || (policy?.requiresTag ?? false)));

    const [showGpsPermission, setShowGpsPermission] = useState(false);
    const [receiptFiles, setReceiptFiles] = useState<ReceiptFile[]>([]);

    const navigateBack = () => {
        Navigation.goBack(backTo);
    };

    function navigateToConfirmationStep(files: ReceiptFile[], locationPermissionGranted = false) {
        startScanProcessSpan();

        if (backTo) {
            Navigation.goBack(backTo);
            return;
        }

        // Skip confirmation: directly call requestMoney/trackExpense/startSplitBill
        // Inline getMoneyRequestParticipantOptions logic (not exported from MoneyRequest.ts)
        const selectedParticipants = getMoneyRequestParticipantsFromReport(report, currentUserPersonalDetails.accountID);
        const participants = selectedParticipants.map((participant) => {
            const participantAccountID = participant?.accountID ?? CONST.DEFAULT_NUMBER_ID;
            return participantAccountID
                ? getParticipantsOption(participant, personalDetails)
                : getReportOption(participant, reportNameValuePairs?.private_isArchived, policy, currentUserPersonalDetails.accountID, personalDetails, reportAttributesDerived);
        });

        cancelSpan(CONST.TELEMETRY.SPAN_SCAN_PROCESS_AND_NAVIGATE);
        cancelSpan(CONST.TELEMETRY.SPAN_CONFIRMATION_MOUNT);
        cancelSpan(CONST.TELEMETRY.SPAN_SHUTTER_TO_CONFIRMATION);
        cancelSpan(CONST.TELEMETRY.SPAN_CONFIRMATION_LIST_READY);
        cancelSpan(CONST.TELEMETRY.SPAN_CONFIRMATION_RECEIPT_LOAD);

        // SPLIT branch
        const firstReceiptFile = files.at(0);
        if (iouType === CONST.IOU.TYPE.SPLIT && firstReceiptFile) {
            const splitReceipt: Receipt = firstReceiptFile.file ?? {};
            splitReceipt.source = firstReceiptFile.source;
            splitReceipt.state = CONST.IOU.RECEIPT_STATE.SCAN_READY;
            const allPolicyTags = getPolicyTags();
            const participantsPolicyTags = participants.reduce<Record<string, PolicyTagLists>>((acc, participant) => {
                if (participant.policyID) {
                    acc[participant.policyID] = allPolicyTags?.[`${ONYXKEYS.COLLECTION.POLICY_TAGS}${participant.policyID}`] ?? {};
                }
                return acc;
            }, {});
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
                currency: initialTransaction?.currency ?? 'USD',
                taxCode: transactionTaxCode,
                taxAmount: transactionTaxAmount,
                quickAction,
                policyRecentlyUsedCurrencies: policyRecentlyUsedCurrencies ?? [],
                policyRecentlyUsedTags: undefined,
                participantsPolicyTags,
            });
            return;
        }

        // Normal branch (requestMoney / trackExpense)
        const participant = participants.at(0);
        if (!participant) {
            return;
        }
        const defaultReimbursable = calculateDefaultReimbursable({
            iouType,
            policy,
            policyForMovingExpenses,
            participant,
            transactionReportID: initialTransaction?.reportID,
        });

        // GPS branch
        if (locationPermissionGranted) {
            getCurrentPosition(
                (successData) => {
                    const policyParams = {policy};
                    const gpsPoint = {
                        lat: successData.coords.latitude,
                        long: successData.coords.longitude,
                    };
                    createTransaction({
                        transactions,
                        iouType,
                        report,
                        currentUserAccountID: currentUserPersonalDetails.accountID,
                        currentUserEmail: currentUserPersonalDetails.login,
                        backToReport,
                        shouldGenerateTransactionThreadReport,
                        isASAPSubmitBetaEnabled,
                        transactionViolations,
                        quickAction,
                        policyRecentlyUsedCurrencies,
                        introSelected,
                        activePolicyID,
                        files,
                        participant,
                        gpsPoint,
                        policyParams,
                        billable: false,
                        reimbursable: defaultReimbursable,
                        isSelfTourViewed,
                        allTransactionDrafts,
                        betas,
                        personalDetails,
                        recentWaypoints,
                    });
                },
                (errorData) => {
                    Log.info('[ScanSkipConfirmation] getCurrentPosition failed', false, errorData);
                    createTransaction({
                        transactions,
                        iouType,
                        report,
                        currentUserAccountID: currentUserPersonalDetails.accountID,
                        currentUserEmail: currentUserPersonalDetails.login,
                        backToReport,
                        shouldGenerateTransactionThreadReport,
                        isASAPSubmitBetaEnabled,
                        transactionViolations,
                        quickAction,
                        policyRecentlyUsedCurrencies,
                        introSelected,
                        activePolicyID,
                        files,
                        participant,
                        reimbursable: defaultReimbursable,
                        isSelfTourViewed,
                        allTransactionDrafts,
                        betas,
                        personalDetails,
                        recentWaypoints,
                    });
                },
            );
            return;
        }

        // No GPS needed
        createTransaction({
            transactions,
            iouType,
            report,
            currentUserAccountID: currentUserPersonalDetails.accountID,
            currentUserEmail: currentUserPersonalDetails.login,
            backToReport,
            shouldGenerateTransactionThreadReport,
            isASAPSubmitBetaEnabled,
            transactionViolations,
            quickAction,
            policyRecentlyUsedCurrencies,
            introSelected,
            activePolicyID,
            files,
            participant,
            reimbursable: defaultReimbursable,
            isSelfTourViewed,
            allTransactionDrafts,
            betas,
            personalDetails,
            recentWaypoints,
        });
    }

    function processReceipts(files: FileObject[]) {
        if (files.length === 0) {
            return;
        }

        const newReceiptFiles = buildReceiptFiles({
            files,
            getSource: getFileSource,
            initialTransaction,
            initialTransactionID,
            shouldAcceptMultipleFiles,
            transactions,
            currentUserPersonalDetails,
            reportID,
        });

        // Skip confirmation path: check if GPS is needed
        const gpsRequired = shouldSkipConfirmation && initialTransaction?.amount === 0 && iouType !== CONST.IOU.TYPE.SPLIT && files.length > 0;
        if (gpsRequired) {
            setReceiptFiles(newReceiptFiles);
            if (shouldStartLocationPermissionFlow) {
                setShowGpsPermission(true);
                return;
            }
            navigateToConfirmationStep(newReceiptFiles, true);
            return;
        }
        navigateToConfirmationStep(newReceiptFiles, false);
    }

    const {validateFiles, PDFValidationComponent, ErrorModal} = useFilesValidation((files: FileObject[]) => {
        processReceipts(files);
    });

    function handleCapture(file: FileObject, source: string) {
        bridgeCameraToValidation(file, source, validateFiles);
    }

    // End the create expense span on mount
    useEffect(() => {
        endSpan(CONST.TELEMETRY.SPAN_OPEN_CREATE_EXPENSE);
    }, []);

    useScanFileReadabilityCheck(transactions);

    // Pre-fetch location on web if permission already granted
    useEffect(() => {
        const gpsRequired = initialTransaction?.amount === 0 && iouType !== CONST.IOU.TYPE.SPLIT;
        if (!gpsRequired) {
            return;
        }

        getLocationPermission().then((status) => {
            if (status !== RESULTS.GRANTED && status !== RESULTS.LIMITED) {
                return;
            }
            clearUserLocation();
            getCurrentPosition(
                (successData) => {
                    setUserLocation({longitude: successData.coords.longitude, latitude: successData.coords.latitude});
                },
                () => {},
            );
        });
    }, [initialTransaction?.amount, iouType]);

    return (
        <StepScreenWrapper
            headerTitle={translate('common.receipt')}
            onBackButtonPress={navigateBack}
            shouldShowWrapper={shouldShowWrapper}
            testID="IOURequestStepScan"
        >
            <View>
                {PDFValidationComponent}
                <Camera
                    // eslint-disable-next-line react/jsx-no-bind -- React Compiler handles memoization
                    onCapture={handleCapture}
                    shouldAcceptMultipleFiles={shouldAcceptMultipleFiles}
                />
                {ErrorModal}
                <GpsPermissionGate
                    active={showGpsPermission}
                    onResolved={(locationPermissionGranted) => {
                        setShowGpsPermission(false);
                        navigateToConfirmationStep(receiptFiles, locationPermissionGranted);
                    }}
                />
            </View>
        </StepScreenWrapper>
    );
}

ScanSkipConfirmation.displayName = 'ScanSkipConfirmation';

export default ScanSkipConfirmation;
