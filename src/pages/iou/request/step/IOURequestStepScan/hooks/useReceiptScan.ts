import shouldStartLocationPermissionFlowSelector from '@selectors/LocationPermission';
import {hasSeenTourSelector} from '@selectors/Onboarding';
import {useMemo, useState} from 'react';
import TestReceipt from '@assets/images/fake-receipt.png';
import useDefaultExpensePolicy from '@hooks/useDefaultExpensePolicy';
import useFilesValidation from '@hooks/useFilesValidation';
import useOnyx from '@hooks/useOnyx';
import useOptimisticDraftTransactions from '@hooks/useOptimisticDraftTransactions';
import useParticipantsPolicyTags from '@hooks/useParticipantsPolicyTags';
import usePermissions from '@hooks/usePermissions';
import usePersonalPolicy from '@hooks/usePersonalPolicy';
import usePolicy from '@hooks/usePolicy';
import usePolicyForMovingExpenses from '@hooks/usePolicyForMovingExpenses';
import useReportAttributes from '@hooks/useReportAttributes';
import useReportIsArchived from '@hooks/useReportIsArchived';
import useSelfDMReport from '@hooks/useSelfDMReport';
import {getMoneyRequestParticipantOptions, handleMoneyRequestStepScanParticipants} from '@libs/actions/IOU/MoneyRequest';
import setTestReceipt from '@libs/actions/setTestReceipt';
import {isPolicyExpenseChat} from '@libs/ReportUtils';
import {getSpan, startSpan} from '@libs/telemetry/activeSpans';
import {getDefaultTaxCode, getTaxValue, hasReceipt, shouldReuseInitialTransaction} from '@libs/TransactionUtils';
import type {ReceiptFile, UseReceiptScanParams} from '@pages/iou/request/step/IOURequestStepScan/types';
import {setMoneyRequestReceipt} from '@userActions/IOU/Receipt';
import {buildOptimisticTransactionAndCreateDraft, removeDraftTransactionsByIDs} from '@userActions/TransactionEdit';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import {validTransactionDraftsSelector} from '@src/selectors/TransactionDraft';
import type Transaction from '@src/types/onyx/Transaction';
import type {FileObject} from '@src/types/utils/Attachment';

