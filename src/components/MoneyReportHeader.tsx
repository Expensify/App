import {useRoute} from '@react-navigation/native';
import {delegateEmailSelector, isUserValidatedSelector} from '@selectors/Account';
import {hasSeenTourSelector} from '@selectors/Onboarding';
import passthroughPolicyTagListSelector from '@selectors/PolicyTagList';
import {validTransactionDraftsSelector} from '@selectors/TransactionDraft';
import truncate from 'lodash/truncate';
import React, {useCallback, useContext, useEffect, useMemo, useRef, useState} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {InteractionManager, View} from 'react-native';
import type {ValueOf} from 'type-fest';
import useActiveAdminPolicies from '@hooks/useActiveAdminPolicies';
import useConfirmModal from '@hooks/useConfirmModal';
import useConfirmPendingRTERAndProceed from '@hooks/useConfirmPendingRTERAndProceed';
import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDecisionModal from '@hooks/useDecisionModal';
import useDefaultExpensePolicy from '@hooks/useDefaultExpensePolicy';
import useDeleteTransactions from '@hooks/useDeleteTransactions';
import useDuplicateTransactionsAndViolations from '@hooks/useDuplicateTransactionsAndViolations';
import useEnvironment from '@hooks/useEnvironment';
import useExportAgainModal from '@hooks/useExportAgainModal';
import useGetIOUReportFromReportAction from '@hooks/useGetIOUReportFromReportAction';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useMobileSelectionMode from '@hooks/useMobileSelectionMode';
import useMoneyReportHeaderStatusBar from '@hooks/useMoneyReportHeaderStatusBar';
import useNetwork from '@hooks/useNetwork';
import useNonReimbursablePaymentModal from '@hooks/useNonReimbursablePaymentModal';
import useOnyx from '@hooks/useOnyx';
import usePaginatedReportActions from '@hooks/usePaginatedReportActions';
import useParticipantsInvoiceReport from '@hooks/useParticipantsInvoiceReport';
import usePaymentAnimations from '@hooks/usePaymentAnimations';
import usePaymentOptions from '@hooks/usePaymentOptions';
import usePermissions from '@hooks/usePermissions';
import usePolicy from '@hooks/usePolicy';
import useReportIsArchived from '@hooks/useReportIsArchived';
import useReportTransactionsCollection from '@hooks/useReportTransactionsCollection';
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
import {duplicateReport as duplicateReportAction, duplicateExpenseTransaction as duplicateTransactionAction} from '@libs/actions/IOU/Duplicate';
import {openOldDotLink} from '@libs/actions/Link';
import {setupMergeTransactionDataAndNavigate} from '@libs/actions/MergeTransaction';
import {turnOffMobileSelectionMode} from '@libs/actions/MobileSelectionMode';
import {deleteAppReport, exportReportToCSV, exportReportToPDF, exportToIntegration, markAsManuallyExported} from '@libs/actions/Report';
import {getExportTemplates, queueExportSearchWithTemplate, search} from '@libs/actions/Search';
import initSplitExpense from '@libs/actions/SplitExpenses';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import getPlatform from '@libs/getPlatform';
import {getExistingTransactionID} from '@libs/IOUUtils';
import Log from '@libs/Log';
import {getAllNonDeletedTransactions, getTotalAmountForIOUReportPreviewButton} from '@libs/MoneyRequestReportUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {ReportsSplitNavigatorParamList, RightModalNavigatorParamList} from '@libs/Navigation/types';
import {
    buildOptimisticNextStepForDEWOffline,
    buildOptimisticNextStepForDynamicExternalWorkflowApproveError,
    buildOptimisticNextStepForDynamicExternalWorkflowSubmitError,
    buildOptimisticNextStepForStrictPolicyRuleViolations,
    getReportNextStep,
} from '@libs/NextStepUtils';
import type {KYCFlowEvent, TriggerKYCFlow} from '@libs/PaymentUtils';
import {handleUnvalidatedAccount, selectPaymentType} from '@libs/PaymentUtils';
import {getConnectedIntegration, getValidConnectedIntegration, hasDynamicExternalWorkflow, isPolicyAccessible, sortPoliciesByName} from '@libs/PolicyUtils';
import {
    getFilteredReportActionsForReportView,
    getIOUActionForTransactionID,
    getOneTransactionThreadReportID,
    getOriginalMessage,
    hasPendingDEWApprove,
    hasPendingDEWSubmit,
    hasRequestFromCurrentAccount,
    isMoneyRequestAction,
} from '@libs/ReportActionsUtils';
import {getReportPrimaryAction} from '@libs/ReportPrimaryActionUtils';
import {getSecondaryExportReportActions, getSecondaryReportActions} from '@libs/ReportSecondaryActionUtils';
import {
    canEditFieldOfMoneyRequest,
    canUserPerformWriteAction as canUserPerformWriteActionReportUtils,
    changeMoneyRequestHoldStatus,
    generateReportID,
    getAddExpenseDropdownOptions,
    getAllReportActionsErrorsAndReportActionThatRequiresAttention,
    getIntegrationIcon,
    getIntegrationNameFromExportMessage as getIntegrationNameFromExportMessageUtils,
    getNextApproverAccountID,
    getNonHeldAndFullAmount,
    getPolicyExpenseChat,
    getReasonAndReportActionThatRequiresAttention,
    hasHeldExpenses as hasHeldExpensesReportUtils,
    hasOnlyHeldExpenses as hasOnlyHeldExpensesReportUtils,
    hasOnlyNonReimbursableTransactions,
    hasUpdatedTotal,
    hasViolations as hasViolationsReportUtils,
    isAllowedToApproveExpenseReport,
    isCurrentUserSubmitter,
    isDM,
    isExported as isExportedUtils,
    isInvoiceReport as isInvoiceReportUtil,
    isIOUReport as isIOUReportUtil,
    isOpenExpenseReport,
    isOpenReport,
    isReportOwner,
    isSelfDM,
    navigateOnDeleteExpense,
    navigateToDetailsPage,
    shouldBlockSubmitDueToStrictPolicyRules,
} from '@libs/ReportUtils';
import shouldPopoverUseScrollView from '@libs/shouldPopoverUseScrollView';
import {shouldRestrictUserBillableActions} from '@libs/SubscriptionUtils';
import type {SkeletonSpanReasonAttributes} from '@libs/telemetry/useSkeletonSpan';
import {
    getChildTransactions,
    getOriginalTransactionWithSplitInfo,
    hasAnyPendingRTERViolation as hasAnyPendingRTERViolationTransactionUtils,
    hasCustomUnitOutOfPolicyViolation as hasCustomUnitOutOfPolicyViolationTransactionUtils,
    isDistanceRequest,
    isExpensifyCardTransaction,
    isPending,
    isPerDiemRequest,
    isTransactionPendingDelete,
} from '@libs/TransactionUtils';
import {
    approveMoneyRequest,
    canApproveIOU,
    cancelPayment,
    canIOUBePaid as canIOUBePaidAction,
    getNavigationUrlOnMoneyRequestDelete,
    payInvoice,
    payMoneyRequest,
    reopenReport,
    retractReport,
    startMoneyRequest,
    submitReport,
    unapproveExpenseReport,
} from '@userActions/IOU';
import {setDeleteTransactionNavigateBackUrl} from '@userActions/Report';
import {markPendingRTERTransactionsAsCash} from '@userActions/Transaction';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type * as OnyxTypes from '@src/types/onyx';
import type {PaymentMethodType} from '@src/types/onyx/OriginalMessage';
import ButtonWithDropdownMenu from './ButtonWithDropdownMenu';
import type {ButtonWithDropdownMenuRef, DropdownOption} from './ButtonWithDropdownMenu/types';
import {useDelegateNoAccessActions, useDelegateNoAccessState} from './DelegateNoAccessModalProvider';
import HeaderLoadingBar from './HeaderLoadingBar';
import HeaderWithBackButton from './HeaderWithBackButton';
import {KYCWallContext} from './KYCWall/KYCWallContext';
import {useLockedAccountActions, useLockedAccountState} from './LockedAccountModalProvider';
import {ModalActions} from './Modal/Global/ModalContext';
import MoneyReportHeaderEducationalModals from './MoneyReportHeaderEducationalModals';
import type {RejectModalAction} from './MoneyReportHeaderEducationalModals';
import MoneyReportHeaderKYCDropdown from './MoneyReportHeaderKYCDropdown';
import MoneyReportHeaderPrimaryAction from './MoneyReportHeaderPrimaryAction';
import MoneyReportHeaderStatusBar from './MoneyReportHeaderStatusBar';
import MoneyReportHeaderStatusBarSection from './MoneyReportHeaderStatusBarSection';
import MoneyReportHeaderStatusBarSkeleton from './MoneyReportHeaderStatusBarSkeleton';
import MoneyRequestReportNavigation from './MoneyRequestReportView/MoneyRequestReportNavigation';
import {usePersonalDetails} from './OnyxListItemProvider';
import type {PopoverMenuItem} from './PopoverMenu';
import type {ActionHandledType} from './ProcessMoneyReportHoldMenu';
import ProcessMoneyReportHoldMenu from './ProcessMoneyReportHoldMenu';
import ReportPDFDownloadModal from './ReportPDFDownloadModal';
import {useSearchActionsContext, useSearchStateContext} from './Search/SearchContext';
import type {PaymentActionParams} from './SettlementButton/types';
import Text from './Text';

type MoneyReportHeaderProps = {
    /** The reportID of the report currently being looked at */
    reportID: string | undefined;

    /** Whether back button should be displayed in header */
    shouldDisplayBackButton?: boolean;

    /** Method to trigger when pressing close button of the header */
    onBackButtonPress: () => void;
};

