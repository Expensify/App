import {hasSeenTourSelector} from '@selectors/Onboarding';
import {useEffect, useState} from 'react';
import {InteractionManager} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {useAnimatedStyle, useSharedValue, withTiming} from 'react-native-reanimated';
import TestReceipt from '@assets/images/fake-receipt.png';
import useDefaultExpensePolicy from '@hooks/useDefaultExpensePolicy';
import useFilesValidation from '@hooks/useFilesValidation';
import useOnyx from '@hooks/useOnyx';
import useOptimisticDraftTransactions from '@hooks/useOptimisticDraftTransactions';
import usePermissions from '@hooks/usePermissions';
import usePersonalPolicy from '@hooks/usePersonalPolicy';
import usePolicy from '@hooks/usePolicy';
import usePolicyForMovingExpenses from '@hooks/usePolicyForMovingExpenses';
import useReportAttributes from '@hooks/useReportAttributes';
import useSelfDMReport from '@hooks/useSelfDMReport';
import {handleMoneyRequestStepScanParticipants} from '@libs/actions/IOU/MoneyRequest';
import setTestReceipt from '@libs/actions/setTestReceipt';
import {dismissProductTraining} from '@libs/actions/Welcome';
import DateUtils from '@libs/DateUtils';
import HapticFeedback from '@libs/HapticFeedback';
import {isArchivedReport, isPolicyExpenseChat} from '@libs/ReportUtils';
import {getDefaultTaxCode, hasReceipt, shouldReuseInitialTransaction} from '@libs/TransactionUtils';
import {setMoneyRequestReceipt} from '@userActions/IOU';
import {buildOptimisticTransactionAndCreateDraft, removeDraftTransactions, removeTransactionReceipt} from '@userActions/TransactionEdit';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type Transaction from '@src/types/onyx/Transaction';
import type {FileObject} from '@src/types/utils/Attachment';
import type {ReceiptFile, UseReceiptScanParams} from './types';

/**
 * Selector to derive whether we should start the location permission flow from the last prompt timestamp.
 * Returns true when the user has never been prompted, or when the last prompt was more than LOCATION_PERMISSION_PROMPT_THRESHOLD_DAYS ago.
 */