function useReceiptScan({
    report,
    reportID,
    initialTransactionID,
    initialTransaction,
    iouType,
    action,
    currentUserPersonalDetails,
    backTo,
    backToReport,
    routeName,
    updateScanAndNavigate,
    getSource,
}: UseReceiptScanParams) {
    const {isBetaEnabled} = usePermissions();
    const [shouldStartLocationPermissionFlow] = useOnyx(ONYXKEYS.NVP_LAST_LOCATION_PERMISSION_PROMPT, {
        selector: shouldStartLocationPermissionFlowSelector,
    });

    const policy = usePolicy(report?.policyID);
    const {policyForMovingExpenses} = usePolicyForMovingExpenses();
    const personalPolicy = usePersonalPolicy();
    const defaultExpensePolicy = useDefaultExpensePolicy();
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);
    const [skipConfirmation] = useOnyx(`${ONYXKEYS.COLLECTION.SKIP_CONFIRMATION}${initialTransactionID}`);
    const isArchived = useReportIsArchived(report?.reportID);
    const [quickAction] = useOnyx(ONYXKEYS.NVP_QUICK_ACTION_GLOBAL_CREATE);
    const reportAttributesDerived = useReportAttributes();
    const [policyRecentlyUsedCurrencies] = useOnyx(ONYXKEYS.RECENTLY_USED_CURRENCIES);
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID);
    const [isSelfTourViewed = false] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {selector: hasSeenTourSelector});
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const [transactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS);
    const [transactions] = useOptimisticDraftTransactions(initialTransaction);
    const selfDMReport = useSelfDMReport();
    const [allTransactionDrafts] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_DRAFT, {selector: validTransactionDraftsSelector});
    const [amountOwed] = useOnyx(ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED);
    const [userBillingGracePeriodEnds] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_USER_BILLING_GRACE_PERIOD_END);
    const [ownerBillingGracePeriodEnd] = useOnyx(ONYXKEYS.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END);
    const draftTransactionIDs = Object.keys(allTransactionDrafts ?? {});
    const [isMultiScanEnabled, setIsMultiScanEnabled] = useState(false);
    const isStartingScan = routeName === SCREENS.MONEY_REQUEST.CREATE;

    const isEditing = action === CONST.IOU.ACTION.EDIT;
    const isReplacingReceipt = (isEditing && hasReceipt(initialTransaction)) || (!!initialTransaction?.receipt && !!backTo);
    const shouldAcceptMultipleFiles = !isEditing && !backTo;
    const isASAPSubmitBetaEnabled = isBetaEnabled(CONST.BETAS.ASAP_SUBMIT);

    const defaultTaxCode = getDefaultTaxCode(policy, initialTransaction);
    const transactionTaxCode = (initialTransaction?.taxCode ? initialTransaction?.taxCode : defaultTaxCode) ?? '';
    const transactionTaxAmount = initialTransaction?.taxAmount ?? 0;
    const transactionTaxValue = initialTransaction?.taxValue ?? getTaxValue(policy, initialTransaction, transactionTaxCode) ?? '';

    // For quick button actions, we'll skip the confirmation page unless the report is archived or this is a workspace
    // request and the workspace requires a category or a tag
    const shouldSkipConfirmation =
        !!skipConfirmation && !!report?.reportID && !isArchived && !(isPolicyExpenseChat(report) && ((policy?.requiresCategory ?? false) || (policy?.requiresTag ?? false)));

    const [startLocationPermissionFlow, setStartLocationPermissionFlow] = useState(false);
    const [receiptFiles, setReceiptFiles] = useState<ReceiptFile[]>([]);

    const [recentWaypoints] = useOnyx(ONYXKEYS.NVP_RECENT_WAYPOINTS);
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);

    const participants = useMemo(
        () => getMoneyRequestParticipantOptions(currentUserPersonalDetails.accountID, report, policy, personalDetails, conciergeReportID, isArchived, reportAttributesDerived),
        [currentUserPersonalDetails.accountID, report, policy, personalDetails, conciergeReportID, isArchived, reportAttributesDerived],
    );

    const participantsPolicyTags = useParticipantsPolicyTags(participants);
    function navigateToConfirmationStep(files: ReceiptFile[], locationPermissionGranted = false, isTestTransaction = false) {
        startSpan(CONST.TELEMETRY.SPAN_SCAN_PROCESS_AND_NAVIGATE, {
            name: CONST.TELEMETRY.SPAN_SCAN_PROCESS_AND_NAVIGATE,
            op: CONST.TELEMETRY.SPAN_SCAN_PROCESS_AND_NAVIGATE,
            parentSpan: getSpan(CONST.TELEMETRY.SPAN_SHUTTER_TO_CONFIRMATION),
            attributes: {[CONST.TELEMETRY.ATTRIBUTE_IS_MULTI_SCAN]: isMultiScanEnabled},
        });

        handleMoneyRequestStepScanParticipants({
            iouType,
            policy,
            report,
            reportID,
            transactions,
            initialTransaction: {
                transactionID: initialTransactionID,
                reportID: initialTransaction?.reportID,
                taxCode: transactionTaxCode,
                taxAmount: transactionTaxAmount,
                taxValue: transactionTaxValue,
                currency: initialTransaction?.currency,
                isFromGlobalCreate: initialTransaction?.isFromGlobalCreate,
                participants: initialTransaction?.participants,
            },
            personalDetails,
            currentUserLogin: currentUserPersonalDetails.login,
            currentUserAccountID: currentUserPersonalDetails.accountID,
            backTo,
            backToReport,
            shouldSkipConfirmation,
            defaultExpensePolicy,
            shouldGenerateTransactionThreadReport: false,
            isArchivedExpenseReport: isArchived,
            isAutoReporting: !!personalPolicy?.autoReporting,
            isASAPSubmitBetaEnabled,
            transactionViolations,
            quickAction,
            policyRecentlyUsedCurrencies,
            introSelected,
            activePolicyID,
            files,
            isTestTransaction,
            locationPermissionGranted,
            selfDMReport,
            policyForMovingExpenses,
            isSelfTourViewed,
            betas,
            recentWaypoints,
            allTransactionDrafts,
            participants,
            participantsPolicyTags,
            amountOwed,
            userBillingGracePeriodEnds,
            ownerBillingGracePeriodEnd,
        });
    }

    function setTestReceiptAndNavigate() {
        setTestReceipt(TestReceipt, 'png', (source, file, filename) => {
            setMoneyRequestReceipt(initialTransactionID, source, filename, !isEditing, CONST.TEST_RECEIPT.FILE_TYPE, true);
            removeDraftTransactionsByIDs(draftTransactionIDs, true);
            navigateToConfirmationStep([{file, source, transactionID: initialTransactionID}], false, true);
        });
    }

    /**
     * Processes receipt files and navigates to confirmation step
     */
    function processReceipts(files: FileObject[], getFileSource: (file: FileObject) => string) {
        if (files.length === 0) {
            return;
        }
        // Store the receipt on the transaction object in Onyx
        const newReceiptFiles: ReceiptFile[] = [];

        if (isEditing) {
            const file = files.at(0);
            if (!file) {
                return;
            }
            const source = getFileSource(file);
            setMoneyRequestReceipt(initialTransactionID, source, file.name ?? '', !isEditing, file.type);
            updateScanAndNavigate(file, source);
            return;
        }

        if (!isMultiScanEnabled && isStartingScan) {
            removeDraftTransactionsByIDs(draftTransactionIDs, true);
        }

        for (const [index, file] of files.entries()) {
            const source = getFileSource(file);
            const transaction = shouldReuseInitialTransaction(initialTransaction, shouldAcceptMultipleFiles, index, isMultiScanEnabled, transactions)
                ? (initialTransaction as Partial<Transaction>)
                : buildOptimisticTransactionAndCreateDraft({
                      initialTransaction: initialTransaction as Partial<Transaction>,
                      currentUserPersonalDetails,
                      reportID,
                  });

            const transactionID = transaction.transactionID ?? initialTransactionID;
            newReceiptFiles.push({file, source, transactionID});
            setMoneyRequestReceipt(transactionID, source, file.name ?? '', true, file.type);
        }

        if (shouldSkipConfirmation) {
            setReceiptFiles(newReceiptFiles);
            const gpsRequired = initialTransaction?.amount === 0 && iouType !== CONST.IOU.TYPE.SPLIT && files.length;
            if (gpsRequired) {
                if (shouldStartLocationPermissionFlow) {
                    setStartLocationPermissionFlow(true);
                    return;
                }
                navigateToConfirmationStep(newReceiptFiles, true);
                return;
            }
        }
        navigateToConfirmationStep(newReceiptFiles, false);
    }

    const {validateFiles, PDFValidationComponent, ErrorModal} = useFilesValidation((files: FileObject[]) => {
        processReceipts(files, getSource);
    });
    return {
        transactions,
        isMultiScanEnabled,
        setIsMultiScanEnabled,
        isStartingScan,
        isEditing,
        isReplacingReceipt,
        shouldAcceptMultipleFiles,
        shouldSkipConfirmation,
        startLocationPermissionFlow,
        setStartLocationPermissionFlow,
        shouldStartLocationPermissionFlow,
        receiptFiles,
        setReceiptFiles,
        navigateToConfirmationStep,
        validateFiles,
        PDFValidationComponent,
        ErrorModal,
        setTestReceiptAndNavigate,
    };
}

export default useReceiptScan;
export type {UseReceiptScanParams};
