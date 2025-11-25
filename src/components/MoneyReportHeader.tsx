import {useRoute} from '@react-navigation/native';
import {isUserValidatedSelector} from '@selectors/Account';
import getArchiveReason from '@selectors/Report';
import React, {useCallback, useContext, useEffect, useMemo, useState} from 'react';
import {InteractionManager, View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import useConfirmModal from '@hooks/useConfirmModal';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
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
import useSearchShouldCalculateTotals from '@hooks/useSearchShouldCalculateTotals';
import useSelectedTransactionsActions from '@hooks/useSelectedTransactionsActions';
import useStrictPolicyRules from '@hooks/useStrictPolicyRules';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useTransactionsAndViolationsForReport from '@hooks/useTransactionsAndViolationsForReport';
import useTransactionViolations from '@hooks/useTransactionViolations';
import {openOldDotLink} from '@libs/actions/Link';
import {setupMergeTransactionData} from '@libs/actions/MergeTransaction';
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
import type {ReportsSplitNavigatorParamList, SearchFullscreenNavigatorParamList, SearchReportParamList} from '@libs/Navigation/types';
import {buildOptimisticNextStepForPreventSelfApprovalsEnabled, buildOptimisticNextStepForStrictPolicyRuleViolations} from '@libs/NextStepUtils';
import type {KYCFlowEvent, TriggerKYCFlow} from '@libs/PaymentUtils';
import {selectPaymentType} from '@libs/PaymentUtils';
import {getConnectedIntegration, getValidConnectedIntegration, hasDynamicExternalWorkflow} from '@libs/PolicyUtils';
import {getIOUActionForReportID, getOriginalMessage, getReportAction, isMoneyRequestAction} from '@libs/ReportActionsUtils';
import {getAllExpensesToHoldIfApplicable, getReportPrimaryAction, isMarkAsResolvedAction} from '@libs/ReportPrimaryActionUtils';
import {getSecondaryExportReportActions, getSecondaryReportActions} from '@libs/ReportSecondaryActionUtils';
import {
    changeMoneyRequestHoldStatus,
    getAddExpenseDropdownOptions,
    getIntegrationExportIcon,
    getIntegrationNameFromExportMessage as getIntegrationNameFromExportMessageUtils,
    getNextApproverAccountID,
    getNonHeldAndFullAmount,
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
    hasDuplicateTransactions,
    isDuplicate,
    isExpensifyCardTransaction,
    isPayAtEndExpense as isPayAtEndExpenseTransactionUtils,
    isPending,
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
import type {Route} from '@src/ROUTES';
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
import type {ActionHandledType} from './ProcessMoneyReportHoldMenu';
import ProcessMoneyReportHoldMenu from './ProcessMoneyReportHoldMenu';
import {useSearchContext} from './Search/SearchContext';
import AnimatedSettlementButton from './SettlementButton/AnimatedSettlementButton';
import Text from './Text';
import {WideRHPContext} from './WideRHPContextProvider';

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
        | PlatformStackRouteProp<SearchFullscreenNavigatorParamList, typeof SCREENS.SEARCH.MONEY_REQUEST_REPORT>
        | PlatformStackRouteProp<SearchReportParamList, typeof SCREENS.SEARCH.REPORT_RHP>
    >();
    const {login: currentUserLogin, accountID, email} = useCurrentUserPersonalDetails();
    const [chatReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${moneyRequestReport?.chatReportID}`, {canBeMissing: true});
    const [nextStep] = useOnyx(`${ONYXKEYS.COLLECTION.NEXT_STEP}${moneyRequestReport?.reportID}`, {canBeMissing: true});
    const [isUserValidated] = useOnyx(ONYXKEYS.ACCOUNT, {selector: isUserValidatedSelector, canBeMissing: true});
    const [transactionThreadReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReportID}`, {canBeMissing: true});
    const [reportPDFFilename] = useOnyx(`${ONYXKEYS.COLLECTION.NVP_EXPENSIFY_REPORT_PDF_FILENAME}${moneyRequestReport?.reportID}`, {canBeMissing: true}) ?? null;
    const [download] = useOnyx(`${ONYXKEYS.COLLECTION.DOWNLOAD}${reportPDFFilename}`, {canBeMissing: true});
    const isDownloadingPDF = download?.isDownloading ?? false;
    const [session] = useOnyx(ONYXKEYS.SESSION, {canBeMissing: false});
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
        'Feed',
    ] as const);
    const [lastDistanceExpenseType] = useOnyx(ONYXKEYS.NVP_LAST_DISTANCE_EXPENSE_TYPE, {canBeMissing: true});
    const {translate} = useLocalize();

    const exportTemplates = useMemo(
        () => getExportTemplates(integrationsExportTemplates ?? [], csvExportLayouts ?? {}, translate, policy),
        [integrationsExportTemplates, csvExportLayouts, policy, translate],
    );
    const {areStrictPolicyRulesEnabled} = useStrictPolicyRules();
    const [allTransactions] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION, {canBeMissing: false});
    const [allReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {canBeMissing: false});

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

    const shouldBlockSubmit = useMemo(() => {
        return shouldBlockSubmitDueToStrictPolicyRules(moneyRequestReport?.reportID, violations, areStrictPolicyRulesEnabled, transactions);
    }, [moneyRequestReport?.reportID, violations, areStrictPolicyRulesEnabled, transactions]);

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
    const hasViolations = hasViolationsReportUtils(moneyRequestReport?.reportID, allTransactionViolations);

    const [exportModalStatus, setExportModalStatus] = useState<ExportType | null>(null);
    const {showConfirmModal} = useConfirmModal();
    const {isPaidAnimationRunning, isApprovedAnimationRunning, isSubmittingAnimationRunning, startAnimation, stopAnimation, startApprovedAnimation, startSubmittingAnimation} =
        usePaymentAnimations();
    const styles = useThemeStyles();
    const theme = useTheme();
    const {isOffline} = useNetwork();
    const {isExpenseSplit} = getOriginalTransactionWithSplitInfo(transaction, originalTransaction);

    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {canBeMissing: true});
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

    const messagePDF = useMemo(() => {
        if (reportPDFFilename === CONST.REPORT_DETAILS_MENU_ITEM.ERROR) {
            return translate('reportDetailsPage.errorPDF');
        }
        return translate('reportDetailsPage.waitForPDF');
    }, [reportPDFFilename, translate]);

    // Check if there is pending rter violation in all transactionViolations with given transactionIDs.
    // wrapped in useMemo to avoid unnecessary re-renders and for better performance (array operation inside of function)
    const hasAllPendingRTERViolations = useMemo(
        () => allHavePendingRTERViolation(transactions, violations, email ?? '', moneyRequestReport, policy),
        [transactions, violations, email, moneyRequestReport, policy],
    );
    // Check if user should see broken connection violation warning.
    const shouldShowBrokenConnectionViolation = shouldShowBrokenConnectionViolationForMultipleTransactions(transactions, moneyRequestReport, policy, violations, email ?? '');
    const hasOnlyHeldExpenses = hasOnlyHeldExpensesReportUtils(moneyRequestReport?.reportID);
    const isPayAtEndExpense = isPayAtEndExpenseTransactionUtils(transaction);
    const isArchivedReport = useReportIsArchived(moneyRequestReport?.reportID);
    const isChatReportArchived = useReportIsArchived(chatReport?.reportID);

    const [archiveReason] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${moneyRequestReport?.reportID}`, {selector: getArchiveReason, canBeMissing: true});

    const [reportNameValuePairs] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${moneyRequestReport?.reportID}`, {canBeMissing: true});
    const getCanIOUBePaid = useCallback(
        (onlyShowPayElsewhere = false, shouldCheckApprovedState = true) =>
            canIOUBePaidAction(moneyRequestReport, chatReport, policy, transaction ? [transaction] : undefined, onlyShowPayElsewhere, undefined, undefined, shouldCheckApprovedState),
        [moneyRequestReport, chatReport, policy, transaction],
    );

    const isInvoiceReport = isInvoiceReportUtil(moneyRequestReport);

    const [isDownloadErrorModalVisible, setIsDownloadErrorModalVisible] = useState(false);
    const [isHoldEducationalModalVisible, setIsHoldEducationalModalVisible] = useState(false);
    const [rejectModalAction, setRejectModalAction] = useState<ValueOf<
        typeof CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS.HOLD | typeof CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS.REJECT
    > | null>(null);

    const {selectedTransactionIDs, removeTransaction, clearSelectedTransactions, currentSearchQueryJSON, currentSearchKey, currentSearchHash} = useSearchContext();
    const shouldCalculateTotals = useSearchShouldCalculateTotals(currentSearchKey, currentSearchQueryJSON?.similarSearchHash, true);

    const {wideRHPRouteKeys} = useContext(WideRHPContext);
    const [network] = useOnyx(ONYXKEYS.NETWORK, {canBeMissing: true});
    const shouldDisplayNarrowMoreButton = !shouldDisplayNarrowVersion || (wideRHPRouteKeys.length > 0 && !isSmallScreenWidth);

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
    const {options: originalSelectedTransactionsOptions, handleDeleteTransactions} = useSelectedTransactionsActions({
        report: moneyRequestReport,
        reportActions,
        allTransactionsLength: transactions.length,
        session,
        onExportFailed: () => setIsDownloadErrorModalVisible(true),
        onExportOffline: () => setOfflineModalVisible(true),
        policy,
        beginExportWithTemplate: (templateName, templateType, transactionIDList, policyID) => beginExportWithTemplate(templateName, templateType, transactionIDList, policyID),
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

    const hasDuplicates = hasDuplicateTransactions(email ?? '', moneyRequestReport, policy);
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

    // When prevent self-approval is enabled & the current user is submitter AND they're submitting to themselves, we need to show the optimistic next step
    // We should always show this optimistic message for policies with preventSelfApproval
    // to avoid any flicker during transitions between online/offline states
    const nextApproverAccountID = getNextApproverAccountID(moneyRequestReport);
    const isSubmitterSameAsNextApprover = isReportOwner(moneyRequestReport) && nextApproverAccountID === moneyRequestReport?.ownerAccountID;
    let optimisticNextStep = isSubmitterSameAsNextApprover && policy?.preventSelfApproval ? buildOptimisticNextStepForPreventSelfApprovalsEnabled() : nextStep;

    if (shouldBlockSubmit && isReportOwner(moneyRequestReport) && isOpenExpenseReport(moneyRequestReport)) {
        optimisticNextStep = buildOptimisticNextStepForStrictPolicyRuleViolations();
    }

    const shouldShowNextStep = isFromPaidPolicy && !isInvoiceReport && !shouldShowStatusBar;
    const {nonHeldAmount, fullAmount, hasValidNonHeldAmount} = getNonHeldAndFullAmount(moneyRequestReport, shouldShowPayButton);
    const isAnyTransactionOnHold = hasHeldExpensesReportUtils(moneyRequestReport?.reportID);
    const {isDelegateAccessRestricted, showDelegateNoAccessModal} = useContext(DelegateNoAccessContext);
    const shouldShowLoadingBar = useLoadingBarVisibility();
    const kycWallRef = useContext(KYCWallContext);

    const isReportInRHP = route.name === SCREENS.SEARCH.REPORT_RHP;
    const shouldDisplaySearchRouter = !isReportInRHP || isSmallScreenWidth;
    const isReportInSearch = route.name === SCREENS.SEARCH.MONEY_REQUEST_REPORT;
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
                payInvoice(type, chatReport, moneyRequestReport, introSelected, payAsBusiness, existingB2BInvoiceReport, methodID, paymentMethod, activePolicy);
            } else {
                startAnimation();
                payMoneyRequest(type, chatReport, moneyRequestReport, introSelected, undefined, true, activePolicy);
                if (currentSearchQueryJSON && !isOffline) {
                    search({
                        searchKey: currentSearchKey,
                        shouldCalculateTotals,
                        offset: 0,
                        queryJSON: currentSearchQueryJSON,
                        isOffline,
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
            introSelected,
            existingB2BInvoiceReport,
            shouldCalculateTotals,
            activePolicy,
            currentSearchQueryJSON,
            currentSearchKey,
            isOffline,
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
            approveMoneyRequest(moneyRequestReport, policy, accountID, email ?? '', hasViolations, isASAPSubmitBetaEnabled, true);
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
        markAsCashAction(iouTransactionID, reportID);
    }, [iouTransactionID, requestParentReportAction, transactionThreadReport?.reportID]);

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
            return {icon: getStatusIcon(expensifyIcons.Flag), description: translate('iou.duplicateTransaction', {isSubmitted: isProcessingReport(moneyRequestReport)})};
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
        const duplicateTransaction = transactionsList.find((reportTransaction) => isDuplicate(reportTransaction, email ?? '', moneyRequestReport, policy));
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
            currentUserEmail: currentUserLogin ?? '',
            report: moneyRequestReport,
            chatReport,
            reportTransactions: transactions,
            violations,
            policy,
            reportNameValuePairs,
            reportActions,
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
        isChatReportArchived,
        invoiceReceiverPolicy,
        currentUserLogin,
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

    const {formattedAmount: totalAmount} = hasOnlyHeldExpenses ? getAmount(CONST.REPORT.REPORT_PREVIEW_ACTIONS.REVIEW) : getAmount(CONST.REPORT.PRIMARY_ACTIONS.PAY);

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
        () => getAddExpenseDropdownOptions(moneyRequestReport?.reportID, policy, undefined, undefined, lastDistanceExpenseType),
        [moneyRequestReport?.reportID, policy, lastDistanceExpenseType],
    );

    const exportSubmenuOptions: Record<string, DropdownOption<string>> = useMemo(() => {
        const options: Record<string, DropdownOption<string>> = {
            [CONST.REPORT.EXPORT_OPTIONS.DOWNLOAD_CSV]: {
                text: translate('export.basicExport'),
                icon: expensifyIcons.Table,
                value: CONST.REPORT.EXPORT_OPTIONS.DOWNLOAD_CSV,
                onSelected: () => {
                    if (!moneyRequestReport) {
                        return;
                    }
                    if (isOffline) {
                        setOfflineModalVisible(true);
                        return;
                    }
                    exportReportToCSV({reportID: moneyRequestReport.reportID, transactionIDList: transactionIDs}, () => {
                        setDownloadErrorModalVisible(true);
                    });
                },
            },
            [CONST.REPORT.EXPORT_OPTIONS.EXPORT_TO_INTEGRATION]: {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                text: translate('workspace.common.exportIntegrationSelected', {connectionName: connectedIntegrationFallback!}),
                icon: getIntegrationExportIcon(connectedIntegration ?? connectedIntegrationFallback),
                value: CONST.REPORT.EXPORT_OPTIONS.EXPORT_TO_INTEGRATION,
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
                icon: getIntegrationExportIcon(connectedIntegration ?? connectedIntegrationFallback),
                value: CONST.REPORT.EXPORT_OPTIONS.MARK_AS_EXPORTED,
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
                    if (hasDynamicExternalWorkflow(policy)) {
                        showDWEModal();
                        return;
                    }
                    startSubmittingAnimation();
                    submitReport(moneyRequestReport, policy, accountID, email ?? '', hasViolations, isASAPSubmitBetaEnabled);
                    if (currentSearchQueryJSON && !isOffline) {
                        search({
                            searchKey: currentSearchKey,
                            shouldCalculateTotals,
                            offset: 0,
                            queryJSON: currentSearchQueryJSON,
                            isOffline,
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
                    const parentReportAction = getReportAction(moneyRequestReport?.parentReportID, moneyRequestReport?.parentReportActionID);

                    const IOUActions = getAllExpensesToHoldIfApplicable(moneyRequestReport, reportActions, transactions, policy);

                    if (IOUActions.length) {
                        // eslint-disable-next-line unicorn/no-array-for-each
                        IOUActions.forEach(changeMoneyRequestHoldStatus);
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
                        const duplicateTransaction = transactions.find((reportTransaction) => isDuplicate(reportTransaction, email ?? '', moneyRequestReport, policy));
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
            currentUserEmail: currentUserLogin ?? '',
            report: moneyRequestReport,
            chatReport,
            reportTransactions: transactions,
            originalTransaction: originalIOUTransaction,
            violations,
            policy,
            reportNameValuePairs,
            reportActions,
            policies,
            isChatReportArchived,
        });
    }, [moneyRequestReport, currentUserLogin, chatReport, transactions, originalIOUTransaction, violations, policy, reportNameValuePairs, reportActions, policies, isChatReportArchived]);

    const secondaryExportActions = useMemo(() => {
        if (!moneyRequestReport) {
            return [];
        }
        return getSecondaryExportReportActions(moneyRequestReport, policy, exportTemplates);
    }, [moneyRequestReport, policy, exportTemplates]);

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
            subMenuItems: secondaryExportActions.map((action) => exportSubmenuOptions[action as string]),
        },
        [CONST.REPORT.SECONDARY_ACTIONS.DOWNLOAD_PDF]: {
            value: CONST.REPORT.SECONDARY_ACTIONS.DOWNLOAD_PDF,
            text: translate('common.downloadAsPDF'),
            icon: expensifyIcons.Document,
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
            onSelected: () => {
                if (!moneyRequestReport) {
                    return;
                }
                if (hasDynamicExternalWorkflow(policy)) {
                    showDWEModal();
                    return;
                }
                submitReport(moneyRequestReport, policy, accountID, email ?? '', hasViolations, isASAPSubmitBetaEnabled);
            },
        },
        [CONST.REPORT.SECONDARY_ACTIONS.APPROVE]: {
            text: translate('iou.approve'),
            icon: expensifyIcons.ThumbsUp,
            value: CONST.REPORT.SECONDARY_ACTIONS.APPROVE,
            onSelected: confirmApproval,
        },
        [CONST.REPORT.SECONDARY_ACTIONS.UNAPPROVE]: {
            text: translate('iou.unapprove'),
            icon: expensifyIcons.CircularArrowBackwards,
            value: CONST.REPORT.SECONDARY_ACTIONS.UNAPPROVE,
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
                    unapproveExpenseReport(moneyRequestReport, policy, accountID, email ?? '', hasViolations, isASAPSubmitBetaEnabled);
                    return;
                }

                unapproveExpenseReport(moneyRequestReport, policy, accountID, email ?? '', hasViolations, isASAPSubmitBetaEnabled);
            },
        },
        [CONST.REPORT.SECONDARY_ACTIONS.CANCEL_PAYMENT]: {
            text: translate('iou.cancelPayment'),
            icon: expensifyIcons.Clear,
            value: CONST.REPORT.SECONDARY_ACTIONS.CANCEL_PAYMENT,
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
            onSelected: () => {
                if (!requestParentReportAction) {
                    throw new Error('Parent action does not exist');
                }

                changeMoneyRequestHoldStatus(requestParentReportAction);
            },
        },
        [CONST.REPORT.SECONDARY_ACTIONS.SPLIT]: {
            text: isExpenseSplit ? translate('iou.editSplits') : translate('iou.split'),
            icon: expensifyIcons.ArrowSplit,
            value: CONST.REPORT.SECONDARY_ACTIONS.SPLIT,
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
            onSelected: () => {
                if (!currentTransaction) {
                    return;
                }

                setupMergeTransactionData(currentTransaction.transactionID, {targetTransactionID: currentTransaction.transactionID});
                Navigation.navigate(ROUTES.MERGE_TRANSACTION_LIST_PAGE.getRoute(currentTransaction.transactionID, Navigation.getActiveRoute()));
            },
        },
        [CONST.REPORT.SECONDARY_ACTIONS.CHANGE_WORKSPACE]: {
            text: translate('iou.changeWorkspace'),
            icon: expensifyIcons.Buildings,
            value: CONST.REPORT.SECONDARY_ACTIONS.CHANGE_WORKSPACE,
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
                    let goBackRoute: Route | undefined;
                    if (transactionThreadReportID) {
                        if (!requestParentReportAction || !transaction?.transactionID) {
                            throw new Error('Missing data!');
                        }
                        // it's deleting transaction but not the report which leads to bug (that is actually also on staging)
                        // Money request should be deleted when interactions are done, to not show the not found page before navigating to goBackRoute
                        // eslint-disable-next-line @typescript-eslint/no-deprecated
                        InteractionManager.runAfterInteractions(() => {
                            deleteTransactions([transaction.transactionID], duplicateTransactions, duplicateTransactionViolations, currentSearchHash, false);
                            removeTransaction(transaction.transactionID);
                        });
                        goBackRoute = getNavigationUrlOnMoneyRequestDelete(transaction.transactionID, requestParentReportAction, iouReport, chatIOUReport, isChatIOUReportArchived, false);
                    }

                    if (goBackRoute) {
                        Navigation.setNavigationActionToMicrotaskQueue(() => navigateOnDeleteExpense(goBackRoute));
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
                Navigation.goBack(route.params?.backTo);
                // eslint-disable-next-line @typescript-eslint/no-deprecated
                InteractionManager.runAfterInteractions(() => {
                    deleteAppReport(moneyRequestReport?.reportID, email ?? '');
                });
            },
        },
        [CONST.REPORT.SECONDARY_ACTIONS.RETRACT]: {
            text: translate('iou.retract'),
            icon: expensifyIcons.CircularArrowBackwards,
            value: CONST.REPORT.SECONDARY_ACTIONS.RETRACT,
            onSelected: () => {
                retractReport(moneyRequestReport, chatReport, policy, accountID, email ?? '', hasViolations, isASAPSubmitBetaEnabled);
            },
        },
        [CONST.REPORT.SECONDARY_ACTIONS.REOPEN]: {
            text: translate('iou.retract'),
            icon: expensifyIcons.CircularArrowBackwards,
            value: CONST.REPORT.SECONDARY_ACTIONS.REOPEN,
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
                    reopenReport(moneyRequestReport, policy, accountID, email ?? '', hasViolations, isASAPSubmitBetaEnabled);
                    return;
                }
                reopenReport(moneyRequestReport, policy, accountID, email ?? '', hasViolations, isASAPSubmitBetaEnabled);
            },
        },
        [CONST.REPORT.SECONDARY_ACTIONS.REJECT]: {
            text: translate('common.reject'),
            icon: expensifyIcons.ThumbsDown,
            value: CONST.REPORT.SECONDARY_ACTIONS.REJECT,
            onSelected: () => {
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
            value: CONST.REPORT.SECONDARY_ACTIONS.PAY,
            backButtonText: translate('iou.settlePayment', {formattedAmount: totalAmount}),
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
        // eslint-disable-next-line react-compiler/react-compiler
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [transactionThreadReportID]);

    useEffect(() => {
        if (!isPDFModalVisible || !reportPDFFilename || reportPDFFilename === CONST.REPORT_DETAILS_MENU_ITEM.ERROR || isDownloadingPDF) {
            return;
        }
        downloadReportPDF(reportPDFFilename, moneyRequestReport?.reportName ?? '');
        setIsPDFModalVisible(false);
    }, [isPDFModalVisible, reportPDFFilename, isDownloadingPDF, moneyRequestReport?.reportName]);

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
            handleDeleteTransactions();
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
            if (option.text === translate('common.delete')) {
                return {
                    ...option,
                    onSelected: showDeleteModal,
                };
            }
            return option;
        });
    }, [originalSelectedTransactionsOptions, translate, showDeleteModal]);

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
                            shouldDisplayNarrowVersion={shouldDisplayNarrowVersion}
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
                onClose={() => setIsPDFModalVisible(false)}
                isVisible={isPDFModalVisible}
                type={isSmallScreenWidth ? CONST.MODAL.MODAL_TYPE.BOTTOM_DOCKED : CONST.MODAL.MODAL_TYPE.CONFIRM}
                innerContainerStyle={styles.pv0}
            >
                <View style={[styles.m5]}>
                    <View style={[styles.flexRow, styles.mb4]}>
                        <View style={[styles.flex1]}>
                            <View style={[styles.flexRow]}>
                                <Header title={translate('reportDetailsPage.generatingPDF')} />
                            </View>
                            <Text style={[styles.mt3]}>{messagePDF}</Text>
                        </View>
                        <View style={[styles.dFlex, styles.justifyContentCenter]}>
                            <ActivityIndicator
                                size={CONST.ACTIVITY_INDICATOR_SIZE.SMALL}
                                color={theme.textSupporting}
                                style={styles.ml3}
                            />
                        </View>
                    </View>
                    {(!reportPDFFilename || reportPDFFilename === 'error') && (
                        <Button
                            style={[styles.mt3, styles.noSelect]}
                            onPress={() => setIsPDFModalVisible(false)}
                            text={translate('common.cancel')}
                        />
                    )}
                </View>
            </Modal>
        </View>
    );
}

MoneyReportHeader.displayName = 'MoneyReportHeader';

export default MoneyReportHeader;