function shouldStartLocationPermissionFlowSelector(lastLocationPermissionPrompt: OnyxEntry<string>): boolean {
    return (
        !lastLocationPermissionPrompt ||
        (DateUtils.isValidDateString(lastLocationPermissionPrompt ?? '') &&
            DateUtils.getDifferenceInDaysFromNow(new Date(lastLocationPermissionPrompt ?? '')) > CONST.IOU.LOCATION_PERMISSION_PROMPT_THRESHOLD_DAYS)
    );
}

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
    isMultiScanEnabled = false,
    isStartingScan = false,
    updateScanAndNavigate,
    getSource,
    setIsMultiScanEnabled,
}: UseReceiptScanParams) {
    const {isBetaEnabled} = usePermissions();
    const [shouldStartLocationPermissionFlow] = useOnyx(ONYXKEYS.NVP_LAST_LOCATION_PERMISSION_PROMPT, {
        canBeMissing: true,
        selector: shouldStartLocationPermissionFlowSelector,
    });

    const policy = usePolicy(report?.policyID);
    const {policyForMovingExpenses} = usePolicyForMovingExpenses();
    const personalPolicy = usePersonalPolicy();
    const defaultExpensePolicy = useDefaultExpensePolicy();
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {canBeMissing: false});
    const [skipConfirmation] = useOnyx(`${ONYXKEYS.COLLECTION.SKIP_CONFIRMATION}${initialTransactionID}`, {canBeMissing: true});
    const [dismissedProductTraining] = useOnyx(ONYXKEYS.NVP_DISMISSED_PRODUCT_TRAINING, {canBeMissing: true});
    const [reportNameValuePairs] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${report?.reportID}`, {canBeMissing: true});
    const [quickAction] = useOnyx(ONYXKEYS.NVP_QUICK_ACTION_GLOBAL_CREATE, {canBeMissing: true});
    const reportAttributesDerived = useReportAttributes();
    const [policyRecentlyUsedCurrencies] = useOnyx(ONYXKEYS.RECENTLY_USED_CURRENCIES, {canBeMissing: true});
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED, {canBeMissing: true});
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID, {canBeMissing: true});
    const [isSelfTourViewed = false] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {canBeMissing: true, selector: hasSeenTourSelector});
    const [betas] = useOnyx(ONYXKEYS.BETAS, {canBeMissing: true});
    const [transactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS, {canBeMissing: true});
    const [transactions, optimisticTransactions] = useOptimisticDraftTransactions(initialTransaction);
    const selfDMReport = useSelfDMReport();

    const isEditing = action === CONST.IOU.ACTION.EDIT;
    const canUseMultiScan = isStartingScan && iouType !== CONST.IOU.TYPE.SPLIT;
    const isArchived = isArchivedReport(reportNameValuePairs);
    const isReplacingReceipt = (isEditing && hasReceipt(initialTransaction)) || (!!initialTransaction?.receipt && !!backTo);
    const shouldAcceptMultipleFiles = !isEditing && !backTo;
    const shouldGenerateTransactionThreadReport = !isBetaEnabled(CONST.BETAS.NO_OPTIMISTIC_TRANSACTION_THREADS);
    const isASAPSubmitBetaEnabled = isBetaEnabled(CONST.BETAS.ASAP_SUBMIT);

    const defaultTaxCode = getDefaultTaxCode(policy, initialTransaction);
    const transactionTaxCode = (initialTransaction?.taxCode ? initialTransaction?.taxCode : defaultTaxCode) ?? '';
    const transactionTaxAmount = initialTransaction?.taxAmount ?? 0;

    // For quick button actions, we'll skip the confirmation page unless the report is archived or this is a workspace
    // request and the workspace requires a category or a tag
    const shouldSkipConfirmation =
        !!skipConfirmation && !!report?.reportID && !isArchived && !(isPolicyExpenseChat(report) && ((policy?.requiresCategory ?? false) || (policy?.requiresTag ?? false)));

    const [startLocationPermissionFlow, setStartLocationPermissionFlow] = useState(false);
    const [receiptFiles, setReceiptFiles] = useState<ReceiptFile[]>([]);
    const [shouldShowMultiScanEducationalPopup, setShouldShowMultiScanEducationalPopup] = useState(false);

    // Clear receipt files when multi-scan is disabled
    useEffect(() => {
        if (isMultiScanEnabled) {
            return;
        }
        setReceiptFiles([]);
    }, [isMultiScanEnabled]);

    const blinkOpacity = useSharedValue(0);
    const blinkStyle = useAnimatedStyle(() => ({
        opacity: blinkOpacity.get(),
    }));

    function showBlink() {
        blinkOpacity.set(
            withTiming(0.4, {duration: 10}, () => {
                blinkOpacity.set(withTiming(0, {duration: 50}));
            }),
        );
        HapticFeedback.press();
    }

    function navigateToConfirmationStep(files: ReceiptFile[], locationPermissionGranted = false, isTestTransaction = false) {
        handleMoneyRequestStepScanParticipants({
            iouType,
            policy,
            report,
            reportID,
            reportAttributesDerived,
            transactions,
            initialTransaction: {
                transactionID: initialTransactionID,
                reportID: initialTransaction?.reportID,
                taxCode: transactionTaxCode,
                taxAmount: transactionTaxAmount,
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
            shouldGenerateTransactionThreadReport,
            isArchivedExpenseReport: isArchived,
            isAutoReporting: !!personalPolicy?.autoReporting,
            isASAPSubmitBetaEnabled,
            transactionViolations,
            quickAction,
            policyRecentlyUsedCurrencies,
            introSelected,
            activePolicyID,
            privateIsArchived: reportNameValuePairs?.private_isArchived,
            files,
            isTestTransaction,
            locationPermissionGranted,
            selfDMReport,
            policyForMovingExpenses,
            isSelfTourViewed,
            betas,
        });
    }

    function setTestReceiptAndNavigate() {
        setTestReceipt(TestReceipt, 'png', (source, file, filename) => {
            setMoneyRequestReceipt(initialTransactionID, source, filename, !isEditing, CONST.TEST_RECEIPT.FILE_TYPE, true);
            removeDraftTransactions(true);
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
            removeDraftTransactions(true);
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
            }
        }
        navigateToConfirmationStep(newReceiptFiles, false);
    }

    const {validateFiles, PDFValidationComponent, ErrorModal} = useFilesValidation((files: FileObject[]) => {
        processReceipts(files, getSource);
    });

    function submitReceipts(files: ReceiptFile[]) {
        if (shouldSkipConfirmation) {
            const gpsRequired = initialTransaction?.amount === 0 && iouType !== CONST.IOU.TYPE.SPLIT;
            if (gpsRequired) {
                if (shouldStartLocationPermissionFlow) {
                    setStartLocationPermissionFlow(true);
                    return;
                }
            }
        }
        navigateToConfirmationStep(files, false);
    }

    function submitMultiScanReceipts() {
        const transactionIDs = new Set(optimisticTransactions?.map((transaction) => transaction?.transactionID));
        const validReceiptFiles = receiptFiles.filter((receiptFile) => transactionIDs.has(receiptFile.transactionID));
        submitReceipts(validReceiptFiles);
    }

    function toggleMultiScan() {
        if (!dismissedProductTraining?.[CONST.PRODUCT_TRAINING_TOOLTIP_NAMES.MULTI_SCAN_EDUCATIONAL_MODAL]) {
            setShouldShowMultiScanEducationalPopup(true);
        }
        removeTransactionReceipt(CONST.IOU.OPTIMISTIC_TRANSACTION_ID);
        removeDraftTransactions(true);
        setIsMultiScanEnabled?.(!isMultiScanEnabled);
    }

    function dismissMultiScanEducationalPopup() {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        InteractionManager.runAfterInteractions(() => {
            dismissProductTraining(CONST.PRODUCT_TRAINING_TOOLTIP_NAMES.MULTI_SCAN_EDUCATIONAL_MODAL);
            setShouldShowMultiScanEducationalPopup(false);
        });
    }

    return {
        transactions,
        isEditing,
        canUseMultiScan,
        isReplacingReceipt,
        shouldAcceptMultipleFiles,
        startLocationPermissionFlow,
        setStartLocationPermissionFlow,
        shouldStartLocationPermissionFlow,
        receiptFiles,
        setReceiptFiles,
        shouldShowMultiScanEducationalPopup,
        navigateToConfirmationStep,
        validateFiles,
        PDFValidationComponent,
        ErrorModal,
        submitReceipts,
        submitMultiScanReceipts,
        toggleMultiScan,
        dismissMultiScanEducationalPopup,
        blinkStyle,
        showBlink,
        setTestReceiptAndNavigate,
    };
}

export default useReceiptScan;
export type {UseReceiptScanParams};