function MoneyReportHeader({reportID: reportIDProp, shouldDisplayBackButton = false, onBackButtonPress}: MoneyReportHeaderProps) {
    const [moneyRequestReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportIDProp}`);
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${getNonEmptyStringOnyxID(moneyRequestReport?.policyID)}`);
    const [reportMetadataInternal] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportIDProp}`);
    const isLoadingInitialReportActions = reportMetadataInternal?.isLoadingInitialReportActions;
    const {reportActions: unfilteredReportActions} = usePaginatedReportActions(moneyRequestReport?.reportID);
    const reportActions = getFilteredReportActionsForReportView(unfilteredReportActions);

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
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const {login: currentUserLogin, accountID, email} = currentUserPersonalDetails;
    const personalDetails = usePersonalDetails();
    const defaultExpensePolicy = useDefaultExpensePolicy();
    const activePolicyExpenseChat = getPolicyExpenseChat(accountID, defaultExpensePolicy?.id);
    const [ownerBillingGracePeriodEnd] = useOnyx(ONYXKEYS.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END);
    const [userBillingGracePeriodEnds] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_USER_BILLING_GRACE_PERIOD_END);
    const [chatReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${moneyRequestReport?.chatReportID}`);
    const {isOffline} = useNetwork();
    const allReportTransactions = useReportTransactionsCollection(reportIDProp);
    const nonDeletedTransactions = getAllNonDeletedTransactions(allReportTransactions, reportActions, isOffline, true);
    const visibleTransactionsForThreadID = nonDeletedTransactions?.filter((t) => isOffline || t.pendingAction !== 'delete');
    const reportTransactionIDs = visibleTransactionsForThreadID?.map((t) => t.transactionID);
    const transactionThreadReportID = getOneTransactionThreadReportID(moneyRequestReport, chatReport, reportActions ?? [], isOffline, reportTransactionIDs);
    const [nextStep] = useOnyx(`${ONYXKEYS.COLLECTION.NEXT_STEP}${moneyRequestReport?.reportID}`);
    const [isUserValidated] = useOnyx(ONYXKEYS.ACCOUNT, {
        selector: isUserValidatedSelector,
    });
    const [delegateEmail] = useOnyx(ONYXKEYS.ACCOUNT, {selector: delegateEmailSelector});
    const [transactionThreadReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReportID}`);
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const [bankAccountList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST);
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID);
    const [amountOwed] = useOnyx(ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED);

    const activePolicy = usePolicy(activePolicyID);
    const [integrationsExportTemplates] = useOnyx(ONYXKEYS.NVP_INTEGRATION_SERVER_EXPORT_TEMPLATES);
    const [csvExportLayouts] = useOnyx(ONYXKEYS.NVP_CSV_EXPORT_LAYOUTS);
    const [selfDMReportID] = useOnyx(ONYXKEYS.SELF_DM_REPORT_ID);
    const [selfDMReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${selfDMReportID}`);
    const {getCurrencyDecimals} = useCurrencyListActions();

    const expensifyIcons = useMemoizedLazyExpensifyIcons([
        'Building',
        'Buildings',
        'Plus',
        'Cash',
        'Stopwatch',
        'Send',
        'Clear',
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
        'Download',
        'XeroSquare',
        'QBOSquare',
        'NetSuiteSquare',
        'IntacctSquare',
        'QBDSquare',
        'CertiniaSquare',
        'Feed',
        'Location',
        'ReceiptPlus',
        'ExpenseCopy',
        'Checkmark',
        'ReportCopy',
        'Printer',
        'DocumentMerge',
    ]);
    const [lastDistanceExpenseType] = useOnyx(ONYXKEYS.NVP_LAST_DISTANCE_EXPENSE_TYPE);
    const [reportMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${moneyRequestReport?.reportID}`);
    const [transactionDrafts] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_DRAFT, {
        selector: validTransactionDraftsSelector,
    });
    const draftTransactionIDs = Object.keys(transactionDrafts ?? {});

    const {translate, localeCompare} = useLocalize();
    const {isProduction} = useEnvironment();
    const exportTemplates = useMemo(
        () => getExportTemplates(integrationsExportTemplates ?? [], csvExportLayouts ?? {}, translate, policy),
        [integrationsExportTemplates, csvExportLayouts, policy, translate],
    );
    const {areStrictPolicyRulesEnabled} = useStrictPolicyRules();
    const [allPolicyCategories] = useOnyx(ONYXKEYS.COLLECTION.POLICY_CATEGORIES);

    const requestParentReportAction = useMemo(() => {
        if (!reportActions || !transactionThreadReport?.parentReportActionID) {
            return null;
        }
        return reportActions.find((action): action is OnyxTypes.ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU> => action.reportActionID === transactionThreadReport.parentReportActionID);
    }, [reportActions, transactionThreadReport?.parentReportActionID]);

    const {iouReport, chatReport: chatIOUReport, isChatIOUReportArchived} = useGetIOUReportFromReportAction(requestParentReportAction);

    const {transactions: reportTransactions, violations} = useTransactionsAndViolationsForReport(moneyRequestReport?.reportID);

    const {transactions, nonPendingDeleteTransactions} = useMemo(() => {
        const all: OnyxTypes.Transaction[] = [];
        const filtered: OnyxTypes.Transaction[] = [];
        for (const transaction of Object.values(reportTransactions)) {
            all.push(transaction);
            if (!isTransactionPendingDelete(transaction)) {
                filtered.push(transaction);
            }
        }
        return {transactions: all, nonPendingDeleteTransactions: filtered};
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
    const [transaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${getNonEmptyStringOnyxID(iouTransactionID)}`);

    const [dismissedRejectUseExplanation] = useOnyx(ONYXKEYS.NVP_DISMISSED_REJECT_USE_EXPLANATION);
    const [dismissedHoldUseExplanation] = useOnyx(ONYXKEYS.NVP_DISMISSED_HOLD_USE_EXPLANATION);

    const [invoiceReceiverPolicy] = useOnyx(
        `${ONYXKEYS.COLLECTION.POLICY}${chatReport?.invoiceReceiver && 'policyID' in chatReport.invoiceReceiver ? chatReport.invoiceReceiver.policyID : undefined}`,
        {},
    );

    const {duplicateTransactions, duplicateTransactionViolations} = useDuplicateTransactionsAndViolations(transactions.map((t) => t.transactionID));
    const {deleteTransactions} = useDeleteTransactions({
        report: chatReport,
        reportActions,
        policy,
    });
    const isExported = useMemo(() => isExportedUtils(reportActions, moneyRequestReport), [reportActions, moneyRequestReport]);
    // wrapped in useMemo to improve performance because this is an operation on array
    const integrationNameFromExportMessage = useMemo(() => {
        if (!isExported) {
            return null;
        }
        return getIntegrationNameFromExportMessageUtils(reportActions);
    }, [isExported, reportActions]);

    const transactionViolations = useTransactionViolations(transaction?.transactionID);
    const [isPDFModalVisible, setIsPDFModalVisible] = useState(false);
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [outstandingReportsByPolicyID] = useOnyx(ONYXKEYS.DERIVED.OUTSTANDING_REPORTS_BY_POLICY_ID);
    const currentTransaction = transactions.at(0);
    const [originalIOUTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${getNonEmptyStringOnyxID(currentTransaction?.comment?.originalTransactionID)}`);
    const [originalTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${getNonEmptyStringOnyxID(transaction?.comment?.originalTransactionID)}`);
    const [allTransactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS);
    const {isBetaEnabled} = usePermissions();
    const isASAPSubmitBetaEnabled = isBetaEnabled(CONST.BETAS.ASAP_SUBMIT);
    const isDEWPolicy = hasDynamicExternalWorkflow(policy);
    const hasViolations = hasViolationsReportUtils(moneyRequestReport?.reportID, allTransactionViolations, accountID, email ?? '');
    const hasCustomUnitOutOfPolicyViolation = hasCustomUnitOutOfPolicyViolationTransactionUtils(transactionViolations);
    const isPerDiemRequestOnNonDefaultWorkspace = isPerDiemRequest(transaction) && defaultExpensePolicy?.id !== policy?.id;

    const {showConfirmModal} = useConfirmModal();
    const {triggerExportOrConfirm} = useExportAgainModal(moneyRequestReport?.reportID, moneyRequestReport?.policyID);
    const {showDecisionModal} = useDecisionModal();

    const showOfflineModal = () => {
        showDecisionModal({
            title: translate('common.youAppearToBeOffline'),
            prompt: translate('common.offlinePrompt'),
            secondOptionText: translate('common.buttonConfirm'),
        });
    };

    const showDownloadErrorModal = () => {
        showDecisionModal({
            title: translate('common.downloadFailedTitle'),
            prompt: translate('common.downloadFailedDescription'),
            secondOptionText: translate('common.buttonConfirm'),
        });
    };

    const {isPaidAnimationRunning, isApprovedAnimationRunning, isSubmittingAnimationRunning, startAnimation, stopAnimation, startApprovedAnimation, startSubmittingAnimation} =
        usePaymentAnimations();
    const styles = useThemeStyles();
    const theme = useTheme();
    const {isExpenseSplit} = getOriginalTransactionWithSplitInfo(transaction, originalTransaction);
    const [allTransactions] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION);
    const [allReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT);
    const hasMultipleSplits = useMemo(() => {
        if (!transaction?.comment?.originalTransactionID) {
            return false;
        }
        const children = getChildTransactions(allTransactions, allReports, transaction.comment.originalTransactionID);
        return children.length > 1;
    }, [allTransactions, allReports, transaction?.comment?.originalTransactionID]);
    const isReportOpen = isOpenReport(moneyRequestReport);
    const shouldShowSplitIndicator = isExpenseSplit && (hasMultipleSplits || isReportOpen);

    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [isDuplicateReportActive, temporarilyDisableDuplicateReportAction] = useThrottledButtonState();
    const dropdownMenuRef = useRef<ButtonWithDropdownMenuRef>(null);
    const wasDuplicateReportTriggered = useRef(false);

    const handleOptionsMenuHide = useCallback(() => {
        wasDuplicateReportTriggered.current = false;
    }, []);

    useEffect(() => {
        if (!isDuplicateReportActive || !wasDuplicateReportTriggered.current) {
            return;
        }
        wasDuplicateReportTriggered.current = false;
        dropdownMenuRef.current?.setIsMenuVisible(false);
    }, [isDuplicateReportActive]);

    const [isHoldMenuVisible, setIsHoldMenuVisible] = useState(false);
    const [paymentType, setPaymentType] = useState<PaymentMethodType>();
    const [requestType, setRequestType] = useState<ActionHandledType>();
    const [selectedVBBAToPayFromHoldMenu, setSelectedVBBAToPayFromHoldMenu] = useState<number | undefined>(undefined);
    const canAllowSettlement = hasUpdatedTotal(moneyRequestReport, policy);
    const policyType = policy?.type;
    const connectedIntegration = getValidConnectedIntegration(policy);
    const connectedIntegrationFallback = getConnectedIntegration(policy);
    const hasOnlyPendingTransactions = useMemo(() => {
        return !!transactions && transactions.length > 0 && transactions.every((t) => isExpensifyCardTransaction(t) && isPending(t));
    }, [transactions]);
    const transactionIDs = useMemo(() => transactions?.map((t) => t.transactionID) ?? [], [transactions]);
    const [recentWaypoints] = useOnyx(ONYXKEYS.NVP_RECENT_WAYPOINTS);
    const [quickAction] = useOnyx(ONYXKEYS.NVP_QUICK_ACTION_GLOBAL_CREATE);
    const [isSelfTourViewed = false] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {
        selector: hasSeenTourSelector,
    });

    // Check if any transactions have pending RTER violations (for showing the submit confirmation modal)
    const hasAnyPendingRTERViolation = useMemo(
        () => hasAnyPendingRTERViolationTransactionUtils(transactions, allTransactionViolations, email ?? '', accountID, moneyRequestReport, policy),
        [transactions, allTransactionViolations, email, accountID, moneyRequestReport, policy],
    );

    const hasOnlyHeldExpenses = hasOnlyHeldExpensesReportUtils(moneyRequestReport?.reportID);
    const isArchivedReport = useReportIsArchived(moneyRequestReport?.reportID);
    const isChatReportArchived = useReportIsArchived(chatReport?.reportID);

    const canMoveSingleExpense = useMemo(() => {
        if (nonPendingDeleteTransactions.length !== 1) {
            return false;
        }

        const transactionToMove = nonPendingDeleteTransactions.at(0);
        if (!transactionToMove) {
            return false;
        }

        const iouReportAction = getIOUActionForTransactionID(reportActions, transactionToMove.transactionID);
        const canMoveExpense = canEditFieldOfMoneyRequest({
            reportAction: iouReportAction,
            fieldToEdit: CONST.EDIT_REQUEST_FIELD.REPORT,
            isChatReportArchived,
            outstandingReportsByPolicyID,
            transaction: transactionToMove,
        });

        const canUserPerformWriteAction = canUserPerformWriteActionReportUtils(moneyRequestReport, isChatReportArchived);

        return canMoveExpense && canUserPerformWriteAction;
    }, [nonPendingDeleteTransactions, reportActions, isChatReportArchived, outstandingReportsByPolicyID, moneyRequestReport]);

    const [reportNameValuePairs] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${moneyRequestReport?.reportID}`);
    const getCanIOUBePaid = useCallback(
        (onlyShowPayElsewhere = false) =>
            canIOUBePaidAction(moneyRequestReport, chatReport, policy, bankAccountList, transaction ? [transaction] : undefined, onlyShowPayElsewhere, undefined, invoiceReceiverPolicy),
        [moneyRequestReport, chatReport, policy, bankAccountList, transaction, invoiceReceiverPolicy],
    );

    const isInvoiceReport = isInvoiceReportUtil(moneyRequestReport);
    const isDistanceExpenseUnsupportedForDuplicating = !!(
        isDistanceRequest(transaction) &&
        (isArchivedReport || isChatReportArchived || (activePolicyExpenseChat && (isDM(chatReport) || isSelfDM(chatReport))))
    );

    const shouldDuplicateCloseModalOnSelect =
        isDistanceExpenseUnsupportedForDuplicating ||
        isPerDiemRequestOnNonDefaultWorkspace ||
        hasCustomUnitOutOfPolicyViolation ||
        activePolicyExpenseChat?.iouReportID === moneyRequestReport?.reportID;

    const handleDuplicateReset = useCallback(() => {
        if (shouldDuplicateCloseModalOnSelect) {
            return;
        }
        dropdownMenuRef.current?.setIsMenuVisible(false);
    }, [shouldDuplicateCloseModalOnSelect]);

    const [isDuplicateActive, temporarilyDisableDuplicateAction] = useThrottledButtonState(handleDuplicateReset);

    const [isHoldEducationalModalVisible, setIsHoldEducationalModalVisible] = useState(false);
    const [rejectModalAction, setRejectModalAction] = useState<RejectModalAction | null>(null);

    const {selectedTransactionIDs, currentSearchQueryJSON, currentSearchKey, currentSearchHash, currentSearchResults} = useSearchStateContext();
    const {removeTransaction, clearSelectedTransactions} = useSearchActionsContext();
    const shouldCalculateTotals = useSearchShouldCalculateTotals(currentSearchKey, currentSearchQueryJSON?.hash, true);

    const {isWideRHPDisplayedOnWideLayout, isSuperWideRHPDisplayedOnWideLayout} = useResponsiveLayoutOnWideRHP();

    const shouldDisplayNarrowMoreButton = !shouldDisplayNarrowVersion || isWideRHPDisplayedOnWideLayout || isSuperWideRHPDisplayedOnWideLayout;

    const {showNonReimbursablePaymentErrorModal, shouldBlockDirectPayment, nonReimbursablePaymentErrorDecisionModal} = useNonReimbursablePaymentModal(moneyRequestReport, transactions);

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
            if (isOffline) {
                showDecisionModal({
                    title: translate('common.youAppearToBeOffline'),
                    prompt: translate('common.offlinePrompt'),
                    secondOptionText: translate('common.buttonConfirm'),
                });
                return;
            }

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
        [isOffline, moneyRequestReport, showExportProgressModal, clearSelectedTransactions, showDecisionModal, translate],
    );

    const isOnSearch = route.name.toLowerCase().startsWith('search');
    const {
        options: originalSelectedTransactionsOptions,
        handleDeleteTransactions,
        handleDeleteTransactionsWithNavigation,
    } = useSelectedTransactionsActions({
        report: moneyRequestReport,
        reportActions,
        allTransactionsLength: transactions.length,
        session,
        onExportFailed: showDownloadErrorModal,
        onExportOffline: showOfflineModal,
        policy,
        beginExportWithTemplate: (templateName, templateType, transactionIDList, policyID) => beginExportWithTemplate(templateName, templateType, transactionIDList, policyID),
        isOnSearch,
    });

    const canIOUBePaid = useMemo(() => getCanIOUBePaid(), [getCanIOUBePaid]);
    const reportHasOnlyNonReimbursableTransactions = hasOnlyNonReimbursableTransactions(moneyRequestReport?.reportID, transactions);
    const onlyShowPayElsewhere = useMemo(() => {
        if (reportHasOnlyNonReimbursableTransactions) {
            return false;
        }
        return !canIOUBePaid && getCanIOUBePaid(true);
    }, [canIOUBePaid, getCanIOUBePaid, reportHasOnlyNonReimbursableTransactions]);

    const shouldShowPayButton = isPaidAnimationRunning || canIOUBePaid || onlyShowPayElsewhere || (reportHasOnlyNonReimbursableTransactions && (moneyRequestReport?.total ?? 0) !== 0);

    const shouldShowApproveButton = useMemo(
        () => (canApproveIOU(moneyRequestReport, policy, reportMetadata, transactions) && !hasOnlyPendingTransactions) || isApprovedAnimationRunning,
        [moneyRequestReport, policy, reportMetadata, transactions, hasOnlyPendingTransactions, isApprovedAnimationRunning],
    );

    const shouldDisableApproveButton = shouldShowApproveButton && !isAllowedToApproveExpenseReport(moneyRequestReport);

    const isFromPaidPolicy = policyType === CONST.POLICY.TYPE.TEAM || policyType === CONST.POLICY.TYPE.CORPORATE;

    const {shouldShowStatusBar, statusBarType} = useMoneyReportHeaderStatusBar(reportIDProp, moneyRequestReport?.chatReportID);

    let optimisticNextStep = getReportNextStep(nextStep, moneyRequestReport, transactions, policy, allTransactionViolations, email ?? '', accountID);

    // Check for DEW submit/approve failed or pending - show appropriate next step
    if (isDEWPolicy && (moneyRequestReport?.statusNum === CONST.REPORT.STATUS_NUM.OPEN || moneyRequestReport?.statusNum === CONST.REPORT.STATUS_NUM.SUBMITTED)) {
        if (moneyRequestReport?.statusNum === CONST.REPORT.STATUS_NUM.OPEN) {
            const reportActionsObject = reportActions.reduce<OnyxTypes.ReportActions>((acc, action) => {
                if (action.reportActionID) {
                    acc[action.reportActionID] = action;
                }
                return acc;
            }, {});
            const {errors} = getAllReportActionsErrorsAndReportActionThatRequiresAttention(moneyRequestReport, reportActionsObject);

            if (errors?.dewSubmitFailed) {
                optimisticNextStep = buildOptimisticNextStepForDynamicExternalWorkflowSubmitError(theme.danger);
            } else if (isOffline && hasPendingDEWSubmit(reportMetadata, isDEWPolicy)) {
                optimisticNextStep = buildOptimisticNextStepForDEWOffline();
            }
        } else if (moneyRequestReport?.statusNum === CONST.REPORT.STATUS_NUM.SUBMITTED) {
            const gbrResult = getReasonAndReportActionThatRequiresAttention(moneyRequestReport, undefined, isArchivedReport);
            const hasDEWApproveFailed = gbrResult?.reason === CONST.REQUIRES_ATTENTION_REASONS.HAS_DEW_APPROVE_FAILED;
            const isCurrentUserTheApprover = moneyRequestReport?.managerID === accountID;
            if (hasDEWApproveFailed && isCurrentUserTheApprover) {
                optimisticNextStep = buildOptimisticNextStepForDynamicExternalWorkflowApproveError(theme.danger);
            } else if (isOffline && hasPendingDEWApprove(reportMetadata, isDEWPolicy)) {
                optimisticNextStep = buildOptimisticNextStepForDEWOffline();
            }
        }
    }

    if (isBlockSubmitDueToStrictPolicyRules && isReportOwner(moneyRequestReport) && isOpenExpenseReport(moneyRequestReport)) {
        optimisticNextStep = buildOptimisticNextStepForStrictPolicyRuleViolations();
    }

    const shouldShowNextStep = isFromPaidPolicy && !isInvoiceReport && !shouldShowStatusBar;
    const {nonHeldAmount, fullAmount, hasValidNonHeldAmount} = getNonHeldAndFullAmount(moneyRequestReport, shouldShowPayButton);
    const isAnyTransactionOnHold = hasHeldExpensesReportUtils(moneyRequestReport?.reportID);
    const {isDelegateAccessRestricted} = useDelegateNoAccessState();
    const {showDelegateNoAccessModal} = useDelegateNoAccessActions();
    const {isAccountLocked} = useLockedAccountState();
    const {showLockedAccountModal} = useLockedAccountActions();
    const [policyRecentlyUsedCurrencies] = useOnyx(ONYXKEYS.RECENTLY_USED_CURRENCIES);
    const kycWallRef = useContext(KYCWallContext);
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const isReportInRHP = route.name !== SCREENS.REPORT;
    const shouldDisplaySearchRouter = !isReportInRHP || isSmallScreenWidth;
    const isReportInSearch = route.name === SCREENS.RIGHT_MODAL.SEARCH_REPORT || route.name === SCREENS.RIGHT_MODAL.SEARCH_MONEY_REQUEST_REPORT;
    const isReportSubmitter = isCurrentUserSubmitter(chatIOUReport);
    const isChatReportDM = isDM(chatReport);

    const existingB2BInvoiceReport = useParticipantsInvoiceReport(activePolicyID, CONST.REPORT.INVOICE_RECEIVER_TYPE.BUSINESS, chatReport?.policyID);
    const isSelectionModePaymentRef = useRef(false);
    const confirmPayment = useCallback(
        ({paymentType: type, payAsBusiness, methodID, paymentMethod}: PaymentActionParams) => {
            if (!type || !chatReport) {
                return;
            }
            if (shouldBlockDirectPayment(type)) {
                showNonReimbursablePaymentErrorModal();
                return;
            }
            setPaymentType(type);
            setRequestType(CONST.IOU.REPORT_ACTION_TYPE.PAY);
            const isFromSelectionMode = isSelectionModePaymentRef.current;
            if (isDelegateAccessRestricted) {
                showDelegateNoAccessModal();
            } else if (isAnyTransactionOnHold) {
                setSelectedVBBAToPayFromHoldMenu(type === CONST.IOU.PAYMENT_TYPE.VBBA ? methodID : undefined);
                if (getPlatform() === CONST.PLATFORM.IOS) {
                    // InteractionManager delays modal until current interaction completes, preventing visual glitches on iOS
                    // eslint-disable-next-line @typescript-eslint/no-deprecated
                    InteractionManager.runAfterInteractions(() => setIsHoldMenuVisible(true));
                } else {
                    setIsHoldMenuVisible(true);
                }
            } else if (isInvoiceReport) {
                if (!isFromSelectionMode) {
                    startAnimation();
                }
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
                    betas,
                    isSelfTourViewed,
                });
                if (isFromSelectionMode) {
                    clearSelectedTransactions(true);
                }
            } else {
                if (!isFromSelectionMode) {
                    startAnimation();
                }
                payMoneyRequest({
                    paymentType: type,
                    chatReport,
                    iouReport: moneyRequestReport,
                    introSelected,
                    iouReportCurrentNextStepDeprecated: nextStep,
                    currentUserAccountID: accountID,
                    activePolicy,
                    policy,
                    betas,
                    isSelfTourViewed,
                    userBillingGracePeriodEnds,
                    amountOwed,
                    ownerBillingGracePeriodEnd,
                    methodID: type === CONST.IOU.PAYMENT_TYPE.VBBA ? methodID : undefined,
                    onPaid: () => {
                        if (isFromSelectionMode) {
                            return;
                        }
                        startAnimation();
                    },
                });
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
                if (isFromSelectionMode) {
                    clearSelectedTransactions(true);
                }
            }
        },
        [
            chatReport,
            isDelegateAccessRestricted,
            isAnyTransactionOnHold,
            isInvoiceReport,
            showDelegateNoAccessModal,
            showNonReimbursablePaymentErrorModal,
            shouldBlockDirectPayment,
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
            betas,
            isSelfTourViewed,
            userBillingGracePeriodEnds,
            clearSelectedTransactions,
            amountOwed,
            ownerBillingGracePeriodEnd,
        ],
    );

    useEffect(() => {
        if (selectedTransactionIDs.length !== 0) {
            return;
        }
        isSelectionModePaymentRef.current = false;
    }, [selectedTransactionIDs.length]);

    const confirmApproval = useCallback(
        (skipAnimation = false) => {
            setRequestType(CONST.IOU.REPORT_ACTION_TYPE.APPROVE);
            if (isDelegateAccessRestricted) {
                showDelegateNoAccessModal();
            } else if (isAnyTransactionOnHold) {
                setIsHoldMenuVisible(true);
            } else {
                if (!skipAnimation) {
                    startApprovedAnimation();
                }
                approveMoneyRequest({
                    expenseReport: moneyRequestReport,
                    policy,
                    currentUserAccountIDParam: accountID,
                    currentUserEmailParam: email ?? '',
                    hasViolations,
                    isASAPSubmitBetaEnabled,
                    expenseReportCurrentNextStepDeprecated: nextStep,
                    betas,
                    userBillingGracePeriodEnds,
                    amountOwed,
                    ownerBillingGracePeriodEnd,
                    full: true,
                    onApproved: () => {
                        if (skipAnimation) {
                            return;
                        }
                        startApprovedAnimation();
                    },
                });
                if (skipAnimation) {
                    clearSelectedTransactions(true);
                }
            }
        },
        [
            policy,
            isDelegateAccessRestricted,
            showDelegateNoAccessModal,
            isAnyTransactionOnHold,
            startApprovedAnimation,
            moneyRequestReport,
            accountID,
            email,
            hasViolations,
            isASAPSubmitBetaEnabled,
            nextStep,
            betas,
            userBillingGracePeriodEnds,
            amountOwed,
            clearSelectedTransactions,
            ownerBillingGracePeriodEnd,
        ],
    );

    const handleMarkPendingRTERTransactionsAsCash = useCallback(() => {
        markPendingRTERTransactionsAsCash(transactions, allTransactionViolations, reportActions);
    }, [transactions, allTransactionViolations, reportActions]);

    const confirmPendingRTERAndProceed = useConfirmPendingRTERAndProceed(hasAnyPendingRTERViolation, handleMarkPendingRTERTransactionsAsCash);

    const handleSubmitReport = useCallback(
        (skipAnimation = false) => {
            if (!moneyRequestReport || shouldBlockSubmit) {
                return;
            }

            const doSubmit = () => {
                submitReport({
                    expenseReport: moneyRequestReport,
                    policy,
                    currentUserAccountIDParam: accountID,
                    currentUserEmailParam: email ?? '',
                    hasViolations,
                    isASAPSubmitBetaEnabled,
                    expenseReportCurrentNextStepDeprecated: nextStep,
                    userBillingGracePeriodEnds,
                    amountOwed,
                    onSubmitted: () => {
                        if (skipAnimation) {
                            return;
                        }
                        startSubmittingAnimation();
                    },
                    ownerBillingGracePeriodEnd,
                    delegateEmail,
                });
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
                if (skipAnimation) {
                    clearSelectedTransactions(true);
                }
            };
            confirmPendingRTERAndProceed(doSubmit);
        },
        [
            moneyRequestReport,
            shouldBlockSubmit,
            policy,
            startSubmittingAnimation,
            accountID,
            email,
            hasViolations,
            isASAPSubmitBetaEnabled,
            nextStep,
            userBillingGracePeriodEnds,
            amountOwed,
            currentSearchQueryJSON,
            isOffline,
            currentSearchKey,
            shouldCalculateTotals,
            currentSearchResults?.search?.isLoading,
            clearSelectedTransactions,
            confirmPendingRTERAndProceed,
            ownerBillingGracePeriodEnd,
            delegateEmail,
        ],
    );

    const [allPolicyTags] = useOnyx(ONYXKEYS.COLLECTION.POLICY_TAGS, {selector: passthroughPolicyTagListSelector});
    const targetPolicyTags = useMemo(
        () => (defaultExpensePolicy ? (allPolicyTags?.[`${ONYXKEYS.COLLECTION.POLICY_TAGS}${defaultExpensePolicy.id}`] ?? {}) : {}),
        [defaultExpensePolicy, allPolicyTags],
    );

    const duplicateExpenseTransaction = useCallback(
        (transactionList: OnyxTypes.Transaction[]) => {
            if (!transactionList.length) {
                return;
            }

            const optimisticChatReportID = generateReportID();
            const optimisticIOUReportID = generateReportID();
            const activePolicyCategories = allPolicyCategories?.[`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${defaultExpensePolicy?.id}`] ?? {};

            for (const item of transactionList) {
                const existingTransactionID = getExistingTransactionID(item.linkedTrackedExpenseReportAction);
                const existingTransactionDraft = existingTransactionID ? transactionDrafts?.[existingTransactionID] : undefined;

                duplicateTransactionAction({
                    transaction: item,
                    optimisticChatReportID,
                    optimisticIOUReportID,
                    isASAPSubmitBetaEnabled,
                    introSelected,
                    activePolicyID,
                    quickAction,
                    policyRecentlyUsedCurrencies: policyRecentlyUsedCurrencies ?? [],
                    isSelfTourViewed,
                    customUnitPolicyID: policy?.id,
                    targetPolicy: defaultExpensePolicy ?? undefined,
                    targetPolicyCategories: activePolicyCategories,
                    targetReport: activePolicyExpenseChat,
                    existingTransactionDraft,
                    draftTransactionIDs,
                    betas,
                    personalDetails,
                    recentWaypoints,
                    targetPolicyTags,
                });
            }
        },
        [
            activePolicyExpenseChat,
            activePolicyID,
            allPolicyCategories,
            transactionDrafts,
            defaultExpensePolicy,
            draftTransactionIDs,
            introSelected,
            isASAPSubmitBetaEnabled,
            quickAction,
            policyRecentlyUsedCurrencies,
            policy?.id,
            isSelfTourViewed,
            betas,
            personalDetails,
            recentWaypoints,
            targetPolicyTags,
        ],
    );

    const primaryAction = useMemo(() => {
        return getReportPrimaryAction({
            currentUserLogin: currentUserLogin ?? '',
            currentUserAccountID: accountID,
            report: moneyRequestReport,
            chatReport,
            reportTransactions: nonPendingDeleteTransactions,
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
        nonPendingDeleteTransactions,
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

    const getAmount = (actionType: ValueOf<typeof CONST.REPORT.REPORT_PREVIEW_ACTIONS>) => ({
        formattedAmount: getTotalAmountForIOUReportPreviewButton(moneyRequestReport, policy, actionType, nonPendingDeleteTransactions),
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

    const activeAdminPolicies = useActiveAdminPolicies();

    const workspacePolicyOptions = useMemo(() => {
        if (!isIOUReportUtil(moneyRequestReport)) {
            return [];
        }

        const hasPersonalPaymentOption = paymentButtonOptions.some((opt) => opt.value === CONST.IOU.PAYMENT_TYPE.EXPENSIFY);
        if (!hasPersonalPaymentOption || !activeAdminPolicies.length) {
            return [];
        }

        const canUseBusinessBankAccount = moneyRequestReport?.reportID && !hasRequestFromCurrentAccount(moneyRequestReport.reportID, accountID ?? CONST.DEFAULT_NUMBER_ID);
        if (!canUseBusinessBankAccount) {
            return [];
        }

        return sortPoliciesByName(activeAdminPolicies, localeCompare);
    }, [moneyRequestReport, paymentButtonOptions, activeAdminPolicies, accountID, localeCompare]);

    const buildPaymentSubMenuItems = useCallback(
        (onWorkspaceSelected: (workspacePolicy: OnyxTypes.Policy) => void): PopoverMenuItem[] => {
            if (!workspacePolicyOptions.length) {
                return Object.values(paymentButtonOptions);
            }

            const result: PopoverMenuItem[] = [];
            for (const opt of Object.values(paymentButtonOptions)) {
                result.push(opt);
                if (opt.value === CONST.IOU.PAYMENT_TYPE.EXPENSIFY) {
                    for (const wp of workspacePolicyOptions) {
                        result.push({
                            text: translate('iou.payWithPolicy', truncate(wp.name, {length: CONST.ADDITIONAL_ALLOWED_CHARACTERS}), ''),
                            icon: expensifyIcons.Building,
                            onSelected: () => onWorkspaceSelected(wp),
                        });
                    }
                }
            }

            return result;
        },
        [workspacePolicyOptions, paymentButtonOptions, translate, expensifyIcons.Building],
    );

    const addExpenseDropdownOptions = useMemo(
        () =>
            getAddExpenseDropdownOptions({
                translate,
                icons: expensifyIcons,
                iouReportID: moneyRequestReport?.reportID,
                policy,
                userBillingGracePeriodEnds,
                draftTransactionIDs,
                amountOwed,
                ownerBillingGracePeriodEnd,
                lastDistanceExpenseType,
            }),
        [moneyRequestReport?.reportID, policy, userBillingGracePeriodEnds, amountOwed, lastDistanceExpenseType, expensifyIcons, translate, ownerBillingGracePeriodEnd, draftTransactionIDs],
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
                        showDecisionModal({
                            title: translate('common.youAppearToBeOffline'),
                            prompt: translate('common.offlinePrompt'),
                            secondOptionText: translate('common.buttonConfirm'),
                        });
                        return;
                    }
                    exportReportToCSV(
                        {
                            reportID: moneyRequestReport.reportID,
                            transactionIDList: transactionIDs,
                        },
                        () => {
                            showDecisionModal({
                                title: translate('common.downloadFailedTitle'),
                                prompt: translate('common.downloadFailedDescription'),
                                secondOptionText: translate('common.buttonConfirm'),
                            });
                        },
                        translate,
                    );
                },
            },
            [CONST.REPORT.EXPORT_OPTIONS.EXPORT_TO_INTEGRATION]: {
                text: translate('workspace.common.exportIntegrationSelected', {
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    connectionName: connectedIntegrationFallback!,
                }),
                icon: (() => {
                    return getIntegrationIcon(connectedIntegration ?? connectedIntegrationFallback, expensifyIcons);
                })(),
                displayInDefaultIconColor: true,
                additionalIconStyles: styles.integrationIcon,
                value: CONST.REPORT.EXPORT_OPTIONS.EXPORT_TO_INTEGRATION,
                sentryLabel: CONST.SENTRY_LABEL.MORE_MENU.EXPORT_FILE,
                onSelected: () => {
                    if (!connectedIntegration || !moneyRequestReport) {
                        return;
                    }
                    if (isExported) {
                        triggerExportOrConfirm(CONST.REPORT.EXPORT_OPTIONS.EXPORT_TO_INTEGRATION);
                        return;
                    }
                    exportToIntegration(moneyRequestReport?.reportID, connectedIntegration);
                },
            },
            [CONST.REPORT.EXPORT_OPTIONS.MARK_AS_EXPORTED]: {
                text: translate('workspace.common.markAsExported'),
                icon: (() => {
                    return getIntegrationIcon(connectedIntegration ?? connectedIntegrationFallback, expensifyIcons);
                })(),
                additionalIconStyles: styles.integrationIcon,
                displayInDefaultIconColor: true,
                value: CONST.REPORT.EXPORT_OPTIONS.MARK_AS_EXPORTED,
                sentryLabel: CONST.SENTRY_LABEL.MORE_MENU.EXPORT_FILE,
                onSelected: () => {
                    if (!connectedIntegration || !moneyRequestReport) {
                        return;
                    }
                    if (isExported) {
                        triggerExportOrConfirm(CONST.REPORT.EXPORT_OPTIONS.MARK_AS_EXPORTED);
                        return;
                    }
                    markAsManuallyExported([moneyRequestReport?.reportID ?? CONST.DEFAULT_NUMBER_ID], connectedIntegration);
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
    }, [
        translate,
        expensifyIcons,
        connectedIntegrationFallback,
        styles.integrationIcon,
        moneyRequestReport,
        isOffline,
        transactionIDs,
        connectedIntegration,
        isExported,
        exportTemplates,
        beginExportWithTemplate,
        triggerExportOrConfirm,
        showDecisionModal,
    ]);

    const primaryActionComponent = (
        <MoneyReportHeaderPrimaryAction
            reportID={reportIDProp}
            chatReportID={chatReport?.reportID}
            primaryAction={primaryAction}
            isPaidAnimationRunning={isPaidAnimationRunning}
            isApprovedAnimationRunning={isApprovedAnimationRunning}
            isSubmittingAnimationRunning={isSubmittingAnimationRunning}
            stopAnimation={stopAnimation}
            startAnimation={startAnimation}
            startApprovedAnimation={startApprovedAnimation}
            startSubmittingAnimation={startSubmittingAnimation}
            onHoldMenuOpen={(type, payType, methodID) => {
                setRequestType(type as ActionHandledType);
                setPaymentType(payType);
                setSelectedVBBAToPayFromHoldMenu(payType === CONST.IOU.PAYMENT_TYPE.VBBA ? methodID : undefined);
                if (getPlatform() === CONST.PLATFORM.IOS) {
                    // InteractionManager delays modal until current interaction completes, preventing visual glitches on iOS
                    // eslint-disable-next-line @typescript-eslint/no-deprecated
                    InteractionManager.runAfterInteractions(() => setIsHoldMenuVisible(true));
                } else {
                    setIsHoldMenuVisible(true);
                }
            }}
            onExportModalOpen={() => triggerExportOrConfirm(CONST.REPORT.EXPORT_OPTIONS.EXPORT_TO_INTEGRATION)}
        />
    );

    const secondaryActions = useMemo(() => {
        if (!moneyRequestReport) {
            return [];
        }
        return getSecondaryReportActions({
            currentUserLogin: currentUserLogin ?? '',
            currentUserAccountID: accountID,
            report: moneyRequestReport,
            chatReport,
            reportTransactions: nonPendingDeleteTransactions,
            originalTransaction: originalIOUTransaction,
            violations,
            bankAccountList,
            policy,
            reportNameValuePairs,
            reportActions,
            reportMetadata,
            policies,
            outstandingReportsByPolicyID,
            isChatReportArchived,
        });
    }, [
        moneyRequestReport,
        currentUserLogin,
        accountID,
        chatReport,
        nonPendingDeleteTransactions,
        originalIOUTransaction,
        violations,
        policy,
        reportNameValuePairs,
        reportActions,
        reportMetadata,
        policies,
        isChatReportArchived,
        bankAccountList,
        outstandingReportsByPolicyID,
    ]);

    const secondaryExportActions = useMemo(() => {
        if (!moneyRequestReport) {
            return [];
        }
        return getSecondaryExportReportActions(accountID, email ?? '', moneyRequestReport, bankAccountList, policy, exportTemplates);
    }, [moneyRequestReport, accountID, email, policy, exportTemplates, bankAccountList]);

    const hasSubmitAction = primaryAction === CONST.REPORT.PRIMARY_ACTIONS.SUBMIT || secondaryActions.includes(CONST.REPORT.SECONDARY_ACTIONS.SUBMIT);
    const hasApproveAction = primaryAction === CONST.REPORT.PRIMARY_ACTIONS.APPROVE || secondaryActions.includes(CONST.REPORT.SECONDARY_ACTIONS.APPROVE);
    const hasPayAction = primaryAction === CONST.REPORT.PRIMARY_ACTIONS.PAY || secondaryActions.includes(CONST.REPORT.SECONDARY_ACTIONS.PAY);

    const checkForNecessaryAction = useCallback(() => {
        if (isDelegateAccessRestricted) {
            showDelegateNoAccessModal();
            return true;
        }
        if (isAccountLocked) {
            showLockedAccountModal();
            return true;
        }
        if (!isUserValidated) {
            handleUnvalidatedAccount(moneyRequestReport);
            return true;
        }
        return false;
    }, [isDelegateAccessRestricted, showDelegateNoAccessModal, isAccountLocked, showLockedAccountModal, isUserValidated, moneyRequestReport]);

    const selectionModeReportLevelActions = useMemo(() => {
        if (isProduction) {
            return [];
        }
        const actions: Array<DropdownOption<string> & Pick<PopoverMenuItem, 'backButtonText' | 'rightIcon'>> = [];
        if (hasSubmitAction && !shouldBlockSubmit) {
            actions.push({
                text: translate('common.submit'),
                icon: expensifyIcons.Send,
                value: CONST.REPORT.PRIMARY_ACTIONS.SUBMIT,
                onSelected: () => handleSubmitReport(true),
            });
        }
        if (hasApproveAction && !isBlockSubmitDueToPreventSelfApproval) {
            actions.push({
                text: translate('iou.approve'),
                icon: expensifyIcons.ThumbsUp,
                value: CONST.REPORT.PRIMARY_ACTIONS.APPROVE,
                onSelected: () => {
                    isSelectionModePaymentRef.current = true;
                    confirmApproval(true);
                },
            });
        }
        if (hasPayAction && !(isOffline && !canAllowSettlement)) {
            actions.push({
                text: translate('iou.settlePayment', totalAmount),
                icon: expensifyIcons.Cash,
                value: CONST.REPORT.PRIMARY_ACTIONS.PAY,
                rightIcon: expensifyIcons.ArrowRight,
                backButtonText: translate('iou.settlePayment', totalAmount),
                subMenuItems: buildPaymentSubMenuItems((wp) => {
                    isSelectionModePaymentRef.current = true;
                    if (checkForNecessaryAction()) {
                        return;
                    }
                    kycWallRef.current?.continueAction?.({policy: wp});
                }),
                onSelected: () => {
                    isSelectionModePaymentRef.current = true;
                },
            });
        }
        return actions;
    }, [
        isProduction,
        hasSubmitAction,
        shouldBlockSubmit,
        hasApproveAction,
        isBlockSubmitDueToPreventSelfApproval,
        hasPayAction,
        isOffline,
        canAllowSettlement,
        translate,
        handleSubmitReport,
        confirmApproval,
        totalAmount,
        buildPaymentSubMenuItems,
        checkForNecessaryAction,
        expensifyIcons.ArrowRight,
        expensifyIcons.Cash,
        expensifyIcons.Send,
        expensifyIcons.ThumbsUp,
        kycWallRef,
    ]);

    const connectedIntegrationName = connectedIntegration
        ? translate('workspace.accounting.connectionName', {
              connectionName: connectedIntegration,
          })
        : '';
    const unapproveWarningText = useMemo(
        () => (
            <Text>
                <Text style={[styles.textStrong, styles.noWrap]}>{translate('iou.headsUp')}</Text> <Text>{translate('iou.unapproveWithIntegrationWarning', connectedIntegrationName)}</Text>
            </Text>
        ),
        [connectedIntegrationName, styles.noWrap, styles.textStrong, translate],
    );

    const reopenExportedReportWarningText = (
        <Text>
            <Text style={[styles.textStrong, styles.noWrap]}>{translate('iou.headsUp')} </Text>
            <Text>
                {translate('iou.reopenExportedReportConfirmation', {
                    connectionName: integrationNameFromExportMessage ?? '',
                })}
            </Text>
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
            icon: expensifyIcons.Download,
            sentryLabel: CONST.SENTRY_LABEL.MORE_MENU.DOWNLOAD_PDF,
            onSelected: () => {
                if (!moneyRequestReport?.reportID) {
                    return;
                }
                setIsPDFModalVisible(true);
                exportReportToPDF({reportID: moneyRequestReport.reportID});
            },
        },
        [CONST.REPORT.SECONDARY_ACTIONS.PRINT]: {
            value: CONST.REPORT.SECONDARY_ACTIONS.PRINT,
            text: translate('common.print'),
            icon: expensifyIcons.Printer,
            sentryLabel: CONST.SENTRY_LABEL.MORE_MENU.PRINT,
            onSelected: () => {
                if (!moneyRequestReport) {
                    return;
                }
                openOldDotLink(CONST.OLDDOT_URLS.PRINTABLE_REPORT(moneyRequestReport.reportID));
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

                confirmPendingRTERAndProceed(() => {
                    submitReport({
                        expenseReport: moneyRequestReport,
                        policy,
                        currentUserAccountIDParam: accountID,
                        currentUserEmailParam: email ?? '',
                        hasViolations,
                        isASAPSubmitBetaEnabled,
                        expenseReportCurrentNextStepDeprecated: nextStep,
                        userBillingGracePeriodEnds,
                        amountOwed,
                        ownerBillingGracePeriodEnd,
                        delegateEmail,
                    });
                });
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
                    unapproveExpenseReport(moneyRequestReport, policy, accountID, email ?? '', hasViolations, isASAPSubmitBetaEnabled, nextStep, delegateEmail);
                    return;
                }

                unapproveExpenseReport(moneyRequestReport, policy, accountID, email ?? '', hasViolations, isASAPSubmitBetaEnabled, nextStep, delegateEmail);
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
                    changeMoneyRequestHoldStatus(requestParentReportAction, transaction, isOffline);
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

                changeMoneyRequestHoldStatus(requestParentReportAction, transaction, isOffline);
            },
        },
        [CONST.REPORT.SECONDARY_ACTIONS.SPLIT]: {
            text: shouldShowSplitIndicator ? translate('iou.editSplits') : translate('iou.split'),
            icon: expensifyIcons.ArrowSplit,
            value: CONST.REPORT.SECONDARY_ACTIONS.SPLIT,
            sentryLabel: CONST.SENTRY_LABEL.MORE_MENU.SPLIT,
            onSelected: () => {
                if (Number(transactions?.length) !== 1) {
                    return;
                }

                initSplitExpense(currentTransaction, policy);
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

                setupMergeTransactionDataAndNavigate(currentTransaction.transactionID, [currentTransaction], localeCompare, getCurrencyDecimals);
            },
        },
        [CONST.REPORT.SECONDARY_ACTIONS.DUPLICATE_EXPENSE]: {
            text: isDuplicateActive ? translate('common.duplicateExpense') : translate('common.duplicated'),
            icon: isDuplicateActive ? expensifyIcons.ExpenseCopy : expensifyIcons.Checkmark,
            iconFill: isDuplicateActive ? undefined : theme.icon,
            value: CONST.REPORT.SECONDARY_ACTIONS.DUPLICATE_EXPENSE,
            onSelected: () => {
                if (hasCustomUnitOutOfPolicyViolation) {
                    showConfirmModal({
                        title: translate('common.duplicateExpense'),
                        prompt: translate('iou.correctRateError'),
                        confirmText: translate('common.buttonConfirm'),
                        shouldShowCancelButton: false,
                    });
                    return;
                }

                if (isDistanceExpenseUnsupportedForDuplicating) {
                    showConfirmModal({
                        title: translate('common.duplicateExpense'),
                        prompt: translate('iou.cannotDuplicateDistanceExpense'),
                        confirmText: translate('common.buttonConfirm'),
                        shouldShowCancelButton: false,
                    });
                    return;
                }

                if (isPerDiemRequestOnNonDefaultWorkspace) {
                    showConfirmModal({
                        title: translate('common.duplicateExpense'),
                        prompt: translate('iou.duplicateNonDefaultWorkspacePerDiemError'),
                        confirmText: translate('common.buttonConfirm'),
                        shouldShowCancelButton: false,
                    });
                    return;
                }

                if (!isDuplicateActive || !transaction) {
                    return;
                }

                temporarilyDisableDuplicateAction();

                duplicateExpenseTransaction([transaction]);
            },
            shouldCloseModalOnSelect: shouldDuplicateCloseModalOnSelect,
        },
        [CONST.REPORT.SECONDARY_ACTIONS.DUPLICATE_REPORT]: {
            text: isDuplicateReportActive ? translate('common.duplicateReport') : translate('common.duplicated'),
            icon: isDuplicateReportActive ? expensifyIcons.ReportCopy : expensifyIcons.Checkmark,
            iconFill: isDuplicateReportActive ? undefined : theme.icon,
            value: CONST.REPORT.SECONDARY_ACTIONS.DUPLICATE_REPORT,
            sentryLabel: CONST.SENTRY_LABEL.MORE_MENU.DUPLICATE_REPORT,
            shouldShow: !!defaultExpensePolicy,
            shouldCloseModalOnSelect: false,
            onSelected: () => {
                if (!isDuplicateReportActive) {
                    return;
                }

                temporarilyDisableDuplicateReportAction();
                wasDuplicateReportTriggered.current = true;

                const isSourcePolicyValid = !!policy && isPolicyAccessible(policy, currentUserLogin ?? '');
                const targetPolicyForDuplicate = isSourcePolicyValid ? policy : defaultExpensePolicy;
                const targetChatForDuplicate = isSourcePolicyValid ? chatReport : activePolicyExpenseChat;
                const activePolicyCategories = allPolicyCategories?.[`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${targetPolicyForDuplicate?.id}`] ?? {};

                // eslint-disable-next-line @typescript-eslint/no-deprecated
                InteractionManager.runAfterInteractions(() => {
                    duplicateReportAction({
                        sourceReport: moneyRequestReport,
                        sourceReportTransactions: nonPendingDeleteTransactions,
                        sourceReportName: moneyRequestReport?.reportName ?? '',
                        targetPolicy: targetPolicyForDuplicate ?? undefined,
                        targetPolicyCategories: activePolicyCategories,
                        targetPolicyTags: allPolicyTags?.[`${ONYXKEYS.COLLECTION.POLICY_TAGS}${targetPolicyForDuplicate?.id}`] ?? {},
                        parentChatReport: targetChatForDuplicate,
                        ownerPersonalDetails: currentUserPersonalDetails,
                        isASAPSubmitBetaEnabled,
                        betas,
                        personalDetails,
                        quickAction,
                        policyRecentlyUsedCurrencies: policyRecentlyUsedCurrencies ?? [],
                        draftTransactionIDs,
                        isSelfTourViewed,
                        transactionViolations: allTransactionViolations,
                        translate,
                        recentWaypoints: recentWaypoints ?? [],
                    });
                });
            },
        },
        [CONST.REPORT.SECONDARY_ACTIONS.CHANGE_WORKSPACE]: {
            text: translate('iou.changeWorkspace'),
            icon: expensifyIcons.Buildings,
            value: CONST.REPORT.SECONDARY_ACTIONS.CHANGE_WORKSPACE,
            sentryLabel: CONST.SENTRY_LABEL.MORE_MENU.CHANGE_WORKSPACE,
            shouldShow: transactions.length === 0 || nonPendingDeleteTransactions.length > 0,
            onSelected: () => {
                if (!moneyRequestReport) {
                    return;
                }
                Navigation.navigate(ROUTES.REPORT_WITH_ID_CHANGE_WORKSPACE.getRoute(moneyRequestReport.reportID, Navigation.getActiveRoute()));
            },
        },
        [CONST.REPORT.SECONDARY_ACTIONS.MOVE_EXPENSE]: {
            text: translate('iou.moveExpenses'),
            icon: expensifyIcons.DocumentMerge,
            value: CONST.REPORT.SECONDARY_ACTIONS.MOVE_EXPENSE,
            sentryLabel: CONST.SENTRY_LABEL.MORE_MENU.MOVE_EXPENSE,
            shouldShow: canMoveSingleExpense,
            onSelected: () => {
                if (!moneyRequestReport || nonPendingDeleteTransactions.length !== 1) {
                    return;
                }
                const transactionToMove = nonPendingDeleteTransactions.at(0);
                if (!transactionToMove?.transactionID) {
                    return;
                }
                Navigation.navigate(
                    ROUTES.MONEY_REQUEST_EDIT_REPORT.getRoute(
                        CONST.IOU.ACTION.EDIT,
                        CONST.IOU.TYPE.SUBMIT,
                        moneyRequestReport.reportID,
                        true,
                        Navigation.getActiveRoute(),
                        transactionToMove.transactionID,
                    ),
                );
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
                        const deleteNavigateBackUrl = goBackRoute ?? route.params?.backTo ?? Navigation.getActiveRoute();
                        setDeleteTransactionNavigateBackUrl(deleteNavigateBackUrl);
                        if (goBackRoute) {
                            navigateOnDeleteExpense(goBackRoute);
                        }
                        // it's deleting transaction but not the report which leads to bug (that is actually also on staging)
                        // Money request should be deleted when interactions are done, to not show the not found page before navigating to goBackRoute
                        // eslint-disable-next-line @typescript-eslint/no-deprecated
                        InteractionManager.runAfterInteractions(() => {
                            deleteTransactions([transaction.transactionID], duplicateTransactions, duplicateTransactionViolations, isReportInSearch ? currentSearchHash : undefined, false);
                            removeTransaction(transaction.transactionID);
                        });
                    }
                    return;
                }

                const result = await showConfirmModal({
                    title: translate('iou.deleteReport', {count: 1}),
                    prompt: translate('iou.deleteReportConfirmation', {count: 1}),
                    confirmText: translate('common.delete'),
                    cancelText: translate('common.cancel'),
                    danger: true,
                });
                if (result.action !== ModalActions.CONFIRM) {
                    return;
                }
                const backToRoute = route.params?.backTo ?? (chatReport?.reportID ? ROUTES.REPORT_WITH_ID.getRoute(chatReport.reportID) : undefined);
                const deleteNavigateBackUrl = backToRoute ?? Navigation.getActiveRoute();
                setDeleteTransactionNavigateBackUrl(deleteNavigateBackUrl);

                Navigation.setNavigationActionToMicrotaskQueue(() => {
                    Navigation.goBack(backToRoute);
                    // eslint-disable-next-line @typescript-eslint/no-deprecated
                    InteractionManager.runAfterInteractions(() => {
                        deleteAppReport({
                            report: moneyRequestReport,
                            selfDMReport,
                            currentUserEmailParam: email ?? '',
                            currentUserAccountIDParam: accountID,
                            reportTransactions,
                            allTransactionViolations,
                            bankAccountList,
                            hash: currentSearchHash,
                        });
                    });
                });
            },
        },
        [CONST.REPORT.SECONDARY_ACTIONS.RETRACT]: {
            text: translate('iou.retract'),
            icon: expensifyIcons.CircularArrowBackwards,
            value: CONST.REPORT.SECONDARY_ACTIONS.RETRACT,
            sentryLabel: CONST.SENTRY_LABEL.MORE_MENU.RETRACT,
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
                    retractReport(moneyRequestReport, chatReport, policy, accountID, email ?? '', hasViolations, isASAPSubmitBetaEnabled, nextStep, delegateEmail);
                    return;
                }
                retractReport(moneyRequestReport, chatReport, policy, accountID, email ?? '', hasViolations, isASAPSubmitBetaEnabled, nextStep, delegateEmail);
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
                    reopenReport(moneyRequestReport, policy, accountID, email ?? '', hasViolations, isASAPSubmitBetaEnabled, nextStep, chatReport);
                    return;
                }
                reopenReport(moneyRequestReport, policy, accountID, email ?? '', hasViolations, isASAPSubmitBetaEnabled, nextStep, chatReport);
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

                if (moneyRequestReport?.reportID) {
                    Navigation.navigate(ROUTES.REJECT_EXPENSE_REPORT.getRoute(moneyRequestReport.reportID));
                }
            },
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
                if (policy && shouldRestrictUserBillableActions(policy.id, ownerBillingGracePeriodEnd, userBillingGracePeriodEnds, amountOwed, policy)) {
                    Navigation.navigate(ROUTES.RESTRICTED_ACTION.getRoute(policy.id));
                    return;
                }
                startMoneyRequest(CONST.IOU.TYPE.SUBMIT, moneyRequestReport?.reportID, draftTransactionIDs);
            },
        },
        [CONST.REPORT.SECONDARY_ACTIONS.PAY]: {
            text: translate('iou.settlePayment', totalAmount),
            icon: expensifyIcons.Cash,
            rightIcon: expensifyIcons.ArrowRight,
            value: CONST.REPORT.SECONDARY_ACTIONS.PAY,
            backButtonText: translate('iou.settlePayment', totalAmount),
            sentryLabel: CONST.SENTRY_LABEL.MORE_MENU.PAY,
            subMenuItems: buildPaymentSubMenuItems((wp) => {
                kycWallRef.current?.continueAction?.({policy: wp});
            }),
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

    const shouldShowBackButton = shouldDisplayBackButton || shouldUseNarrowLayout;

    const isMobileSelectionModeEnabled = useMobileSelectionMode();

    useEffect(() => {
        return () => {
            turnOffMobileSelectionMode();
        };
    }, []);

    const showDeleteModal = useCallback(() => {
        showConfirmModal({
            title: translate('iou.deleteExpense', {
                count: selectedTransactionIDs.length,
            }),
            prompt: translate('iou.deleteConfirmation', {
                count: selectedTransactionIDs.length,
            }),
            confirmText: translate('common.delete'),
            cancelText: translate('common.cancel'),
            danger: true,
        }).then((result) => {
            if (result.action !== ModalActions.CONFIRM) {
                return;
            }
            if (transactions.filter((trans) => trans.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE).length === selectedTransactionIDs.length) {
                const backToRoute = route.params?.backTo ?? (chatReport?.reportID ? ROUTES.REPORT_WITH_ID.getRoute(chatReport.reportID) : undefined);
                handleDeleteTransactionsWithNavigation(backToRoute);
            } else {
                handleDeleteTransactions();
            }
        });
    }, [
        showConfirmModal,
        translate,
        selectedTransactionIDs.length,
        transactions,
        handleDeleteTransactions,
        handleDeleteTransactionsWithNavigation,
        route.params?.backTo,
        chatReport?.reportID,
    ]);

    const allExpensesSelected = selectedTransactionIDs.length > 0 && selectedTransactionIDs.length === nonPendingDeleteTransactions.length;

    const selectedTransactionsOptions = useMemo(() => {
        const mappedOptions = originalSelectedTransactionsOptions.map((option) => {
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
                        if (isDelegateAccessRestricted) {
                            showDelegateNoAccessModal();
                            return;
                        }
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

        if (allExpensesSelected && selectionModeReportLevelActions.length) {
            return [...selectionModeReportLevelActions, ...mappedOptions];
        }
        return mappedOptions;
    }, [
        originalSelectedTransactionsOptions,
        showDeleteModal,
        dismissedRejectUseExplanation,
        allExpensesSelected,
        selectionModeReportLevelActions,
        isDelegateAccessRestricted,
        showDelegateNoAccessModal,
    ]);

    const shouldShowSelectedTransactionsButton = !!selectedTransactionsOptions.length && !transactionThreadReportID;
    const popoverUseScrollView = shouldPopoverUseScrollView(selectedTransactionsOptions);

    const hasPayInSelectionMode = allExpensesSelected && hasPayAction;

    const makePaymentSelectHandler = useCallback(
        (fromSelectionMode: boolean) => (event: KYCFlowEvent, iouPaymentType: PaymentMethodType, triggerKYCFlow: TriggerKYCFlow) => {
            if (fromSelectionMode) {
                isSelectionModePaymentRef.current = true;
                if (checkForNecessaryAction()) {
                    return;
                }
            }
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
                confirmApproval: () => confirmApproval(),
                iouReport: moneyRequestReport,
                iouReportNextStep: nextStep,
                betas,
                userBillingGracePeriodEnds,
                amountOwed,
                ownerBillingGracePeriodEnd,
            });
        },
        [
            checkForNecessaryAction,
            policy,
            confirmPayment,
            accountID,
            email,
            hasViolations,
            isASAPSubmitBetaEnabled,
            isUserValidated,
            confirmApproval,
            moneyRequestReport,
            nextStep,
            betas,
            userBillingGracePeriodEnds,
            amountOwed,
            ownerBillingGracePeriodEnd,
        ],
    );

    const onSelectionModePaymentSelect = useMemo(() => makePaymentSelectHandler(true), [makePaymentSelectHandler]);

    const onPaymentSelect = useMemo(() => makePaymentSelectHandler(false), [makePaymentSelectHandler]);

    const selectionModeKYCSuccess = useCallback(
        (type?: PaymentMethodType) => {
            isSelectionModePaymentRef.current = true;
            confirmPayment({paymentType: type});
        },
        [confirmPayment],
    );

    const renderSelectionModeDropdown = useCallback(
        (wrapperStyle?: StyleProp<ViewStyle>) =>
            hasPayInSelectionMode ? (
                <MoneyReportHeaderKYCDropdown
                    chatReportID={chatReport?.reportID}
                    iouReport={moneyRequestReport}
                    onPaymentSelect={onSelectionModePaymentSelect}
                    onSuccessfulKYC={selectionModeKYCSuccess}
                    primaryAction={primaryAction}
                    applicableSecondaryActions={selectedTransactionsOptions}
                    customText={translate('workspace.common.selected', {count: selectedTransactionIDs.length})}
                    shouldShowSuccessStyle
                    ref={kycWallRef}
                />
            ) : (
                <ButtonWithDropdownMenu
                    onPress={() => null}
                    options={selectedTransactionsOptions}
                    customText={translate('workspace.common.selected', {count: selectedTransactionIDs.length})}
                    isSplitButton={false}
                    shouldAlwaysShowDropdownMenu
                    shouldPopoverUseScrollView={popoverUseScrollView}
                    wrapperStyle={wrapperStyle}
                />
            ),
        [
            hasPayInSelectionMode,
            chatReport?.reportID,
            moneyRequestReport,
            onSelectionModePaymentSelect,
            selectionModeKYCSuccess,
            primaryAction,
            selectedTransactionsOptions,
            translate,
            selectedTransactionIDs.length,
            kycWallRef,
            popoverUseScrollView,
        ],
    );

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

    const showNextStepBar = shouldShowNextStep && !!optimisticNextStep && (('message' in optimisticNextStep && !!optimisticNextStep.message?.length) || 'messageKey' in optimisticNextStep);
    const showNextStepSkeleton = shouldShowNextStep && !optimisticNextStep && !!isLoadingInitialReportActions && !isOffline;
    const shouldShowMoreContent = showNextStepBar || showNextStepSkeleton || !!statusBarType || isReportInSearch;

    const nextStepSkeletonReasonAttributes: SkeletonSpanReasonAttributes = {
        context: 'MoneyReportHeader',
        shouldShowNextStep,
        isLoadingInitialReportActions: !!isLoadingInitialReportActions,
        isOffline,
        hasOptimisticNextStep: !!optimisticNextStep,
    };

    return (
        <View style={[styles.pt0, styles.borderBottom]}>
            <HeaderWithBackButton
                shouldShowReportAvatarWithDisplay
                shouldDisplayStatus
                shouldShowPinButton={false}
                report={moneyRequestReport}
                policy={policy}
                shouldShowBackButton={shouldShowBackButton}
                shouldDisplaySearchRouter={shouldDisplaySearchRouter}
                shouldDisplayHelpButton={!(isReportInRHP && shouldUseNarrowLayout)}
                onBackButtonPress={onBackButtonPress}
                shouldShowBorderBottom={false}
                shouldEnableDetailPageNavigation
                openParentReportInCurrentTab
            >
                {shouldDisplayNarrowMoreButton && (
                    <View style={[styles.flexRow, styles.gap2]}>
                        {!shouldShowSelectedTransactionsButton && primaryActionComponent}
                        {!!applicableSecondaryActions.length && !shouldShowSelectedTransactionsButton && (
                            <MoneyReportHeaderKYCDropdown
                                chatReportID={chatReport?.reportID}
                                iouReport={moneyRequestReport}
                                onPaymentSelect={onPaymentSelect}
                                onSuccessfulKYC={(type) => confirmPayment({paymentType: type})}
                                primaryAction={primaryAction}
                                applicableSecondaryActions={applicableSecondaryActions}
                                dropdownMenuRef={dropdownMenuRef}
                                onOptionsMenuHide={handleOptionsMenuHide}
                                ref={kycWallRef}
                            />
                        )}
                        {shouldShowSelectedTransactionsButton && <View>{renderSelectionModeDropdown()}</View>}
                    </View>
                )}
            </HeaderWithBackButton>
            {!shouldDisplayNarrowMoreButton &&
                (shouldShowSelectedTransactionsButton ? (
                    <View style={[styles.dFlex, styles.w100, styles.ph5, styles.pb3]}>{renderSelectionModeDropdown(styles.w100)}</View>
                ) : (
                    <View style={[styles.flexRow, styles.gap2, styles.pb3, styles.ph5, styles.w100, styles.alignItemsCenter, styles.justifyContentCenter]}>
                        {!!primaryAction && <View style={[styles.flex1]}>{primaryActionComponent}</View>}
                        {!!applicableSecondaryActions.length && (
                            <MoneyReportHeaderKYCDropdown
                                chatReportID={chatReport?.reportID}
                                iouReport={moneyRequestReport}
                                onPaymentSelect={onPaymentSelect}
                                onSuccessfulKYC={(type) => confirmPayment({paymentType: type})}
                                primaryAction={primaryAction}
                                applicableSecondaryActions={applicableSecondaryActions}
                                dropdownMenuRef={dropdownMenuRef}
                                onOptionsMenuHide={handleOptionsMenuHide}
                                ref={kycWallRef}
                            />
                        )}
                    </View>
                ))}

            {shouldShowMoreContent && (
                <View style={[styles.flexRow, styles.gap2, styles.justifyContentStart, styles.flexNoWrap, styles.ph5, styles.pb3]}>
                    <View style={[styles.flexShrink1, styles.flexGrow1, styles.mnw0, styles.flexWrap, styles.justifyContentCenter]}>
                        {showNextStepBar && <MoneyReportHeaderStatusBar nextStep={optimisticNextStep} />}
                        {showNextStepSkeleton && <MoneyReportHeaderStatusBarSkeleton reasonAttributes={nextStepSkeletonReasonAttributes} />}
                        <MoneyReportHeaderStatusBarSection
                            reportID={reportIDProp}
                            statusBarType={statusBarType}
                            iouTransactionID={transaction?.transactionID}
                        />
                    </View>
                    {isReportInSearch && (
                        <MoneyRequestReportNavigation
                            reportID={moneyRequestReport?.reportID}
                            shouldDisplayNarrowVersion={!shouldDisplayNarrowMoreButton}
                        />
                    )}
                </View>
            )}

            <HeaderLoadingBar />
            {isHoldMenuVisible && requestType !== undefined && (
                <ProcessMoneyReportHoldMenu
                    nonHeldAmount={!hasOnlyHeldExpenses && hasValidNonHeldAmount ? nonHeldAmount : undefined}
                    requestType={requestType}
                    fullAmount={fullAmount}
                    onClose={() => {
                        setSelectedVBBAToPayFromHoldMenu(undefined);
                        setIsHoldMenuVisible(false);
                        isSelectionModePaymentRef.current = false;
                    }}
                    isVisible={isHoldMenuVisible}
                    paymentType={paymentType}
                    methodID={paymentType === CONST.IOU.PAYMENT_TYPE.VBBA ? selectedVBBAToPayFromHoldMenu : undefined}
                    chatReport={chatReport}
                    moneyRequestReport={moneyRequestReport}
                    hasNonHeldExpenses={!hasOnlyHeldExpenses}
                    startAnimation={() => {
                        if (isSelectionModePaymentRef.current) {
                            clearSelectedTransactions(true);
                            return;
                        }
                        if (requestType === CONST.IOU.REPORT_ACTION_TYPE.APPROVE) {
                            startApprovedAnimation();
                        } else {
                            startAnimation();
                        }
                    }}
                    transactionCount={transactionIDs?.length ?? 0}
                    transactions={transactions}
                    onNonReimbursablePaymentError={showNonReimbursablePaymentErrorModal}
                />
            )}
            <MoneyReportHeaderEducationalModals
                requestParentReportAction={requestParentReportAction}
                transaction={transaction}
                reportID={moneyRequestReport?.reportID}
                isHoldEducationalVisible={isHoldEducationalModalVisible}
                rejectModalAction={rejectModalAction}
                onHoldEducationalDismissed={() => setIsHoldEducationalModalVisible(false)}
                onRejectModalDismissed={() => setRejectModalAction(null)}
            />
            {nonReimbursablePaymentErrorDecisionModal}
            <ReportPDFDownloadModal
                reportID={moneyRequestReport?.reportID}
                isVisible={isPDFModalVisible}
                onClose={() => setIsPDFModalVisible(false)}
            />
        </View>
    );
}

export default MoneyReportHeader;
