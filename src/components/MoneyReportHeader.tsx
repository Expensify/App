import {useRoute} from '@react-navigation/native';
import {isUserValidatedSelector} from '@selectors/Account';
import {getArchiveReason} from '@selectors/Report';
import React, {useCallback, useContext, useEffect, useMemo, useRef, useState} from 'react';
import {InteractionManager, View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import useConfirmModal from '@hooks/useConfirmModal';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDefaultExpensePolicy from '@hooks/useDefaultExpensePolicy';
import useDeleteTransactions from '@hooks/useDeleteTransactions';
import useDuplicateTransactionsAndViolations from '@hooks/useDuplicateTransactionsAndViolations';
import useGetIOUReportFromReportAction from '@hooks/useGetIOUReportFromReportAction';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLoadingBarVisibility from '@hooks/useLoadingBarVisibility';
import useLocalize from '@hooks/useLocalize';
import useMobileSelectionMode from '@hooks/useMobileSelectionMode';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useParticipantsInvoiceReport from '@hooks/useParticipantsInvoiceReport';
import usePaymentAnimations from '@hooks/usePaymentAnimations';
import usePaymentOptions from '@hooks/usePaymentOptions';
import usePermissions from '@hooks/usePermissions';
import usePolicy from '@hooks/usePolicy';
import useReportIsArchived from '@hooks/useReportIsArchived';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useResponsiveLayoutOnWideRHP from '@hooks/useResponsiveLayoutOnWideRHP';
import useSearchShouldCalculateTotals from '@hooks/useSearchShouldCalculateTotals';
import useSelectedTransactionsActions from '@hooks/useSelectedTransactionsActions';
import useStrictPolicyRules from '@hooks/useStrictPolicyRules';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useThrottledButtonState from '@hooks/useThrottledButtonState';
import useTransactionsAndViolationsForReport from '@hooks/useTransactionsAndViolationsForReport';
import useTransactionViolations from '@hooks/useTransactionViolations';
import {duplicateExpenseTransaction as duplicateTransactionAction} from '@libs/actions/IOU/Duplicate';
import {openOldDotLink} from '@libs/actions/Link';
import {setupMergeTransactionDataAndNavigate} from '@libs/actions/MergeTransaction';
import {turnOffMobileSelectionMode} from '@libs/actions/MobileSelectionMode';
import {createTransactionThreadReport, deleteAppReport, downloadReportPDF, exportReportToCSV, exportReportToPDF, exportToIntegration, markAsManuallyExported} from '@libs/actions/Report';
import {getExportTemplates, queueExportSearchWithTemplate, search} from '@libs/actions/Search';
import {setNameValuePair} from '@libs/actions/User';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import getPlatform from '@libs/getPlatform';
import Log from '@libs/Log';
import {getThreadReportIDsForTransactions, getTotalAmountForIOUReportPreviewButton} from '@libs/MoneyRequestReportUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {ReportsSplitNavigatorParamList, RightModalNavigatorParamList} from '@libs/Navigation/types';
import {
    buildOptimisticNextStepForDEWOfflineSubmission,
    buildOptimisticNextStepForDynamicExternalWorkflowError,
    buildOptimisticNextStepForPreventSelfApprovalsEnabled,
    buildOptimisticNextStepForStrictPolicyRuleViolations,
} from '@libs/NextStepUtils';
import type {KYCFlowEvent, TriggerKYCFlow} from '@libs/PaymentUtils';
import {selectPaymentType} from '@libs/PaymentUtils';
import {getConnectedIntegration, getValidConnectedIntegration, hasDynamicExternalWorkflow} from '@libs/PolicyUtils';
import {getIOUActionForReportID, getOriginalMessage, getReportAction, hasPendingDEWSubmit, isMoneyRequestAction} from '@libs/ReportActionsUtils';
import {getAllExpensesToHoldIfApplicable, getReportPrimaryAction, isMarkAsResolvedAction} from '@libs/ReportPrimaryActionUtils';
import {getSecondaryExportReportActions, getSecondaryReportActions} from '@libs/ReportSecondaryActionUtils';
import {
    changeMoneyRequestHoldStatus,
    generateReportID,
    getAddExpenseDropdownOptions,
    getAllReportActionsErrorsAndReportActionThatRequiresAttention,
    getIntegrationExportIcon,
    getIntegrationNameFromExportMessage as getIntegrationNameFromExportMessageUtils,
    getNextApproverAccountID,
    getNonHeldAndFullAmount,
    getPolicyExpenseChat,
    getTransactionsWithReceipts,
    hasHeldExpenses as hasHeldExpensesReportUtils,
    hasOnlyHeldExpenses as hasOnlyHeldExpensesReportUtils,
    hasUpdatedTotal,
    hasViolations as hasViolationsReportUtils,
    isAllowedToApproveExpenseReport,
    isCurrentUserSubmitter,
    isDM,
    isExported as isExportedUtils,
    isInvoiceReport as isInvoiceReportUtil,
    isOpenExpenseReport,
    isProcessingReport,
    isReportOwner,
    navigateOnDeleteExpense,
    navigateToDetailsPage,
    rejectMoneyRequestReason,
    shouldBlockSubmitDueToStrictPolicyRules,
} from '@libs/ReportUtils';
import {shouldRestrictUserBillableActions} from '@libs/SubscriptionUtils';
import {
    allHavePendingRTERViolation,
    getOriginalTransactionWithSplitInfo,
    hasCustomUnitOutOfPolicyViolation as hasCustomUnitOutOfPolicyViolationTransactionUtils,
    hasDuplicateTransactions,
    isDuplicate,
    isExpensifyCardTransaction,
    isPayAtEndExpense as isPayAtEndExpenseTransactionUtils,
    isPending,
    isPerDiemRequest,
    isScanning,
    shouldShowBrokenConnectionViolationForMultipleTransactions,
} from '@libs/TransactionUtils';
import type {ExportType} from '@pages/home/report/ReportDetailsExportPage';
import variables from '@styles/variables';
import {
    approveMoneyRequest,
    canApproveIOU,
    cancelPayment,
    canIOUBePaid as canIOUBePaidAction,
    dismissRejectUseExplanation,
    getNavigationUrlOnMoneyRequestDelete,
    initSplitExpense,
    markRejectViolationAsResolved,
    payInvoice,
    payMoneyRequest,
    reopenReport,
    retractReport,
    startMoneyRequest,
    submitReport,
    unapproveExpenseReport,
} from '@userActions/IOU';
import {markAsCash as markAsCashAction} from '@userActions/Transaction';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type * as OnyxTypes from '@src/types/onyx';
import type {PaymentMethodType} from '@src/types/onyx/OriginalMessage';
import type IconAsset from '@src/types/utils/IconAsset';
import ActivityIndicator from './ActivityIndicator';
import AnimatedSubmitButton from './AnimatedSubmitButton';
import BrokenConnectionDescription from './BrokenConnectionDescription';
import Button from './Button';
import ButtonWithDropdownMenu from './ButtonWithDropdownMenu';
import type {DropdownOption} from './ButtonWithDropdownMenu/types';
import ConfirmModal from './ConfirmModal';
import DecisionModal from './DecisionModal';
import {DelegateNoAccessContext} from './DelegateNoAccessModalProvider';
import Header from './Header';
import HeaderWithBackButton from './HeaderWithBackButton';
import HoldOrRejectEducationalModal from './HoldOrRejectEducationalModal';
import HoldSubmitterEducationalModal from './HoldSubmitterEducationalModal';
import Icon from './Icon';
import {KYCWallContext} from './KYCWall/KYCWallContext';
import type {PaymentMethod} from './KYCWall/types';
import LoadingBar from './LoadingBar';
import Modal from './Modal';
import {ModalActions} from './Modal/Global/ModalContext';
import MoneyReportHeaderKYCDropdown from './MoneyReportHeaderKYCDropdown';
import MoneyReportHeaderStatusBar from './MoneyReportHeaderStatusBar';
import MoneyReportHeaderStatusBarSkeleton from './MoneyReportHeaderStatusBarSkeleton';
import type {MoneyRequestHeaderStatusBarProps} from './MoneyRequestHeaderStatusBar';
import MoneyRequestHeaderStatusBar from './MoneyRequestHeaderStatusBar';
import MoneyRequestReportNavigation from './MoneyRequestReportView/MoneyRequestReportNavigation';
import type {PopoverMenuItem} from './PopoverMenu';
import {PressableWithFeedback} from './Pressable';
import type {ActionHandledType} from './ProcessMoneyReportHoldMenu';
import ProcessMoneyReportHoldMenu from './ProcessMoneyReportHoldMenu';
import {useSearchContext} from './Search/SearchContext';
import AnimatedSettlementButton from './SettlementButton/AnimatedSettlementButton';
import Text from './Text';

type MoneyReportHeaderProps = {
    /** The report currently being looked at */
    report: OnyxEntry<OnyxTypes.Report>;

    /** The policy tied to the expense report */
    policy: OnyxEntry<OnyxTypes.Policy>;

    /** Array of report actions for the report */
    reportActions: OnyxTypes.ReportAction[];

    /** The reportID of the transaction thread report associated with this current report, if any */
    // eslint-disable-next-line react/no-unused-prop-types
    transactionThreadReportID: string | undefined;

    /** whether we are loading report data in openReport command */
    isLoadingInitialReportActions?: boolean;

    /** Whether back button should be displayed in header */
    shouldDisplayBackButton?: boolean;

    /** Method to trigger when pressing close button of the header */
    onBackButtonPress: () => void;
};

function MoneyReportHeader({
    policy,
    report: moneyRequestReport,
    transactionThreadReportID,
    reportActions,
    isLoadingInitialReportActions,
    shouldDisplayBackButton = false,
    onBackButtonPress,
}: MoneyReportHeaderProps) {
    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout to use a correct layout for the hold expense modal https://github.com/Expensify/App/pull/47990#issuecomment-2362382026
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {shouldUseNarrowLayout, isSmallScreenWidth, isMediumScreenWidth} = useResponsiveLayout();
    const shouldDisplayNarrowVersion = shouldUseNarrowLayout || isMediumScreenWidth;
    const route = useRoute<
        | PlatformStackRouteProp<ReportsSplitNavigatorParamList, typeof SCREENS.REPORT>
        | PlatformStackRouteProp<RightModalNavigatorParamList, typeof SCREENS.RIGHT_MODAL.EXPENSE_REPORT>
        | PlatformStackRouteProp<RightModalNavigatorParamList, typeof SCREENS.RIGHT_MODAL.SEARCH_MONEY_REQUEST_REPORT>
        | PlatformStackRouteProp<RightModalNavigatorParamList, typeof SCREENS.RIGHT_MODAL.SEARCH_REPORT>
    >();
    const {login: currentUserLogin, accountID, email} = useCurrentUserPersonalDetails();
    const defaultExpensePolicy = useDefaultExpensePolicy();
    const activePolicyExpenseChat = getPolicyExpenseChat(accountID, defaultExpensePolicy?.id);
    const [chatReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${moneyRequestReport?.chatReportID}`, {canBeMissing: true});
    const [nextStep] = useOnyx(`${ONYXKEYS.COLLECTION.NEXT_STEP}${moneyRequestReport?.reportID}`, {canBeMissing: true});
    const [isUserValidated] = useOnyx(ONYXKEYS.ACCOUNT, {selector: isUserValidatedSelector, canBeMissing: true});
    const [transactionThreadReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReportID}`, {canBeMissing: true});
    const [reportPDFFilename] = useOnyx(`${ONYXKEYS.COLLECTION.NVP_EXPENSIFY_REPORT_PDF_FILENAME}${moneyRequestReport?.reportID}`, {canBeMissing: true}) ?? null;
    const [session] = useOnyx(ONYXKEYS.SESSION, {canBeMissing: false});
    const [bankAccountList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST, {canBeMissing: true});
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID, {canBeMissing: true});
    const activePolicy = usePolicy(activePolicyID);
    const [integrationsExportTemplates] = useOnyx(ONYXKEYS.NVP_INTEGRATION_SERVER_EXPORT_TEMPLATES, {canBeMissing: true});
    const [csvExportLayouts] = useOnyx(ONYXKEYS.NVP_CSV_EXPORT_LAYOUTS, {canBeMissing: true});
    const expensifyIcons = useMemoizedLazyExpensifyIcons([
        'Buildings',
        'Plus',
        'Hourglass',
        'Cash',
        'Box',
        'Stopwatch',
        'Flag',
        'CreditCardHourglass',
        'Send',
        'Clear',
        'ReceiptScan',
        'ThumbsUp',
        'CircularArrowBackwards',
        'ArrowSplit',
        'ArrowCollapse',
        'Workflows',
        'Trashcan',
        'ArrowRight',
        'ThumbsDown',
        'Table',
        'Info',
        'Export',
        'Document',
        'XeroExport',
        'QBOExport',
        'NetSuiteExport',
        'SageIntacctExport',
        'Feed',
        'Close',
        'Location',
        'CheckmarkCircle',
        'ReceiptMultiple',
        'ReceiptPlus',
    ] as const);
    const [lastDistanceExpenseType] = useOnyx(ONYXKEYS.NVP_LAST_DISTANCE_EXPENSE_TYPE, {canBeMissing: true});
    const [reportMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${moneyRequestReport?.reportID}`, {canBeMissing: true});
    const {translate, localeCompare} = useLocalize();

    const exportTemplates = useMemo(
        () => getExportTemplates(integrationsExportTemplates ?? [], csvExportLayouts ?? {}, translate, policy),
        [integrationsExportTemplates, csvExportLayouts, policy, translate],
    );
    const {areStrictPolicyRulesEnabled} = useStrictPolicyRules();
    const [allTransactions] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION, {canBeMissing: false});
    const [allReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {canBeMissing: false});
    const [allPolicyCategories] = useOnyx(ONYXKEYS.COLLECTION.POLICY_CATEGORIES, {canBeMissing: false});

    const requestParentReportAction = useMemo(() => {
        if (!reportActions || !transactionThreadReport?.parentReportActionID) {
            return null;
        }
        return reportActions.find((action): action is OnyxTypes.ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU> => action.reportActionID === transactionThreadReport.parentReportActionID);
    }, [reportActions, transactionThreadReport?.parentReportActionID]);

    const {iouReport, chatReport: chatIOUReport, isChatIOUReportArchived} = useGetIOUReportFromReportAction(requestParentReportAction);

    const {transactions: reportTransactions, violations} = useTransactionsAndViolationsForReport(moneyRequestReport?.reportID);

    const transactions = useMemo(() => {
        return Object.values(reportTransactions);
    }, [reportTransactions]);

    // When prevent self-approval is enabled & the current user is submitter AND they're submitting to themselves, we need to show the optimistic next step
    // We should always show this optimistic message for policies with preventSelfApproval
    // to avoid any flicker during transitions between online/offline states
    const nextApproverAccountID = getNextApproverAccountID(moneyRequestReport);
    const isSubmitterSameAsNextApprover =
        isReportOwner(moneyRequestReport) && (nextApproverAccountID === moneyRequestReport?.ownerAccountID || moneyRequestReport?.managerID === moneyRequestReport?.ownerAccountID);
    const isBlockSubmitDueToPreventSelfApproval = isSubmitterSameAsNextApprover && policy?.preventSelfApproval;
    const isBlockSubmitDueToStrictPolicyRules = useMemo(() => {
        return shouldBlockSubmitDueToStrictPolicyRules(moneyRequestReport?.reportID, violations, areStrictPolicyRulesEnabled, accountID, email ?? '', transactions);
    }, [moneyRequestReport?.reportID, violations, areStrictPolicyRulesEnabled, accountID, email, transactions]);
    const shouldBlockSubmit = isBlockSubmitDueToStrictPolicyRules || isBlockSubmitDueToPreventSelfApproval;

    const iouTransactionID = isMoneyRequestAction(requestParentReportAction) ? getOriginalMessage(requestParentReportAction)?.IOUTransactionID : undefined;
    const [transaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${getNonEmptyStringOnyxID(iouTransactionID)}`, {
        canBeMissing: true,
    });

    const [dismissedRejectUseExplanation] = useOnyx(ONYXKEYS.NVP_DISMISSED_REJECT_USE_EXPLANATION, {canBeMissing: true});
    const [dismissedHoldUseExplanation] = useOnyx(ONYXKEYS.NVP_DISMISSED_HOLD_USE_EXPLANATION, {canBeMissing: true});

    const [invoiceReceiverPolicy] = useOnyx(
        `${ONYXKEYS.COLLECTION.POLICY}${chatReport?.invoiceReceiver && 'policyID' in chatReport.invoiceReceiver ? chatReport.invoiceReceiver.policyID : undefined}`,
        {canBeMissing: true},
    );

    const {duplicateTransactions, duplicateTransactionViolations} = useDuplicateTransactionsAndViolations(transactions.map((t) => t.transactionID));
    const {deleteTransactions} = useDeleteTransactions({report: chatReport, reportActions, policy});
    const isExported = useMemo(() => isExportedUtils(reportActions), [reportActions]);
    // wrapped in useMemo to improve performance because this is an operation on array
    const integrationNameFromExportMessage = useMemo(() => {
        if (!isExported) {
            return null;
        }
        return getIntegrationNameFromExportMessageUtils(reportActions);
    }, [isExported, reportActions]);

    const transactionViolations = useTransactionViolations(transaction?.transactionID);
    const [downloadErrorModalVisible, setDownloadErrorModalVisible] = useState(false);
    const [isPDFModalVisible, setIsPDFModalVisible] = useState(false);
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED, {canBeMissing: true});
    const currentTransaction = transactions.at(0);
    const [originalIOUTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${getNonEmptyStringOnyxID(currentTransaction?.comment?.originalTransactionID)}`, {canBeMissing: true});
    const [originalTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${getNonEmptyStringOnyxID(transaction?.comment?.originalTransactionID)}`, {canBeMissing: true});
    const [allTransactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS, {canBeMissing: true});
    const {isBetaEnabled} = usePermissions();
    const isASAPSubmitBetaEnabled = isBetaEnabled(CONST.BETAS.ASAP_SUBMIT);
    const isDEWBetaEnabled = isBetaEnabled(CONST.BETAS.NEW_DOT_DEW);
    const hasViolations = hasViolationsReportUtils(moneyRequestReport?.reportID, allTransactionViolations, accountID, email ?? '');
    const hasCustomUnitOutOfPolicyViolation = hasCustomUnitOutOfPolicyViolationTransactionUtils(transactionViolations);
    const isNonDefaultWorkspacePerDiemRequest = isPerDiemRequest(transaction) && defaultExpensePolicy?.id !== policy?.id;

    const [exportModalStatus, setExportModalStatus] = useState<ExportType | null>(null);
    const {showConfirmModal} = useConfirmModal();
    const {isPaidAnimationRunning, isApprovedAnimationRunning, isSubmittingAnimationRunning, startAnimation, stopAnimation, startApprovedAnimation, startSubmittingAnimation} =
        usePaymentAnimations();
    const styles = useThemeStyles();
    const theme = useTheme();
    const {isOffline} = useNetwork();
    const {isExpenseSplit} = getOriginalTransactionWithSplitInfo(transaction, originalTransaction);

    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {canBeMissing: true});
    const [isDuplicateActive, temporarilyDisableDuplicateAction] = useThrottledButtonState();
    const [isHoldMenuVisible, setIsHoldMenuVisible] = useState(false);
    const [paymentType, setPaymentType] = useState<PaymentMethodType>();
    const [requestType, setRequestType] = useState<ActionHandledType>();
    const canAllowSettlement = hasUpdatedTotal(moneyRequestReport, policy);
    const policyType = policy?.type;
    const connectedIntegration = getValidConnectedIntegration(policy);
    const connectedIntegrationFallback = getConnectedIntegration(policy);
    const hasScanningReceipt = getTransactionsWithReceipts(moneyRequestReport?.reportID).some((t) => isScanning(t));
    const hasOnlyPendingTransactions = useMemo(() => {
        return !!transactions && transactions.length > 0 && transactions.every((t) => isExpensifyCardTransaction(t) && isPending(t));
    }, [transactions]);
    const transactionIDs = useMemo(() => transactions?.map((t) => t.transactionID) ?? [], [transactions]);
    // eslint-disable-next-line rulesdir/no-negated-variables
    const canTriggerAutomaticPDFDownload = useRef(false);
    const hasFinishedPDFDownload = reportPDFFilename && reportPDFFilename !== CONST.REPORT_DETAILS_MENU_ITEM.ERROR;

    const [quickAction] = useOnyx(ONYXKEYS.NVP_QUICK_ACTION_GLOBAL_CREATE, {canBeMissing: true});

    useEffect(() => {
        canTriggerAutomaticPDFDownload.current = isPDFModalVisible;
    }, [isPDFModalVisible]);

    const messagePDF = useMemo(() => {
        if (reportPDFFilename === CONST.REPORT_DETAILS_MENU_ITEM.ERROR) {
            return translate('reportDetailsPage.errorPDF');
        }
        if (!hasFinishedPDFDownload) {
            return translate('reportDetailsPage.waitForPDF');
        }
        return translate('reportDetailsPage.successPDF');
    }, [reportPDFFilename, hasFinishedPDFDownload, translate]);

    // Check if there is pending rter violation in all transactionViolations with given transactionIDs.
    // wrapped in useMemo to avoid unnecessary re-renders and for better performance (array operation inside of function)
    const hasAllPendingRTERViolations = useMemo(
        () => allHavePendingRTERViolation(transactions, violations, email ?? '', accountID, moneyRequestReport, policy),
        [transactions, violations, email, accountID, moneyRequestReport, policy],
    );
    // Check if user should see broken connection violation warning.
    const shouldShowBrokenConnectionViolation = shouldShowBrokenConnectionViolationForMultipleTransactions(transactions, moneyRequestReport, policy, violations, email ?? '', accountID);
    const hasOnlyHeldExpenses = hasOnlyHeldExpensesReportUtils(moneyRequestReport?.reportID);
    const isPayAtEndExpense = isPayAtEndExpenseTransactionUtils(transaction);
    const isArchivedReport = useReportIsArchived(moneyRequestReport?.reportID);
    const isChatReportArchived = useReportIsArchived(chatReport?.reportID);

    const [archiveReason] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${moneyRequestReport?.reportID}`, {selector: getArchiveReason, canBeMissing: true});

    const [reportNameValuePairs] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${moneyRequestReport?.reportID}`, {canBeMissing: true});
    const getCanIOUBePaid = useCallback(
        (onlyShowPayElsewhere = false) => canIOUBePaidAction(moneyRequestReport, chatReport, policy, bankAccountList, transaction ? [transaction] : undefined, onlyShowPayElsewhere),
        [moneyRequestReport, chatReport, policy, bankAccountList, transaction],
    );

    const isInvoiceReport = isInvoiceReportUtil(moneyRequestReport);

    const [isDownloadErrorModalVisible, setIsDownloadErrorModalVisible] = useState(false);
    const [isHoldEducationalModalVisible, setIsHoldEducationalModalVisible] = useState(false);
    const [duplicateDistanceErrorModalVisible, setDuplicateDistanceErrorModalVisible] = useState(false);
    const [duplicatePerDiemErrorModalVisible, setDuplicatePerDiemErrorModalVisible] = useState(false);
    const [rejectModalAction, setRejectModalAction] = useState<ValueOf<
        typeof CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS.HOLD | typeof CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS.REJECT | typeof CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS.REJECT_BULK
    > | null>(null);

    const {selectedTransactionIDs, removeTransaction, clearSelectedTransactions, currentSearchQueryJSON, currentSearchKey, currentSearchHash, currentSearchResults} = useSearchContext();
    const shouldCalculateTotals = useSearchShouldCalculateTotals(currentSearchKey, currentSearchQueryJSON?.similarSearchHash, true);

    const [network] = useOnyx(ONYXKEYS.NETWORK, {canBeMissing: true});

    const {isWideRHPDisplayedOnWideLayout, isSuperWideRHPDisplayedOnWideLayout} = useResponsiveLayoutOnWideRHP();

    const shouldDisplayNarrowMoreButton = !shouldDisplayNarrowVersion || isWideRHPDisplayedOnWideLayout || isSuperWideRHPDisplayedOnWideLayout;

    const showExportProgressModal = useCallback(() => {
        return showConfirmModal({
            title: translate('export.exportInProgress'),
            prompt: translate('export.conciergeWillSend'),
            confirmText: translate('common.buttonConfirm'),
            shouldShowCancelButton: false,
        });
    }, [showConfirmModal, translate]);

    const beginExportWithTemplate = useCallback(
        (templateName: string, templateType: string, transactionIDList: string[], policyID?: string) => {
            if (!moneyRequestReport) {
                return;
            }

            showExportProgressModal().then((result) => {
                if (result.action !== ModalActions.CONFIRM) {
                    return;
                }
                clearSelectedTransactions(undefined, true);
            });
            queueExportSearchWithTemplate({
                templateName,
                templateType,
                jsonQuery: '{}',
                reportIDList: [moneyRequestReport.reportID],
                transactionIDList,
                policyID,
            });
        },
        [moneyRequestReport, showExportProgressModal, clearSelectedTransactions],
    );

    const [offlineModalVisible, setOfflineModalVisible] = useState(false);
    const isOnSearch = route.name.toLowerCase().startsWith('search');
    const {options: originalSelectedTransactionsOptions, handleDeleteTransactions} = useSelectedTransactionsActions({
        report: moneyRequestReport,
        reportActions,
        allTransactionsLength: transactions.length,
        session,
        onExportFailed: () => setIsDownloadErrorModalVisible(true),
        onExportOffline: () => setOfflineModalVisible(true),
        policy,
        beginExportWithTemplate: (templateName, templateType, transactionIDList, policyID) => beginExportWithTemplate(templateName, templateType, transactionIDList, policyID),
        isOnSearch,
    });

    const canIOUBePaid = useMemo(() => getCanIOUBePaid(), [getCanIOUBePaid]);
    const onlyShowPayElsewhere = useMemo(() => !canIOUBePaid && getCanIOUBePaid(true), [canIOUBePaid, getCanIOUBePaid]);

    const shouldShowPayButton = isPaidAnimationRunning || canIOUBePaid || onlyShowPayElsewhere;

    const shouldShowApproveButton = useMemo(
        () => (canApproveIOU(moneyRequestReport, policy, transactions) && !hasOnlyPendingTransactions) || isApprovedAnimationRunning,
        [moneyRequestReport, policy, transactions, hasOnlyPendingTransactions, isApprovedAnimationRunning],
    );

    const shouldDisableApproveButton = shouldShowApproveButton && !isAllowedToApproveExpenseReport(moneyRequestReport);

    const isFromPaidPolicy = policyType === CONST.POLICY.TYPE.TEAM || policyType === CONST.POLICY.TYPE.CORPORATE;

    const hasDuplicates = hasDuplicateTransactions(email ?? '', accountID, moneyRequestReport, policy, allTransactionViolations);
    const shouldShowMarkAsResolved = isMarkAsResolvedAction(moneyRequestReport, transactionViolations);
    const shouldShowStatusBar =
        hasAllPendingRTERViolations ||
        shouldShowBrokenConnectionViolation ||
        hasOnlyHeldExpenses ||
        hasScanningReceipt ||
        isPayAtEndExpense ||
        hasOnlyPendingTransactions ||
        hasDuplicates ||
        shouldShowMarkAsResolved;

    let optimisticNextStep = isBlockSubmitDueToPreventSelfApproval ? buildOptimisticNextStepForPreventSelfApprovalsEnabled() : nextStep;

    // Check for DEW submit failed or pending - show appropriate next step
    if (isDEWBetaEnabled && hasDynamicExternalWorkflow(policy) && moneyRequestReport?.statusNum === CONST.REPORT.STATUS_NUM.OPEN) {
        const reportActionsObject = reportActions.reduce<OnyxTypes.ReportActions>((acc, action) => {
            if (action.reportActionID) {
                acc[action.reportActionID] = action;
            }
            return acc;
        }, {});
        const {errors} = getAllReportActionsErrorsAndReportActionThatRequiresAttention(moneyRequestReport, reportActionsObject);
        if (errors?.dewSubmitFailed) {
            optimisticNextStep = buildOptimisticNextStepForDynamicExternalWorkflowError(theme.danger);
        } else if (isOffline && hasPendingDEWSubmit(reportMetadata, hasDynamicExternalWorkflow(policy))) {
            optimisticNextStep = buildOptimisticNextStepForDEWOfflineSubmission();
        }
    }

    if (isBlockSubmitDueToStrictPolicyRules && isReportOwner(moneyRequestReport) && isOpenExpenseReport(moneyRequestReport)) {
        optimisticNextStep = buildOptimisticNextStepForStrictPolicyRuleViolations();
    }

    const shouldShowNextStep = isFromPaidPolicy && !isInvoiceReport && !shouldShowStatusBar;
    const {nonHeldAmount, fullAmount, hasValidNonHeldAmount} = getNonHeldAndFullAmount(moneyRequestReport, shouldShowPayButton);
    const isAnyTransactionOnHold = hasHeldExpensesReportUtils(moneyRequestReport?.reportID);
    const {isDelegateAccessRestricted, showDelegateNoAccessModal} = useContext(DelegateNoAccessContext);
    const [policyRecentlyUsedCurrencies] = useOnyx(ONYXKEYS.RECENTLY_USED_CURRENCIES, {canBeMissing: true});
    const shouldShowLoadingBar = useLoadingBarVisibility();
    const kycWallRef = useContext(KYCWallContext);

    const isReportInRHP = route.name !== SCREENS.REPORT;
    const shouldDisplaySearchRouter = !isReportInRHP || isSmallScreenWidth;
    const isReportInSearch = route.name === SCREENS.RIGHT_MODAL.SEARCH_REPORT || route.name === SCREENS.RIGHT_MODAL.SEARCH_MONEY_REQUEST_REPORT;
    const isReportSubmitter = isCurrentUserSubmitter(chatIOUReport);
    const isChatReportDM = isDM(chatReport);

    const existingB2BInvoiceReport = useParticipantsInvoiceReport(activePolicyID, CONST.REPORT.INVOICE_RECEIVER_TYPE.BUSINESS, chatReport?.policyID);
    const confirmPayment = useCallback(
        (type?: PaymentMethodType | undefined, payAsBusiness?: boolean, methodID?: number, paymentMethod?: PaymentMethod) => {
            if (!type || !chatReport) {
                return;
            }
            setPaymentType(type);
            setRequestType(CONST.IOU.REPORT_ACTION_TYPE.PAY);
            if (isDelegateAccessRestricted) {
                showDelegateNoAccessModal();
            } else if (isAnyTransactionOnHold) {
                if (getPlatform() === CONST.PLATFORM.IOS) {
                    // eslint-disable-next-line @typescript-eslint/no-deprecated
                    InteractionManager.runAfterInteractions(() => setIsHoldMenuVisible(true));
                } else {
                    setIsHoldMenuVisible(true);
                }
            } else if (isInvoiceReport) {
                startAnimation();
                payInvoice({
                    paymentMethodType: type,
                    chatReport,
                    invoiceReport: moneyRequestReport,
                    invoiceReportCurrentNextStepDeprecated: nextStep,
                    introSelected,
                    currentUserAccountIDParam: accountID,
                    currentUserEmailParam: email ?? '',
                    payAsBusiness,
                    existingB2BInvoiceReport,
                    methodID,
                    paymentMethod,
                    activePolicy,
                });
            } else {
                startAnimation();
                payMoneyRequest(type, chatReport, moneyRequestReport, introSelected, nextStep, undefined, true, activePolicy, policy);
                if (currentSearchQueryJSON && !isOffline) {
                    search({
                        searchKey: currentSearchKey,
                        shouldCalculateTotals,
                        offset: 0,
                        queryJSON: currentSearchQueryJSON,
                        isOffline,
                        isLoading: !!currentSearchResults?.search?.isLoading,
                    });
                }
            }
        },
        [
            chatReport,
            isDelegateAccessRestricted,
            isAnyTransactionOnHold,
            isInvoiceReport,
            showDelegateNoAccessModal,
            startAnimation,
            moneyRequestReport,
            nextStep,
            introSelected,
            accountID,
            email,
            existingB2BInvoiceReport,
            activePolicy,
            policy,
            currentSearchQueryJSON,
            isOffline,
            currentSearchKey,
            shouldCalculateTotals,
            currentSearchResults?.search?.isLoading,
        ],
    );

    const showDWEModal = async () => {
        const result = await showConfirmModal({
            confirmText: translate('customApprovalWorkflow.goToExpensifyClassic'),
            title: translate('customApprovalWorkflow.title'),
            prompt: translate('customApprovalWorkflow.description'),
            shouldShowCancelButton: false,
        });

        if (result.action === ModalActions.CONFIRM) {
            openOldDotLink(CONST.OLDDOT_URLS.INBOX);
        }
    };

    const confirmApproval = () => {
        if (hasDynamicExternalWorkflow(policy)) {
            showDWEModal();
            return;
        }
        setRequestType(CONST.IOU.REPORT_ACTION_TYPE.APPROVE);
        if (isDelegateAccessRestricted) {
            showDelegateNoAccessModal();
        } else if (isAnyTransactionOnHold) {
            setIsHoldMenuVisible(true);
        } else {
            startApprovedAnimation();
            approveMoneyRequest(moneyRequestReport, policy, accountID, email ?? '', hasViolations, isASAPSubmitBetaEnabled, nextStep, true);
        }
    };

    const markAsCash = useCallback(() => {
        if (!requestParentReportAction) {
            return;
        }
        const reportID = transactionThreadReport?.reportID;

        if (!iouTransactionID || !reportID) {
            return;
        }
        markAsCashAction(iouTransactionID, reportID, transactionViolations);
    }, [iouTransactionID, requestParentReportAction, transactionThreadReport?.reportID, transactionViolations]);

    const duplicateExpenseTransaction = useCallback(
        (transactionList: OnyxTypes.Transaction[]) => {
            if (!transactionList.length) {
                return;
            }

            const optimisticChatReportID = generateReportID();
            const optimisticIOUReportID = generateReportID();
            const activePolicyCategories = allPolicyCategories?.[`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${defaultExpensePolicy?.id}`] ?? {};

            for (const item of transactionList) {
                duplicateTransactionAction({
                    transaction: item,
                    optimisticChatReportID,
                    optimisticIOUReportID,
                    isASAPSubmitBetaEnabled,
                    introSelected,
                    activePolicyID,
                    quickAction,
                    policyRecentlyUsedCurrencies: policyRecentlyUsedCurrencies ?? [],
                    customUnitPolicyID: policy?.id,
                    targetPolicy: defaultExpensePolicy ?? undefined,
                    targetPolicyCategories: activePolicyCategories,
                    targetReport: activePolicyExpenseChat,
                });
            }
        },
        [activePolicyExpenseChat, activePolicyID, allPolicyCategories, defaultExpensePolicy, introSelected, isASAPSubmitBetaEnabled, quickAction, policyRecentlyUsedCurrencies, policy?.id],
    );

    const getStatusIcon: (src: IconAsset) => React.ReactNode = (src) => (
        <Icon
            src={src}
            height={variables.iconSizeSmall}
            width={variables.iconSizeSmall}
            fill={theme.icon}
        />
    );

    const getStatusBarProps: () => MoneyRequestHeaderStatusBarProps | undefined = () => {
        if (shouldShowMarkAsResolved) {
            return {icon: getStatusIcon(expensifyIcons.Hourglass), description: translate('iou.reject.rejectedStatus')};
        }

        if (isPayAtEndExpense) {
            if (!isArchivedReport) {
                return {icon: getStatusIcon(expensifyIcons.Hourglass), description: translate('iou.bookingPendingDescription')};
            }
            if (isArchivedReport && archiveReason === CONST.REPORT.ARCHIVE_REASON.BOOKING_END_DATE_HAS_PASSED) {
                return {icon: getStatusIcon(expensifyIcons.Box), description: translate('iou.bookingArchivedDescription')};
            }
        }

        if (hasOnlyHeldExpenses) {
            return {icon: getStatusIcon(expensifyIcons.Stopwatch), description: translate(transactions.length > 1 ? 'iou.expensesOnHold' : 'iou.expenseOnHold')};
        }

        if (hasDuplicates) {
            return {icon: getStatusIcon(expensifyIcons.Flag), description: translate('iou.duplicateTransaction', isProcessingReport(moneyRequestReport))};
        }

        // Show the broken connection violation message only if it's part of transactionViolations (i.e., visible to the user).
        // This prevents displaying an empty message.
        if (!!transaction?.transactionID && !!transactionViolations.length && shouldShowBrokenConnectionViolation) {
            return {
                icon: getStatusIcon(expensifyIcons.Hourglass),
                description: (
                    <BrokenConnectionDescription
                        transactionID={transaction?.transactionID}
                        report={moneyRequestReport}
                        policy={policy}
                    />
                ),
            };
        }
        if (hasAllPendingRTERViolations) {
            return {icon: getStatusIcon(expensifyIcons.Hourglass), description: translate('iou.pendingMatchWithCreditCardDescription')};
        }
        if (hasOnlyPendingTransactions) {
            return {icon: getStatusIcon(expensifyIcons.CreditCardHourglass), description: translate('iou.transactionPendingDescription')};
        }
        if (hasScanningReceipt) {
            return {icon: getStatusIcon(expensifyIcons.ReceiptScan), description: translate('iou.receiptScanInProgressDescription')};
        }
    };

    const getFirstDuplicateThreadID = (transactionsList: OnyxTypes.Transaction[], allReportActions: OnyxTypes.ReportAction[]) => {
        const duplicateTransaction = transactionsList.find((reportTransaction) =>
            isDuplicate(
                reportTransaction,
                email ?? '',
                accountID,
                moneyRequestReport,
                policy,
                allTransactionViolations?.[ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS + reportTransaction.transactionID],
            ),
        );
        if (!duplicateTransaction) {
            return null;
        }

        return getThreadReportIDsForTransactions(allReportActions, [duplicateTransaction]).at(0);
    };

    const statusBarProps = getStatusBarProps();

    const dismissModalAndUpdateUseHold = () => {
        setIsHoldEducationalModalVisible(false);
        setNameValuePair(ONYXKEYS.NVP_DISMISSED_HOLD_USE_EXPLANATION, true, false, !network?.shouldFailAllRequests);
        if (requestParentReportAction) {
            changeMoneyRequestHoldStatus(requestParentReportAction);
        }
    };

    const dismissRejectModalBasedOnAction = () => {
        if (rejectModalAction === CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS.HOLD) {
            dismissRejectUseExplanation();
            if (requestParentReportAction) {
                changeMoneyRequestHoldStatus(requestParentReportAction);
            }
        } else if (rejectModalAction === CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS.REJECT_BULK) {
            dismissRejectUseExplanation();
            if (moneyRequestReport?.reportID) {
                Navigation.navigate(ROUTES.SEARCH_MONEY_REQUEST_REPORT_REJECT_TRANSACTIONS.getRoute({reportID: moneyRequestReport.reportID}));
            }
        } else {
            dismissRejectUseExplanation();
            if (requestParentReportAction) {
                rejectMoneyRequestReason(requestParentReportAction);
            }
        }
        setRejectModalAction(null);
    };

    const primaryAction = useMemo(() => {
        return getReportPrimaryAction({
            currentUserLogin: currentUserLogin ?? '',
            currentUserAccountID: accountID,
            report: moneyRequestReport,
            chatReport,
            reportTransactions: transactions,
            violations,
            bankAccountList,
            policy,
            reportNameValuePairs,
            reportActions,
            reportMetadata,
            isChatReportArchived,
            invoiceReceiverPolicy,
            isPaidAnimationRunning,
            isApprovedAnimationRunning,
            isSubmittingAnimationRunning,
        });
    }, [
        isPaidAnimationRunning,
        isApprovedAnimationRunning,
        isSubmittingAnimationRunning,
        moneyRequestReport,
        chatReport,
        transactions,
        violations,
        policy,
        reportNameValuePairs,
        reportActions,
        reportMetadata,
        isChatReportArchived,
        invoiceReceiverPolicy,
        currentUserLogin,
        accountID,
        bankAccountList,
    ]);

    const confirmExport = useCallback(() => {
        setExportModalStatus(null);
        if (!moneyRequestReport?.reportID || !connectedIntegration) {
            return;
        }
        if (exportModalStatus === CONST.REPORT.EXPORT_OPTIONS.EXPORT_TO_INTEGRATION) {
            exportToIntegration(moneyRequestReport?.reportID, connectedIntegration);
        } else if (exportModalStatus === CONST.REPORT.EXPORT_OPTIONS.MARK_AS_EXPORTED) {
            markAsManuallyExported(moneyRequestReport?.reportID, connectedIntegration);
        }
    }, [connectedIntegration, exportModalStatus, moneyRequestReport?.reportID]);

    const getAmount = (actionType: ValueOf<typeof CONST.REPORT.REPORT_PREVIEW_ACTIONS>) => ({
        formattedAmount: getTotalAmountForIOUReportPreviewButton(moneyRequestReport, policy, actionType),
    });

    const {formattedAmount: totalAmount} = getAmount(CONST.REPORT.PRIMARY_ACTIONS.PAY);

    const paymentButtonOptions = usePaymentOptions({
        currency: moneyRequestReport?.currency,
        iouReport: moneyRequestReport,
        chatReportID: chatReport?.reportID,
        formattedAmount: totalAmount,
        policyID: moneyRequestReport?.policyID,
        onPress: confirmPayment,
        shouldHidePaymentOptions: !shouldShowPayButton,
        shouldShowApproveButton,
        shouldDisableApproveButton,
        onlyShowPayElsewhere,
    });

    const addExpenseDropdownOptions = useMemo(
        () => getAddExpenseDropdownOptions(expensifyIcons, moneyRequestReport?.reportID, policy, undefined, undefined, lastDistanceExpenseType),
        [moneyRequestReport?.reportID, policy, lastDistanceExpenseType, expensifyIcons],
    );

    const exportSubmenuOptions: Record<string, DropdownOption<string>> = useMemo(() => {
        const options: Record<string, DropdownOption<string>> = {
            [CONST.REPORT.EXPORT_OPTIONS.DOWNLOAD_CSV]: {
                text: translate('export.basicExport'),
                icon: expensifyIcons.Table,
                value: CONST.REPORT.EXPORT_OPTIONS.DOWNLOAD_CSV,
                sentryLabel: CONST.SENTRY_LABEL.MORE_MENU.EXPORT_FILE,
                onSelected: () => {
                    if (!moneyRequestReport) {
                        return;
                    }
                    if (isOffline) {
                        setOfflineModalVisible(true);
                        return;
                    }
                    exportReportToCSV(
                        {reportID: moneyRequestReport.reportID, transactionIDList: transactionIDs},
                        () => {
                            setDownloadErrorModalVisible(true);
                        },
                        translate,
                    );
                },
            },
            [CONST.REPORT.EXPORT_OPTIONS.EXPORT_TO_INTEGRATION]: {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                text: translate('workspace.common.exportIntegrationSelected', {connectionName: connectedIntegrationFallback!}),
                icon: (() => {
                    const iconName = getIntegrationExportIcon(connectedIntegration ?? connectedIntegrationFallback);
                    return iconName ? expensifyIcons[iconName] : undefined;
                })(),
                value: CONST.REPORT.EXPORT_OPTIONS.EXPORT_TO_INTEGRATION,
                sentryLabel: CONST.SENTRY_LABEL.MORE_MENU.EXPORT_FILE,
                onSelected: () => {
                    if (!connectedIntegration || !moneyRequestReport) {
                        return;
                    }
                    if (isExported) {
                        setExportModalStatus(CONST.REPORT.EXPORT_OPTIONS.EXPORT_TO_INTEGRATION);
                        return;
                    }
                    exportToIntegration(moneyRequestReport?.reportID, connectedIntegration);
                },
            },
            [CONST.REPORT.EXPORT_OPTIONS.MARK_AS_EXPORTED]: {
                text: translate('workspace.common.markAsExported'),
                icon: (() => {
                    const iconName = getIntegrationExportIcon(connectedIntegration ?? connectedIntegrationFallback);
                    return iconName ? expensifyIcons[iconName] : undefined;
                })(),
                value: CONST.REPORT.EXPORT_OPTIONS.MARK_AS_EXPORTED,
                sentryLabel: CONST.SENTRY_LABEL.MORE_MENU.EXPORT_FILE,
                onSelected: () => {
                    if (!connectedIntegration || !moneyRequestReport) {
                        return;
                    }
                    if (isExported) {
                        setExportModalStatus(CONST.REPORT.EXPORT_OPTIONS.MARK_AS_EXPORTED);
                        return;
                    }
                    markAsManuallyExported(moneyRequestReport?.reportID, connectedIntegration);
                },
            },
        };

        for (const template of exportTemplates) {
            options[template.name] = {
                text: template.name,
                icon: expensifyIcons.Table,
                value: template.templateName,
                description: template.description,
                sentryLabel: CONST.SENTRY_LABEL.MORE_MENU.EXPORT_FILE,
                onSelected: () => beginExportWithTemplate(template.templateName, template.type, transactionIDs, template.policyID),
            };
        }

        return options;
    }, [translate, connectedIntegrationFallback, connectedIntegration, moneyRequestReport, isOffline, transactionIDs, isExported, beginExportWithTemplate, exportTemplates, expensifyIcons]);

    const primaryActionsImplementation = {
        [CONST.REPORT.PRIMARY_ACTIONS.SUBMIT]: (
            <AnimatedSubmitButton
                success
                text={translate('common.submit')}
                onPress={() => {
                    if (!moneyRequestReport || shouldBlockSubmit) {
                        return;
                    }
                    if (hasDynamicExternalWorkflow(policy) && !isDEWBetaEnabled) {
                        showDWEModal();
                        return;
                    }
                    startSubmittingAnimation();
                    submitReport(moneyRequestReport, policy, accountID, email ?? '', hasViolations, isASAPSubmitBetaEnabled, nextStep);
                    if (currentSearchQueryJSON && !isOffline) {
                        search({
                            searchKey: currentSearchKey,
                            shouldCalculateTotals,
                            offset: 0,
                            queryJSON: currentSearchQueryJSON,
                            isOffline,
                            isLoading: !!currentSearchResults?.search?.isLoading,
                        });
                    }
                }}
                isSubmittingAnimationRunning={isSubmittingAnimationRunning}
                onAnimationFinish={stopAnimation}
                isDisabled={shouldBlockSubmit}
            />
        ),
        [CONST.REPORT.PRIMARY_ACTIONS.APPROVE]: (
            <Button
                success
                onPress={confirmApproval}
                text={translate('iou.approve')}
                isDisabled={isBlockSubmitDueToPreventSelfApproval}
            />
        ),
        [CONST.REPORT.PRIMARY_ACTIONS.PAY]: (
            <AnimatedSettlementButton
                isPaidAnimationRunning={isPaidAnimationRunning}
                isApprovedAnimationRunning={isApprovedAnimationRunning}
                onAnimationFinish={stopAnimation}
                formattedAmount={totalAmount}
                canIOUBePaid
                onlyShowPayElsewhere={onlyShowPayElsewhere}
                currency={moneyRequestReport?.currency}
                confirmApproval={confirmApproval}
                policyID={moneyRequestReport?.policyID}
                chatReportID={chatReport?.reportID}
                iouReport={moneyRequestReport}
                onPress={confirmPayment}
                enablePaymentsRoute={ROUTES.ENABLE_PAYMENTS}
                shouldHidePaymentOptions={!shouldShowPayButton}
                shouldShowApproveButton={shouldShowApproveButton}
                shouldDisableApproveButton={shouldDisableApproveButton}
                isDisabled={isOffline && !canAllowSettlement}
                isLoading={!isOffline && !canAllowSettlement}
            />
        ),
        [CONST.REPORT.PRIMARY_ACTIONS.EXPORT_TO_ACCOUNTING]: (
            <Button
                success
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                text={translate('workspace.common.exportIntegrationSelected', {connectionName: connectedIntegration!})}
                onPress={() => {
                    if (!connectedIntegration || !moneyRequestReport) {
                        return;
                    }
                    if (isExported) {
                        setExportModalStatus(CONST.REPORT.EXPORT_OPTIONS.EXPORT_TO_INTEGRATION);
                        return;
                    }
                    exportToIntegration(moneyRequestReport?.reportID, connectedIntegration);
                }}
            />
        ),
        [CONST.REPORT.PRIMARY_ACTIONS.REMOVE_HOLD]: (
            <Button
                success
                text={translate('iou.unhold')}
                onPress={() => {
                    if (isDelegateAccessRestricted) {
                        showDelegateNoAccessModal();
                        return;
                    }

                    const parentReportAction = getReportAction(moneyRequestReport?.parentReportID, moneyRequestReport?.parentReportActionID);

                    const IOUActions = getAllExpensesToHoldIfApplicable(moneyRequestReport, reportActions, transactions, policy);

                    if (IOUActions.length) {
                        for (const action of IOUActions) {
                            changeMoneyRequestHoldStatus(action);
                        }
                        return;
                    }

                    const moneyRequestAction = transactionThreadReportID ? requestParentReportAction : parentReportAction;
                    if (!moneyRequestAction) {
                        return;
                    }

                    changeMoneyRequestHoldStatus(moneyRequestAction);
                }}
            />
        ),
        [CONST.REPORT.PRIMARY_ACTIONS.MARK_AS_CASH]: (
            <Button
                success
                text={translate('iou.markAsCash')}
                onPress={markAsCash}
            />
        ),
        [CONST.REPORT.TRANSACTION_PRIMARY_ACTIONS.MARK_AS_RESOLVED]: (
            <Button
                success
                onPress={() => {
                    if (!transaction?.transactionID) {
                        return;
                    }
                    markRejectViolationAsResolved(transaction?.transactionID, transactionThreadReport?.reportID);
                }}
                text={translate('iou.reject.markAsResolved')}
            />
        ),
        [CONST.REPORT.PRIMARY_ACTIONS.REVIEW_DUPLICATES]: (
            <Button
                success
                text={translate('iou.reviewDuplicates')}
                onPress={() => {
                    let threadID = transactionThreadReportID ?? getFirstDuplicateThreadID(transactions, reportActions);
                    if (!threadID) {
                        const duplicateTransaction = transactions.find((reportTransaction) =>
                            isDuplicate(
                                reportTransaction,
                                email ?? '',
                                accountID,
                                moneyRequestReport,
                                policy,
                                allTransactionViolations?.[ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS + reportTransaction.transactionID],
                            ),
                        );
                        const transactionID = duplicateTransaction?.transactionID;
                        const iouAction = getIOUActionForReportID(moneyRequestReport?.reportID, transactionID);
                        const createdTransactionThreadReport = createTransactionThreadReport(moneyRequestReport, iouAction);
                        threadID = createdTransactionThreadReport?.reportID;
                    }
                    Navigation.navigate(ROUTES.TRANSACTION_DUPLICATE_REVIEW_PAGE.getRoute(threadID));
                }}
            />
        ),
    };

    const beginPDFExport = (reportID: string) => {
        setIsPDFModalVisible(true);
        exportReportToPDF({reportID});
    };

    const secondaryActions = useMemo(() => {
        if (!moneyRequestReport) {
            return [];
        }
        return getSecondaryReportActions({
            currentUserLogin: currentUserLogin ?? '',
            currentUserAccountID: accountID,
            report: moneyRequestReport,
            chatReport,
            reportTransactions: transactions,
            originalTransaction: originalIOUTransaction,
            violations,
            bankAccountList,
            policy,
            reportNameValuePairs,
            reportActions,
            reportMetadata,
            policies,
            isChatReportArchived,
        });
    }, [
        moneyRequestReport,
        currentUserLogin,
        accountID,
        chatReport,
        transactions,
        originalIOUTransaction,
        violations,
        policy,
        reportNameValuePairs,
        reportActions,
        reportMetadata,
        policies,
        isChatReportArchived,
        bankAccountList,
    ]);

    const secondaryExportActions = useMemo(() => {
        if (!moneyRequestReport) {
            return [];
        }
        return getSecondaryExportReportActions(accountID, email ?? '', moneyRequestReport, bankAccountList, policy, exportTemplates);
    }, [moneyRequestReport, accountID, email, policy, exportTemplates, bankAccountList]);

    const connectedIntegrationName = connectedIntegration ? translate('workspace.accounting.connectionName', {connectionName: connectedIntegration}) : '';
    const unapproveWarningText = useMemo(
        () => (
            <Text>
                <Text style={[styles.textStrong, styles.noWrap]}>{translate('iou.headsUp')}</Text>{' '}
                <Text>{translate('iou.unapproveWithIntegrationWarning', {accountingIntegration: connectedIntegrationName})}</Text>
            </Text>
        ),
        [connectedIntegrationName, styles.noWrap, styles.textStrong, translate],
    );

    const reopenExportedReportWarningText = (
        <Text>
            <Text style={[styles.textStrong, styles.noWrap]}>{translate('iou.headsUp')} </Text>
            <Text>{translate('iou.reopenExportedReportConfirmation', {connectionName: integrationNameFromExportMessage ?? ''})}</Text>
        </Text>
    );

    const secondaryActionsImplementation: Record<
        ValueOf<typeof CONST.REPORT.SECONDARY_ACTIONS>,
        DropdownOption<ValueOf<typeof CONST.REPORT.SECONDARY_ACTIONS>> & Pick<PopoverMenuItem, 'backButtonText' | 'rightIcon'>
    > = {
        [CONST.REPORT.SECONDARY_ACTIONS.VIEW_DETAILS]: {
            value: CONST.REPORT.SECONDARY_ACTIONS.VIEW_DETAILS,
            text: translate('iou.viewDetails'),
            icon: expensifyIcons.Info,
            sentryLabel: CONST.SENTRY_LABEL.MORE_MENU.VIEW_DETAILS,
            onSelected: () => {
                navigateToDetailsPage(moneyRequestReport, Navigation.getReportRHPActiveRoute());
            },
        },
        [CONST.REPORT.SECONDARY_ACTIONS.EXPORT]: {
            value: CONST.REPORT.SECONDARY_ACTIONS.EXPORT,
            text: translate('common.export'),
            backButtonText: translate('common.export'),
            icon: expensifyIcons.Export,
            rightIcon: expensifyIcons.ArrowRight,
            sentryLabel: CONST.SENTRY_LABEL.MORE_MENU.EXPORT,
            subMenuItems: secondaryExportActions.map((action) => exportSubmenuOptions[action as string]),
        },
        [CONST.REPORT.SECONDARY_ACTIONS.DOWNLOAD_PDF]: {
            value: CONST.REPORT.SECONDARY_ACTIONS.DOWNLOAD_PDF,
            text: translate('common.downloadAsPDF'),
            icon: expensifyIcons.Document,
            sentryLabel: CONST.SENTRY_LABEL.MORE_MENU.DOWNLOAD_PDF,
            onSelected: () => {
                if (!moneyRequestReport) {
                    return;
                }
                beginPDFExport(moneyRequestReport.reportID);
            },
        },
        [CONST.REPORT.SECONDARY_ACTIONS.SUBMIT]: {
            value: CONST.REPORT.SECONDARY_ACTIONS.SUBMIT,
            text: translate('common.submit'),
            icon: expensifyIcons.Send,
            sentryLabel: CONST.SENTRY_LABEL.MORE_MENU.SUBMIT,
            onSelected: () => {
                if (!moneyRequestReport) {
                    return;
                }
                if (hasDynamicExternalWorkflow(policy) && !isDEWBetaEnabled) {
                    showDWEModal();
                    return;
                }
                submitReport(moneyRequestReport, policy, accountID, email ?? '', hasViolations, isASAPSubmitBetaEnabled, nextStep);
            },
        },
        [CONST.REPORT.SECONDARY_ACTIONS.APPROVE]: {
            text: translate('iou.approve'),
            icon: expensifyIcons.ThumbsUp,
            value: CONST.REPORT.SECONDARY_ACTIONS.APPROVE,
            sentryLabel: CONST.SENTRY_LABEL.MORE_MENU.APPROVE,
            onSelected: confirmApproval,
        },
        [CONST.REPORT.SECONDARY_ACTIONS.UNAPPROVE]: {
            text: translate('iou.unapprove'),
            icon: expensifyIcons.CircularArrowBackwards,
            value: CONST.REPORT.SECONDARY_ACTIONS.UNAPPROVE,
            sentryLabel: CONST.SENTRY_LABEL.MORE_MENU.UNAPPROVE,
            onSelected: async () => {
                if (isDelegateAccessRestricted) {
                    showDelegateNoAccessModal();
                    return;
                }

                if (isExported) {
                    const result = await showConfirmModal({
                        title: translate('iou.unapproveReport'),
                        prompt: unapproveWarningText,
                        confirmText: translate('iou.unapproveReport'),
                        cancelText: translate('common.cancel'),
                        danger: true,
                    });

                    if (result.action !== ModalActions.CONFIRM) {
                        return;
                    }
                    unapproveExpenseReport(moneyRequestReport, policy, accountID, email ?? '', hasViolations, isASAPSubmitBetaEnabled, nextStep);
                    return;
                }

                unapproveExpenseReport(moneyRequestReport, policy, accountID, email ?? '', hasViolations, isASAPSubmitBetaEnabled, nextStep);
            },
        },
        [CONST.REPORT.SECONDARY_ACTIONS.CANCEL_PAYMENT]: {
            text: translate('iou.cancelPayment'),
            icon: expensifyIcons.Clear,
            value: CONST.REPORT.SECONDARY_ACTIONS.CANCEL_PAYMENT,
            sentryLabel: CONST.SENTRY_LABEL.MORE_MENU.CANCEL_PAYMENT,
            onSelected: async () => {
                const result = await showConfirmModal({
                    title: translate('iou.cancelPayment'),
                    prompt: translate('iou.cancelPaymentConfirmation'),
                    confirmText: translate('iou.cancelPayment'),
                    cancelText: translate('common.dismiss'),
                    danger: true,
                });

                if (result.action !== ModalActions.CONFIRM || !chatReport) {
                    return;
                }
                cancelPayment(moneyRequestReport, chatReport, policy, isASAPSubmitBetaEnabled, accountID, email ?? '', hasViolations);
            },
        },
        [CONST.REPORT.SECONDARY_ACTIONS.HOLD]: {
            text: translate('iou.hold'),
            icon: expensifyIcons.Stopwatch,
            value: CONST.REPORT.SECONDARY_ACTIONS.HOLD,
            sentryLabel: CONST.SENTRY_LABEL.MORE_MENU.HOLD,
            onSelected: () => {
                if (!requestParentReportAction) {
                    throw new Error('Parent action does not exist');
                }

                if (isDelegateAccessRestricted) {
                    showDelegateNoAccessModal();
                    return;
                }

                const isDismissed = isReportSubmitter ? dismissedHoldUseExplanation : dismissedRejectUseExplanation;

                if (isDismissed || isChatReportDM) {
                    changeMoneyRequestHoldStatus(requestParentReportAction);
                } else if (isReportSubmitter) {
                    setIsHoldEducationalModalVisible(true);
                } else {
                    setRejectModalAction(CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS.HOLD);
                }
            },
        },
        [CONST.REPORT.SECONDARY_ACTIONS.REMOVE_HOLD]: {
            text: translate('iou.unhold'),
            icon: expensifyIcons.Stopwatch,
            value: CONST.REPORT.SECONDARY_ACTIONS.REMOVE_HOLD,
            sentryLabel: CONST.SENTRY_LABEL.MORE_MENU.REMOVE_HOLD,
            onSelected: () => {
                if (!requestParentReportAction) {
                    throw new Error('Parent action does not exist');
                }

                if (isDelegateAccessRestricted) {
                    showDelegateNoAccessModal();
                    return;
                }

                changeMoneyRequestHoldStatus(requestParentReportAction);
            },
        },
        [CONST.REPORT.SECONDARY_ACTIONS.SPLIT]: {
            text: isExpenseSplit ? translate('iou.editSplits') : translate('iou.split'),
            icon: expensifyIcons.ArrowSplit,
            value: CONST.REPORT.SECONDARY_ACTIONS.SPLIT,
            sentryLabel: CONST.SENTRY_LABEL.MORE_MENU.SPLIT,
            onSelected: () => {
                if (Number(transactions?.length) !== 1) {
                    return;
                }

                initSplitExpense(allTransactions, allReports, currentTransaction);
            },
        },
        [CONST.REPORT.SECONDARY_ACTIONS.MERGE]: {
            text: translate('common.merge'),
            icon: expensifyIcons.ArrowCollapse,
            value: CONST.REPORT.SECONDARY_ACTIONS.MERGE,
            sentryLabel: CONST.SENTRY_LABEL.MORE_MENU.MERGE,
            onSelected: () => {
                if (!currentTransaction) {
                    return;
                }

                setupMergeTransactionDataAndNavigate(currentTransaction.transactionID, [currentTransaction], localeCompare);
            },
        },
        [CONST.REPORT.SECONDARY_ACTIONS.DUPLICATE]: {
            text: isDuplicateActive ? translate('common.duplicate') : translate('common.duplicated'),
            icon: isDuplicateActive ? expensifyIcons.ReceiptMultiple : expensifyIcons.CheckmarkCircle,
            value: CONST.REPORT.SECONDARY_ACTIONS.DUPLICATE,
            onSelected: () => {
                if (hasCustomUnitOutOfPolicyViolation) {
                    setDuplicateDistanceErrorModalVisible(true);
                    return;
                }

                if (isNonDefaultWorkspacePerDiemRequest) {
                    setDuplicatePerDiemErrorModalVisible(true);
                    return;
                }

                if (!isDuplicateActive || !transaction) {
                    return;
                }

                temporarilyDisableDuplicateAction();

                duplicateExpenseTransaction([transaction]);
            },
            shouldCloseModalOnSelect: isNonDefaultWorkspacePerDiemRequest || hasCustomUnitOutOfPolicyViolation || activePolicyExpenseChat?.iouReportID === moneyRequestReport?.reportID,
        },
        [CONST.REPORT.SECONDARY_ACTIONS.CHANGE_WORKSPACE]: {
            text: translate('iou.changeWorkspace'),
            icon: expensifyIcons.Buildings,
            value: CONST.REPORT.SECONDARY_ACTIONS.CHANGE_WORKSPACE,
            sentryLabel: CONST.SENTRY_LABEL.MORE_MENU.CHANGE_WORKSPACE,
            onSelected: () => {
                if (!moneyRequestReport) {
                    return;
                }
                Navigation.navigate(ROUTES.REPORT_WITH_ID_CHANGE_WORKSPACE.getRoute(moneyRequestReport.reportID, Navigation.getActiveRoute()));
            },
        },
        [CONST.REPORT.SECONDARY_ACTIONS.CHANGE_APPROVER]: {
            text: translate('iou.changeApprover.title'),
            icon: expensifyIcons.Workflows,
            value: CONST.REPORT.SECONDARY_ACTIONS.CHANGE_APPROVER,
            sentryLabel: CONST.SENTRY_LABEL.MORE_MENU.CHANGE_APPROVER,
            onSelected: () => {
                if (!moneyRequestReport) {
                    Log.warn('Change approver secondary action triggered without moneyRequestReport data.');
                    return;
                }
                Navigation.navigate(ROUTES.REPORT_CHANGE_APPROVER.getRoute(moneyRequestReport.reportID, Navigation.getActiveRoute()));
            },
        },
        [CONST.REPORT.SECONDARY_ACTIONS.REPORT_LAYOUT]: {
            text: translate('reportLayout.reportLayout'),
            icon: expensifyIcons.Feed,
            value: CONST.REPORT.SECONDARY_ACTIONS.REPORT_LAYOUT,
            sentryLabel: CONST.SENTRY_LABEL.MORE_MENU.REPORT_LAYOUT,
            onSelected: () => {
                if (!moneyRequestReport) {
                    return;
                }
                Navigation.navigate(ROUTES.REPORT_SETTINGS_REPORT_LAYOUT.getRoute(moneyRequestReport.reportID));
            },
        },
        [CONST.REPORT.SECONDARY_ACTIONS.DELETE]: {
            text: translate('common.delete'),
            icon: expensifyIcons.Trashcan,
            value: CONST.REPORT.SECONDARY_ACTIONS.DELETE,
            sentryLabel: CONST.SENTRY_LABEL.MORE_MENU.DELETE,
            onSelected: async () => {
                const transactionCount = Object.keys(transactions).length;

                if (transactionCount === 1) {
                    const result = await showConfirmModal({
                        title: translate('iou.deleteExpense', {count: 1}),
                        prompt: translate('iou.deleteConfirmation', {count: 1}),
                        confirmText: translate('common.delete'),
                        cancelText: translate('common.cancel'),
                        danger: true,
                    });

                    if (result.action !== ModalActions.CONFIRM) {
                        return;
                    }
                    if (transactionThreadReportID) {
                        if (!requestParentReportAction || !transaction?.transactionID) {
                            throw new Error('Missing data!');
                        }
                        const goBackRoute = getNavigationUrlOnMoneyRequestDelete(
                            transaction.transactionID,
                            requestParentReportAction,
                            iouReport,
                            chatIOUReport,
                            isChatIOUReportArchived,
                            false,
                        );
                        if (goBackRoute) {
                            navigateOnDeleteExpense(goBackRoute);
                        }
                        // it's deleting transaction but not the report which leads to bug (that is actually also on staging)
                        // Money request should be deleted when interactions are done, to not show the not found page before navigating to goBackRoute
                        // eslint-disable-next-line @typescript-eslint/no-deprecated
                        InteractionManager.runAfterInteractions(() => {
                            deleteTransactions([transaction.transactionID], duplicateTransactions, duplicateTransactionViolations, currentSearchHash, false);
                            removeTransaction(transaction.transactionID);
                        });
                    }
                    return;
                }

                const result = await showConfirmModal({
                    title: translate('iou.deleteReport'),
                    prompt: translate('iou.deleteReportConfirmation'),
                    confirmText: translate('common.delete'),
                    cancelText: translate('common.cancel'),
                    danger: true,
                });
                if (result.action !== ModalActions.CONFIRM) {
                    return;
                }
                const backToRoute = route.params?.backTo ?? (chatReport?.reportID ? ROUTES.REPORT_WITH_ID.getRoute(chatReport.reportID) : undefined);

                Navigation.setNavigationActionToMicrotaskQueue(() => {
                    Navigation.goBack(backToRoute);
                    // eslint-disable-next-line @typescript-eslint/no-deprecated
                    InteractionManager.runAfterInteractions(() => {
                        deleteAppReport(moneyRequestReport?.reportID, email ?? '', reportTransactions, allTransactionViolations, bankAccountList);
                    });
                });
            },
        },
        [CONST.REPORT.SECONDARY_ACTIONS.RETRACT]: {
            text: translate('iou.retract'),
            icon: expensifyIcons.CircularArrowBackwards,
            value: CONST.REPORT.SECONDARY_ACTIONS.RETRACT,
            sentryLabel: CONST.SENTRY_LABEL.MORE_MENU.RETRACT,
            onSelected: () => {
                retractReport(moneyRequestReport, chatReport, policy, accountID, email ?? '', hasViolations, isASAPSubmitBetaEnabled, nextStep);
            },
        },
        [CONST.REPORT.SECONDARY_ACTIONS.REOPEN]: {
            text: translate('iou.retract'),
            icon: expensifyIcons.CircularArrowBackwards,
            value: CONST.REPORT.SECONDARY_ACTIONS.REOPEN,
            sentryLabel: CONST.SENTRY_LABEL.MORE_MENU.REOPEN,
            onSelected: async () => {
                if (isExported) {
                    const result = await showConfirmModal({
                        title: translate('iou.reopenReport'),
                        prompt: reopenExportedReportWarningText,
                        confirmText: translate('iou.reopenReport'),
                        cancelText: translate('common.cancel'),
                        danger: true,
                    });

                    if (result.action !== ModalActions.CONFIRM) {
                        return;
                    }
                    reopenReport(moneyRequestReport, policy, accountID, email ?? '', hasViolations, isASAPSubmitBetaEnabled, nextStep);
                    return;
                }
                reopenReport(moneyRequestReport, policy, accountID, email ?? '', hasViolations, isASAPSubmitBetaEnabled, nextStep);
            },
        },
        [CONST.REPORT.SECONDARY_ACTIONS.REJECT]: {
            text: translate('common.reject'),
            icon: expensifyIcons.ThumbsDown,
            value: CONST.REPORT.SECONDARY_ACTIONS.REJECT,
            sentryLabel: CONST.SENTRY_LABEL.MORE_MENU.REJECT,
            onSelected: () => {
                if (isDelegateAccessRestricted) {
                    showDelegateNoAccessModal();
                    return;
                }

                if (dismissedRejectUseExplanation) {
                    if (requestParentReportAction) {
                        rejectMoneyRequestReason(requestParentReportAction);
                    }
                } else {
                    setRejectModalAction(CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS.REJECT);
                }
            },
            shouldShow: transactions.length === 1,
        },
        [CONST.REPORT.SECONDARY_ACTIONS.ADD_EXPENSE]: {
            text: translate('iou.addExpense'),
            backButtonText: translate('iou.addExpense'),
            icon: expensifyIcons.Plus,
            rightIcon: expensifyIcons.ArrowRight,
            value: CONST.REPORT.SECONDARY_ACTIONS.ADD_EXPENSE,
            sentryLabel: CONST.SENTRY_LABEL.MORE_MENU.ADD_EXPENSE,
            subMenuItems: addExpenseDropdownOptions,
            onSelected: () => {
                if (!moneyRequestReport?.reportID) {
                    return;
                }
                if (policy && shouldRestrictUserBillableActions(policy.id)) {
                    Navigation.navigate(ROUTES.RESTRICTED_ACTION.getRoute(policy.id));
                    return;
                }
                startMoneyRequest(CONST.IOU.TYPE.SUBMIT, moneyRequestReport?.reportID);
            },
        },
        [CONST.REPORT.SECONDARY_ACTIONS.PAY]: {
            text: translate('iou.settlePayment', {formattedAmount: totalAmount}),
            icon: expensifyIcons.Cash,
            rightIcon: expensifyIcons.ArrowRight,
            value: CONST.REPORT.SECONDARY_ACTIONS.PAY,
            backButtonText: translate('iou.settlePayment', {formattedAmount: totalAmount}),
            sentryLabel: CONST.SENTRY_LABEL.MORE_MENU.PAY,
            subMenuItems: Object.values(paymentButtonOptions),
        },
    };
    const applicableSecondaryActions = secondaryActions
        .map((action) => secondaryActionsImplementation[action])
        .filter((action) => action?.shouldShow !== false && action?.value !== primaryAction);
    useEffect(() => {
        if (!transactionThreadReportID) {
            return;
        }
        clearSelectedTransactions(true);
        // We don't need to run the effect on change of clearSelectedTransactions since it can cause the infinite loop.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [transactionThreadReportID]);

    useEffect(() => {
        if (!hasFinishedPDFDownload || !canTriggerAutomaticPDFDownload.current) {
            return;
        }
        downloadReportPDF(reportPDFFilename, moneyRequestReport?.reportName ?? '', translate, currentUserLogin ?? '');
        canTriggerAutomaticPDFDownload.current = false;
    }, [hasFinishedPDFDownload, reportPDFFilename, moneyRequestReport?.reportName, translate, currentUserLogin]);

    const shouldShowBackButton = shouldDisplayBackButton || shouldUseNarrowLayout;

    const isMobileSelectionModeEnabled = useMobileSelectionMode();

    useEffect(() => {
        return () => {
            turnOffMobileSelectionMode();
        };
    }, []);

    const showDeleteModal = useCallback(() => {
        showConfirmModal({
            title: translate('iou.deleteExpense', {count: selectedTransactionIDs.length}),
            prompt: translate('iou.deleteConfirmation', {count: selectedTransactionIDs.length}),
            confirmText: translate('common.delete'),
            cancelText: translate('common.cancel'),
            danger: true,
        }).then((result) => {
            if (result.action !== ModalActions.CONFIRM) {
                return;
            }
            if (transactions.filter((trans) => trans.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE).length === selectedTransactionIDs.length) {
                const backToRoute = route.params?.backTo ?? (chatReport?.reportID ? ROUTES.REPORT_WITH_ID.getRoute(chatReport.reportID) : undefined);
                Navigation.goBack(backToRoute);
            }
            // It has been handled like the rest of the delete cases. It will be refactored along with other cases.
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            InteractionManager.runAfterInteractions(() => handleDeleteTransactions());
        });
    }, [showConfirmModal, translate, selectedTransactionIDs.length, transactions, handleDeleteTransactions, route.params?.backTo, chatReport?.reportID]);

    const showExportAgainModal = useCallback(() => {
        if (!connectedIntegration) {
            return;
        }
        showConfirmModal({
            title: translate('workspace.exportAgainModal.title'),
            prompt: translate('workspace.exportAgainModal.description', {
                connectionName: connectedIntegration ?? connectedIntegrationFallback,
                reportName: moneyRequestReport?.reportName ?? '',
            }),
            confirmText: translate('workspace.exportAgainModal.confirmText'),
            cancelText: translate('workspace.exportAgainModal.cancelText'),
        }).then((result) => {
            if (result.action !== ModalActions.CONFIRM) {
                setExportModalStatus(null);
                return;
            }
            confirmExport();
        });
    }, [showConfirmModal, translate, connectedIntegration, connectedIntegrationFallback, moneyRequestReport?.reportName, confirmExport]);

    useEffect(() => {
        if (!exportModalStatus) {
            return;
        }
        showExportAgainModal();
    }, [exportModalStatus, showExportAgainModal]);

    const selectedTransactionsOptions = useMemo(() => {
        return originalSelectedTransactionsOptions.map((option) => {
            if (option.value === CONST.REPORT.SECONDARY_ACTIONS.DELETE) {
                return {
                    ...option,
                    onSelected: showDeleteModal,
                };
            }
            if (option.value === CONST.REPORT.SECONDARY_ACTIONS.REJECT) {
                return {
                    ...option,
                    onSelected: () => {
                        if (dismissedRejectUseExplanation) {
                            option.onSelected?.();
                        } else {
                            setRejectModalAction(CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS.REJECT_BULK);
                        }
                    },
                };
            }
            return option;
        });
    }, [originalSelectedTransactionsOptions, showDeleteModal, dismissedRejectUseExplanation]);

    const shouldShowSelectedTransactionsButton = !!selectedTransactionsOptions.length && !transactionThreadReportID;

    if (isMobileSelectionModeEnabled && shouldUseNarrowLayout) {
        // If mobile selection mode is enabled but only one or no transactions remain, turn it off
        const visibleTransactions = transactions.filter((t) => t.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE || isOffline);
        if (visibleTransactions.length <= 1) {
            turnOffMobileSelectionMode();
        }

        return (
            <HeaderWithBackButton
                title={translate('common.selectMultiple')}
                onBackButtonPress={() => {
                    clearSelectedTransactions(true);
                    turnOffMobileSelectionMode();
                }}
            />
        );
    }
    const onPaymentSelect = (event: KYCFlowEvent, iouPaymentType: PaymentMethodType, triggerKYCFlow: TriggerKYCFlow) =>
        selectPaymentType({
            event,
            iouPaymentType,
            triggerKYCFlow,
            policy,
            onPress: confirmPayment,
            currentAccountID: accountID,
            currentEmail: email ?? '',
            hasViolations,
            isASAPSubmitBetaEnabled,
            isUserValidated,
            confirmApproval,
            iouReport: moneyRequestReport,
            iouReportNextStep: nextStep,
        });

    const showNextStepBar = shouldShowNextStep && !!optimisticNextStep?.message?.length;
    const showNextStepSkeleton = shouldShowNextStep && !optimisticNextStep && !!isLoadingInitialReportActions && !isOffline;
    const shouldShowMoreContent = showNextStepBar || showNextStepSkeleton || !!statusBarProps || isReportInSearch;

    return (
        <View style={[styles.pt0, styles.borderBottom]}>
            <HeaderWithBackButton
                shouldShowReportAvatarWithDisplay
                shouldDisplayStatus
                shouldShowPinButton={false}
                report={moneyRequestReport}
                shouldShowBackButton={shouldShowBackButton}
                shouldDisplaySearchRouter={shouldDisplaySearchRouter}
                onBackButtonPress={onBackButtonPress}
                shouldShowBorderBottom={false}
                shouldEnableDetailPageNavigation
                openParentReportInCurrentTab
            >
                {shouldDisplayNarrowMoreButton && (
                    <View style={[styles.flexRow, styles.gap2]}>
                        {!!primaryAction && !shouldShowSelectedTransactionsButton && primaryActionsImplementation[primaryAction]}
                        {!!applicableSecondaryActions.length && !shouldShowSelectedTransactionsButton && (
                            <MoneyReportHeaderKYCDropdown
                                chatReportID={chatReport?.reportID}
                                iouReport={moneyRequestReport}
                                onPaymentSelect={onPaymentSelect}
                                onSuccessfulKYC={(payment) => confirmPayment(payment)}
                                primaryAction={primaryAction}
                                applicableSecondaryActions={applicableSecondaryActions}
                                ref={kycWallRef}
                            />
                        )}
                        {shouldShowSelectedTransactionsButton && (
                            <View>
                                <ButtonWithDropdownMenu
                                    onPress={() => null}
                                    options={selectedTransactionsOptions}
                                    customText={translate('workspace.common.selected', {count: selectedTransactionIDs.length})}
                                    isSplitButton={false}
                                    shouldAlwaysShowDropdownMenu
                                />
                            </View>
                        )}
                    </View>
                )}
            </HeaderWithBackButton>
            {!shouldDisplayNarrowMoreButton &&
                (shouldShowSelectedTransactionsButton ? (
                    <View style={[styles.dFlex, styles.w100, styles.ph5, styles.pb3]}>
                        <ButtonWithDropdownMenu
                            onPress={() => null}
                            options={selectedTransactionsOptions}
                            customText={translate('workspace.common.selected', {count: selectedTransactionIDs.length})}
                            isSplitButton={false}
                            shouldAlwaysShowDropdownMenu
                            wrapperStyle={styles.w100}
                        />
                    </View>
                ) : (
                    <View style={[styles.flexRow, styles.gap2, styles.pb3, styles.ph5, styles.w100, styles.alignItemsCenter, styles.justifyContentCenter]}>
                        {!!primaryAction && <View style={[styles.flex1]}>{primaryActionsImplementation[primaryAction]}</View>}
                        {!!applicableSecondaryActions.length && (
                            <MoneyReportHeaderKYCDropdown
                                chatReportID={chatReport?.reportID}
                                iouReport={moneyRequestReport}
                                onPaymentSelect={onPaymentSelect}
                                onSuccessfulKYC={(payment) => confirmPayment(payment)}
                                primaryAction={primaryAction}
                                applicableSecondaryActions={applicableSecondaryActions}
                                ref={kycWallRef}
                            />
                        )}
                    </View>
                ))}

            {shouldShowMoreContent && (
                <View style={[styles.flexRow, styles.gap2, styles.justifyContentStart, styles.flexNoWrap, styles.ph5, styles.pb3]}>
                    <View style={[styles.flexShrink1, styles.flexGrow1, styles.mnw0, styles.flexWrap, styles.justifyContentCenter]}>
                        {showNextStepBar && <MoneyReportHeaderStatusBar nextStep={optimisticNextStep} />}
                        {showNextStepSkeleton && <MoneyReportHeaderStatusBarSkeleton />}
                        {!!statusBarProps && (
                            <MoneyRequestHeaderStatusBar
                                icon={statusBarProps.icon}
                                description={statusBarProps.description}
                            />
                        )}
                    </View>
                    {isReportInSearch && (
                        <MoneyRequestReportNavigation
                            reportID={moneyRequestReport?.reportID}
                            shouldDisplayNarrowVersion={!shouldDisplayNarrowMoreButton}
                        />
                    )}
                </View>
            )}

            <LoadingBar shouldShow={shouldShowLoadingBar && shouldUseNarrowLayout} />
            {isHoldMenuVisible && requestType !== undefined && (
                <ProcessMoneyReportHoldMenu
                    nonHeldAmount={!hasOnlyHeldExpenses && hasValidNonHeldAmount ? nonHeldAmount : undefined}
                    requestType={requestType}
                    fullAmount={fullAmount}
                    onClose={() => setIsHoldMenuVisible(false)}
                    isVisible={isHoldMenuVisible}
                    paymentType={paymentType}
                    chatReport={chatReport}
                    moneyRequestReport={moneyRequestReport}
                    hasNonHeldExpenses={!hasOnlyHeldExpenses}
                    startAnimation={() => {
                        if (requestType === CONST.IOU.REPORT_ACTION_TYPE.APPROVE) {
                            startApprovedAnimation();
                        } else {
                            startAnimation();
                        }
                    }}
                    transactionCount={transactionIDs?.length ?? 0}
                />
            )}
            <DecisionModal
                title={translate('common.downloadFailedTitle')}
                prompt={translate('common.downloadFailedDescription')}
                isSmallScreenWidth={isSmallScreenWidth}
                onSecondOptionSubmit={() => setDownloadErrorModalVisible(false)}
                secondOptionText={translate('common.buttonConfirm')}
                isVisible={downloadErrorModalVisible}
                onClose={() => setDownloadErrorModalVisible(false)}
            />
            <DecisionModal
                title={translate('common.downloadFailedTitle')}
                prompt={translate('common.downloadFailedDescription')}
                isSmallScreenWidth={isSmallScreenWidth}
                onSecondOptionSubmit={() => setIsDownloadErrorModalVisible(false)}
                secondOptionText={translate('common.buttonConfirm')}
                isVisible={isDownloadErrorModalVisible}
                onClose={() => setIsDownloadErrorModalVisible(false)}
            />
            <ConfirmModal
                title={translate('common.duplicateExpense')}
                isVisible={duplicateDistanceErrorModalVisible}
                onConfirm={() => setDuplicateDistanceErrorModalVisible(false)}
                onCancel={() => setDuplicateDistanceErrorModalVisible(false)}
                confirmText={translate('common.buttonConfirm')}
                prompt={translate('iou.correctDistanceRateError')}
                shouldShowCancelButton={false}
            />
            <ConfirmModal
                title={translate('common.duplicateExpense')}
                isVisible={duplicatePerDiemErrorModalVisible}
                onConfirm={() => setDuplicatePerDiemErrorModalVisible(false)}
                onCancel={() => setDuplicatePerDiemErrorModalVisible(false)}
                confirmText={translate('common.buttonConfirm')}
                prompt={translate('iou.duplicateNonDefaultWorkspacePerDiemError')}
                shouldShowCancelButton={false}
            />
            {!!rejectModalAction && (
                <HoldOrRejectEducationalModal
                    onClose={dismissRejectModalBasedOnAction}
                    onConfirm={dismissRejectModalBasedOnAction}
                />
            )}
            {!!isHoldEducationalModalVisible && (
                <HoldSubmitterEducationalModal
                    onClose={dismissModalAndUpdateUseHold}
                    onConfirm={dismissModalAndUpdateUseHold}
                />
            )}
            <DecisionModal
                title={translate('common.youAppearToBeOffline')}
                prompt={translate('common.offlinePrompt')}
                isSmallScreenWidth={isSmallScreenWidth}
                onSecondOptionSubmit={() => setOfflineModalVisible(false)}
                secondOptionText={translate('common.buttonConfirm')}
                isVisible={offlineModalVisible}
                onClose={() => setOfflineModalVisible(false)}
            />
            <Modal
                onClose={() => {
                    setIsPDFModalVisible(false);
                }}
                isVisible={isPDFModalVisible}
                type={isSmallScreenWidth ? CONST.MODAL.MODAL_TYPE.BOTTOM_DOCKED : CONST.MODAL.MODAL_TYPE.CONFIRM}
                innerContainerStyle={styles.pv0}
            >
                <View style={[styles.flexRow, styles.m5]}>
                    <View style={[styles.flex1]}>
                        <View style={[styles.flexRow, styles.mb4]}>
                            <View style={[styles.flex1]}>
                                <View style={[styles.flexRow]}>
                                    <Header title={translate('reportDetailsPage.generatingPDF')} />
                                </View>
                                <Text style={[styles.mt5, styles.textAlignLeft]}>{messagePDF}</Text>
                            </View>

                            {!hasFinishedPDFDownload && (
                                <View style={[styles.dFlex, styles.justifyContentEnd]}>
                                    <ActivityIndicator
                                        size={CONST.ACTIVITY_INDICATOR_SIZE.SMALL}
                                        color={theme.textSupporting}
                                        style={styles.ml3}
                                    />
                                </View>
                            )}
                        </View>
                        <Button
                            style={[styles.mt3, styles.noSelect]}
                            onPress={() => {
                                if (!hasFinishedPDFDownload) {
                                    setIsPDFModalVisible(false);
                                } else {
                                    downloadReportPDF(reportPDFFilename, moneyRequestReport?.reportName ?? '', translate, currentUserLogin ?? '');
                                }
                            }}
                            text={hasFinishedPDFDownload ? translate('common.download') : translate('common.cancel')}
                        />
                    </View>
                    <PressableWithFeedback
                        onPress={() => {
                            setIsPDFModalVisible(false);
                        }}
                        role={CONST.ROLE.BUTTON}
                        accessibilityLabel={translate('common.close')}
                        wrapperStyle={[styles.pAbsolute, styles.r0]}
                    >
                        <Icon
                            src={expensifyIcons.Close}
                            fill={theme.icon}
                        />
                    </PressableWithFeedback>
                </View>
            </Modal>
        </View>
    );
}

export default MoneyReportHeader;
