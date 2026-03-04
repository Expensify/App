import {useRoute} from '@react-navigation/native';
import {getArchiveReason} from '@selectors/Report';
import React, {useCallback, useEffect, useMemo, useRef} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import useConfirmModal from '@hooks/useConfirmModal';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useMobileSelectionMode from '@hooks/useMobileSelectionMode';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useParticipantsInvoiceReport from '@hooks/useParticipantsInvoiceReport';
import usePaymentAnimations from '@hooks/usePaymentAnimations';
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
import useTransactionsAndViolationsForReport from '@hooks/useTransactionsAndViolationsForReport';
import useTransactionViolations from '@hooks/useTransactionViolations';
import {openOldDotLink} from '@libs/actions/Link';
import {turnOffMobileSelectionMode} from '@libs/actions/MobileSelectionMode';
import {queueExportSearchWithTemplate, search} from '@libs/actions/Search';
import {isPersonalCard} from '@libs/CardUtils';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import Log from '@libs/Log';
import {getTotalAmountForIOUReportPreviewButton} from '@libs/MoneyRequestReportUtils';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {ReportsSplitNavigatorParamList, RightModalNavigatorParamList} from '@libs/Navigation/types';
import {
    buildOptimisticNextStepForDEWOffline,
    buildOptimisticNextStepForDynamicExternalWorkflowApproveError,
    buildOptimisticNextStepForDynamicExternalWorkflowSubmitError,
    buildOptimisticNextStepForStrictPolicyRuleViolations,
    getReportNextStep,
} from '@libs/NextStepUtils';
import {hasDynamicExternalWorkflow} from '@libs/PolicyUtils';
import {getOriginalMessage, hasPendingDEWApprove, hasPendingDEWSubmit, isMoneyRequestAction} from '@libs/ReportActionsUtils';
import {getReportPrimaryAction, isMarkAsResolvedAction} from '@libs/ReportPrimaryActionUtils';
import {
    getAllReportActionsErrorsAndReportActionThatRequiresAttention,
    getIntegrationNameFromExportMessage as getIntegrationNameFromExportMessageUtils,
    getNextApproverAccountID,
    getNonHeldAndFullAmount,
    getReasonAndReportActionThatRequiresAttention,
    getTransactionsWithReceipts,
    hasHeldExpenses as hasHeldExpensesReportUtils,
    hasOnlyHeldExpenses as hasOnlyHeldExpensesReportUtils,
    hasUpdatedTotal,
    hasViolations as hasViolationsReportUtils,
    isAllowedToApproveExpenseReport,
    isExported as isExportedUtils,
    isInvoiceReport as isInvoiceReportUtil,
    isOpenExpenseReport,
    isProcessingReport,
    isReportOwner,
    shouldBlockSubmitDueToStrictPolicyRules,
} from '@libs/ReportUtils';
import {
    allHavePendingRTERViolation,
    hasDuplicateTransactions,
    isExpensifyCardTransaction,
    isPayAtEndExpense as isPayAtEndExpenseTransactionUtils,
    isPending,
    isScanning,
    isTransactionPendingDelete,
    shouldShowBrokenConnectionViolationForMultipleTransactions,
} from '@libs/TransactionUtils';
import variables from '@styles/variables';
import {approveMoneyRequest, canApproveIOU, canIOUBePaid as canIOUBePaidAction, payInvoice, payMoneyRequest} from '@userActions/IOU';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type * as OnyxTypes from '@src/types/onyx';
import type {PaymentMethodType} from '@src/types/onyx/OriginalMessage';
import type IconAsset from '@src/types/utils/IconAsset';
import BrokenConnectionDescription from './BrokenConnectionDescription';
import ButtonWithDropdownMenu from './ButtonWithDropdownMenu';
import {useDelegateNoAccessActions, useDelegateNoAccessState} from './DelegateNoAccessModalProvider';
import HeaderLoadingBar from './HeaderLoadingBar';
import HeaderWithBackButton from './HeaderWithBackButton';
import Icon from './Icon';
import type {PaymentMethod} from './KYCWall/types';
import {ModalActions} from './Modal/Global/ModalContext';
import type {MoneyReportHeaderContextType} from './MoneyReportHeaderContext';
import {MoneyReportHeaderProvider} from './MoneyReportHeaderContext';
import MoneyReportHeaderModals from './MoneyReportHeaderModals';
import MoneyReportHeaderPrimaryAction from './MoneyReportHeaderPrimaryAction';
import MoneyReportHeaderSecondaryActions from './MoneyReportHeaderSecondaryActions';
import MoneyReportHeaderStatusBar from './MoneyReportHeaderStatusBar';
import MoneyReportHeaderStatusBarSkeleton from './MoneyReportHeaderStatusBarSkeleton';
import type {MoneyRequestHeaderStatusBarProps} from './MoneyRequestHeaderStatusBar';
import MoneyRequestHeaderStatusBar from './MoneyRequestHeaderStatusBar';
import MoneyRequestReportNavigation from './MoneyRequestReportView/MoneyRequestReportNavigation';
import {useSearchActionsContext, useSearchStateContext} from './Search/SearchContext';

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
    const shouldTrackRenderPerformance = __DEV__;
    const renderCountRef = useRef(0);
    renderCountRef.current += 1;
    const renderStartTime = shouldTrackRenderPerformance ? performance.now() : 0;
    let previousRenderCheckpointTime = renderStartTime;
    const renderPerformanceCheckpoints: Array<{phase: string; deltaMs: number; elapsedMs: number}> = [];

    const trackRenderPhase = (phase: string) => {
        if (!shouldTrackRenderPerformance) {
            return;
        }

        const now = performance.now();
        renderPerformanceCheckpoints.push({
            phase,
            deltaMs: Number((now - previousRenderCheckpointTime).toFixed(2)),
            elapsedMs: Number((now - renderStartTime).toFixed(2)),
        });
        previousRenderCheckpointTime = now;
    };

    const logRenderPerformance = (renderPath: 'default' | 'mobileSelectionMode') => {
        if (!shouldTrackRenderPerformance) {
            return;
        }

        const totalDurationMs = Number((performance.now() - renderStartTime).toFixed(2));
        Log.info('[MoneyReportHeader][Perf] Render breakdown', false, {
            renderPath,
            reportID: moneyRequestReport?.reportID,
            renderCount: renderCountRef.current,
            totalDurationMs,
            checkpoints: renderPerformanceCheckpoints,
        });
    };

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
    const [chatReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${moneyRequestReport?.chatReportID}`);
    const [nextStep] = useOnyx(`${ONYXKEYS.COLLECTION.NEXT_STEP}${moneyRequestReport?.reportID}`);
    const [transactionThreadReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReportID}`);
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const [bankAccountList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST);
    const [userBillingGraceEndPeriods] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_USER_BILLING_GRACE_PERIOD_END);
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID);
    const activePolicy = usePolicy(activePolicyID);

    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Hourglass', 'Box', 'Stopwatch', 'Flag', 'CreditCardHourglass', 'ReceiptScan'] as const);
    const [reportMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${moneyRequestReport?.reportID}`);

    const {translate} = useLocalize();
    const {areStrictPolicyRulesEnabled} = useStrictPolicyRules();

    const requestParentReportAction = useMemo(() => {
        if (!reportActions || !transactionThreadReport?.parentReportActionID) {
            return null;
        }
        return reportActions.find((action): action is OnyxTypes.ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU> => action.reportActionID === transactionThreadReport.parentReportActionID);
    }, [reportActions, transactionThreadReport?.parentReportActionID]);

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
    const shouldBlockSubmit = isBlockSubmitDueToStrictPolicyRules || !!isBlockSubmitDueToPreventSelfApproval;

    const iouTransactionID = isMoneyRequestAction(requestParentReportAction) ? getOriginalMessage(requestParentReportAction)?.IOUTransactionID : undefined;
    const [transaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${getNonEmptyStringOnyxID(iouTransactionID)}`);

    const [dismissedRejectUseExplanation] = useOnyx(ONYXKEYS.NVP_DISMISSED_REJECT_USE_EXPLANATION);

    const [invoiceReceiverPolicy] = useOnyx(
        `${ONYXKEYS.COLLECTION.POLICY}${chatReport?.invoiceReceiver && 'policyID' in chatReport.invoiceReceiver ? chatReport.invoiceReceiver.policyID : undefined}`,
        {},
    );

    const isExported = useMemo(() => isExportedUtils(reportActions, moneyRequestReport), [reportActions, moneyRequestReport]);
    // wrapped in useMemo to improve performance because this is an operation on array
    const integrationNameFromExportMessage = useMemo(() => {
        if (!isExported) {
            return null;
        }
        return getIntegrationNameFromExportMessageUtils(reportActions) ?? null;
    }, [isExported, reportActions]);

    const transactionViolations = useTransactionViolations(transaction?.transactionID);
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [allTransactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS);
    const [cardList] = useOnyx(ONYXKEYS.CARD_LIST);
    const {isBetaEnabled} = usePermissions();
    const isASAPSubmitBetaEnabled = isBetaEnabled(CONST.BETAS.ASAP_SUBMIT);
    const isDEWBetaEnabled = isBetaEnabled(CONST.BETAS.NEW_DOT_DEW);
    const isDEWPolicy = isDEWBetaEnabled && hasDynamicExternalWorkflow(policy);
    const hasViolations = hasViolationsReportUtils(moneyRequestReport?.reportID, allTransactionViolations, accountID, email ?? '');

    const {showConfirmModal} = useConfirmModal();
    const {isPaidAnimationRunning, isApprovedAnimationRunning, isSubmittingAnimationRunning, startAnimation, stopAnimation, startApprovedAnimation, startSubmittingAnimation} =
        usePaymentAnimations();
    const styles = useThemeStyles();
    const theme = useTheme();
    const {isOffline} = useNetwork();

    const canAllowSettlement = hasUpdatedTotal(moneyRequestReport, policy);
    const policyType = policy?.type;
    const hasScanningReceipt = getTransactionsWithReceipts(moneyRequestReport?.reportID).some((t) => isScanning(t));
    const hasOnlyPendingTransactions = useMemo(() => {
        return !!transactions && transactions.length > 0 && transactions.every((t) => isExpensifyCardTransaction(t) && isPending(t));
    }, [transactions]);
    const transactionIDs = useMemo(() => transactions?.map((t) => t.transactionID) ?? [], [transactions]);

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

    const [archiveReason] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${moneyRequestReport?.reportID}`, {selector: getArchiveReason});

    const [reportNameValuePairs] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${moneyRequestReport?.reportID}`);
    const getCanIOUBePaid = useCallback(
        (onlyShowPayElsewhere = false) =>
            canIOUBePaidAction(moneyRequestReport, chatReport, policy, bankAccountList, transaction ? [transaction] : undefined, onlyShowPayElsewhere, undefined, invoiceReceiverPolicy),
        [moneyRequestReport, chatReport, policy, bankAccountList, transaction, invoiceReceiverPolicy],
    );

    const isInvoiceReport = isInvoiceReportUtil(moneyRequestReport);

    const {selectedTransactionIDs, currentSearchQueryJSON, currentSearchKey, currentSearchResults} = useSearchStateContext();
    const {clearSelectedTransactions} = useSearchActionsContext();
    const shouldCalculateTotals = useSearchShouldCalculateTotals(currentSearchKey, currentSearchQueryJSON?.hash, true);

    const {isWideRHPDisplayedOnWideLayout, isSuperWideRHPDisplayedOnWideLayout} = useResponsiveLayoutOnWideRHP();

    const shouldDisplayNarrowMoreButton = !shouldDisplayNarrowVersion || isWideRHPDisplayedOnWideLayout || isSuperWideRHPDisplayedOnWideLayout;

    // Modal triggers - registered by MoneyReportHeaderModals via onRegisterTriggers callback
    const modalTriggersRef = useRef<{
        showHoldMenu: MoneyReportHeaderContextType['showHoldMenu'];
        showDownloadError: MoneyReportHeaderContextType['showDownloadError'];
        showExportDownloadError: MoneyReportHeaderContextType['showExportDownloadError'];
        showOfflineModal: MoneyReportHeaderContextType['showOfflineModal'];
        showPDFModal: MoneyReportHeaderContextType['showPDFModal'];
        showHoldEducationalModal: MoneyReportHeaderContextType['showHoldEducationalModal'];
        setRejectModalAction: MoneyReportHeaderContextType['setRejectModalAction'];
        showRateErrorModal: MoneyReportHeaderContextType['showRateErrorModal'];
        showDuplicatePerDiemErrorModal: MoneyReportHeaderContextType['showDuplicatePerDiemErrorModal'];
    } | null>(null);

    trackRenderPhase('subscriptions and core derived state');

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
                modalTriggersRef.current?.showOfflineModal();
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
        [isOffline, moneyRequestReport, showExportProgressModal, clearSelectedTransactions],
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
        onExportFailed: () => modalTriggersRef.current?.showExportDownloadError(),
        onExportOffline: () => modalTriggersRef.current?.showOfflineModal(),
        policy,
        beginExportWithTemplate: (templateName, templateType, transactionIDList, policyID) => beginExportWithTemplate(templateName, templateType, transactionIDList, policyID),
        isOnSearch,
    });

    const canIOUBePaid = useMemo(() => getCanIOUBePaid(), [getCanIOUBePaid]);
    const onlyShowPayElsewhere = useMemo(() => !canIOUBePaid && getCanIOUBePaid(true), [canIOUBePaid, getCanIOUBePaid]);

    const shouldShowPayButton = isPaidAnimationRunning || canIOUBePaid || onlyShowPayElsewhere;

    const shouldShowApproveButton = useMemo(
        () => (canApproveIOU(moneyRequestReport, policy, reportMetadata, transactions) && !hasOnlyPendingTransactions) || isApprovedAnimationRunning,
        [moneyRequestReport, policy, reportMetadata, transactions, hasOnlyPendingTransactions, isApprovedAnimationRunning],
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
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const isReportInRHP = route.name !== SCREENS.REPORT;
    const shouldDisplaySearchRouter = !isReportInRHP || isSmallScreenWidth;
    const isReportInSearch = route.name === SCREENS.RIGHT_MODAL.SEARCH_REPORT || route.name === SCREENS.RIGHT_MODAL.SEARCH_MONEY_REQUEST_REPORT;

    const existingB2BInvoiceReport = useParticipantsInvoiceReport(activePolicyID, CONST.REPORT.INVOICE_RECEIVER_TYPE.BUSINESS, chatReport?.policyID);
    const confirmPayment = useCallback(
        (type?: PaymentMethodType | undefined, payAsBusiness?: boolean, methodID?: number, paymentMethod?: PaymentMethod) => {
            if (!type || !chatReport) {
                return;
            }
            if (isDelegateAccessRestricted) {
                showDelegateNoAccessModal();
            } else if (isAnyTransactionOnHold) {
                modalTriggersRef.current?.showHoldMenu(type, CONST.IOU.REPORT_ACTION_TYPE.PAY);
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
                    betas,
                });
            } else {
                startAnimation();
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
            betas,
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
        if (hasDynamicExternalWorkflow(policy) && !isDEWBetaEnabled) {
            showDWEModal();
            return;
        }
        if (isDelegateAccessRestricted) {
            showDelegateNoAccessModal();
        } else if (isAnyTransactionOnHold) {
            modalTriggersRef.current?.showHoldMenu(undefined, CONST.IOU.REPORT_ACTION_TYPE.APPROVE);
        } else {
            startApprovedAnimation();
            approveMoneyRequest(moneyRequestReport, policy, accountID, email ?? '', hasViolations, isASAPSubmitBetaEnabled, nextStep, betas, userBillingGraceEndPeriods, true);
        }
    };

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
            const brokenConnectionError = transactionViolations?.find((violation) => violation.data?.rterType === CONST.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION);
            const cardID = brokenConnectionError?.data?.cardID;
            const card = cardID ? cardList?.[cardID] : undefined;
            const isBrokenPersonalCard = isPersonalCard(card);

            if (isBrokenPersonalCard && brokenConnectionError) {
                return undefined;
            }
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

    const statusBarProps = getStatusBarProps();

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
        formattedAmount: getTotalAmountForIOUReportPreviewButton(moneyRequestReport, policy, actionType),
    });

    const {formattedAmount: totalAmount} = getAmount(CONST.REPORT.PRIMARY_ACTIONS.PAY);

    trackRenderPhase('actions and menu composition');
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
                        if (isDelegateAccessRestricted) {
                            showDelegateNoAccessModal();
                            return;
                        }
                        if (dismissedRejectUseExplanation) {
                            option.onSelected?.();
                        } else {
                            modalTriggersRef.current?.setRejectModalAction(CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS.REJECT_BULK);
                        }
                    },
                };
            }
            return option;
        });
    }, [originalSelectedTransactionsOptions, showDeleteModal, dismissedRejectUseExplanation]);

    const shouldShowSelectedTransactionsButton = !!selectedTransactionsOptions.length && !transactionThreadReportID;

    trackRenderPhase('post-effect view state');

    if (isMobileSelectionModeEnabled && shouldUseNarrowLayout) {
        // If mobile selection mode is enabled but only one or no transactions remain, turn it off
        const visibleTransactions = transactions.filter((t) => t.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE || isOffline);
        if (visibleTransactions.length <= 1) {
            turnOffMobileSelectionMode();
        }

        trackRenderPhase('mobile selection early return');
        logRenderPerformance('mobileSelectionMode');
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
    const showNextStepBar = shouldShowNextStep && !!(optimisticNextStep?.message?.length ?? (optimisticNextStep && 'messageKey' in optimisticNextStep));
    const showNextStepSkeleton = shouldShowNextStep && !optimisticNextStep && !!isLoadingInitialReportActions && !isOffline;
    const shouldShowMoreContent = showNextStepBar || showNextStepSkeleton || !!statusBarProps || isReportInSearch;

    const contextValue: MoneyReportHeaderContextType = {
        showHoldMenu: (...args) => modalTriggersRef.current?.showHoldMenu(...args),
        showDownloadError: () => modalTriggersRef.current?.showDownloadError(),
        showExportDownloadError: () => modalTriggersRef.current?.showExportDownloadError(),
        showOfflineModal: () => modalTriggersRef.current?.showOfflineModal(),
        showPDFModal: (...args) => modalTriggersRef.current?.showPDFModal(...args),
        showHoldEducationalModal: () => modalTriggersRef.current?.showHoldEducationalModal(),
        setRejectModalAction: (...args) => modalTriggersRef.current?.setRejectModalAction(...args),
        showRateErrorModal: () => modalTriggersRef.current?.showRateErrorModal(),
        showDuplicatePerDiemErrorModal: () => modalTriggersRef.current?.showDuplicatePerDiemErrorModal(),
        confirmPayment,
        confirmApproval,
    };

    trackRenderPhase('final render props and visibility');
    logRenderPerformance('default');

    return (
        <MoneyReportHeaderProvider value={contextValue}>
            <View style={[styles.pt0, styles.borderBottom]}>
                <HeaderWithBackButton
                    shouldShowReportAvatarWithDisplay
                    shouldDisplayStatus
                    shouldShowPinButton={false}
                    report={moneyRequestReport}
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
                            {!!primaryAction && !shouldShowSelectedTransactionsButton && (
                                <MoneyReportHeaderPrimaryAction
                                    primaryAction={primaryAction}
                                    report={moneyRequestReport}
                                    policy={policy}
                                    chatReportID={chatReport?.reportID}
                                    reportActions={reportActions}
                                    transactions={transactions}
                                    transaction={transaction}
                                    transactionViolations={transactionViolations}
                                    transactionThreadReport={transactionThreadReport}
                                    transactionThreadReportID={transactionThreadReportID}
                                    requestParentReportAction={requestParentReportAction}
                                    nextStep={nextStep}
                                    allTransactionViolations={allTransactionViolations}
                                    introSelected={introSelected}
                                    betas={betas}
                                    isPaidAnimationRunning={isPaidAnimationRunning}
                                    isApprovedAnimationRunning={isApprovedAnimationRunning}
                                    isSubmittingAnimationRunning={isSubmittingAnimationRunning}
                                    stopAnimation={stopAnimation}
                                    startSubmittingAnimation={startSubmittingAnimation}
                                    shouldBlockSubmit={shouldBlockSubmit}
                                    isBlockSubmitDueToPreventSelfApproval={!!isBlockSubmitDueToPreventSelfApproval}
                                    shouldShowPayButton={shouldShowPayButton}
                                    shouldShowApproveButton={shouldShowApproveButton}
                                    shouldDisableApproveButton={shouldDisableApproveButton}
                                    canAllowSettlement={canAllowSettlement}
                                    totalAmount={totalAmount}
                                    onlyShowPayElsewhere={onlyShowPayElsewhere}
                                    isExported={isExported}
                                    hasViolations={hasViolations}
                                    userBillingGraceEndPeriods={userBillingGraceEndPeriods}
                                />
                            )}
                            {!shouldShowSelectedTransactionsButton && (
                                <MoneyReportHeaderSecondaryActions
                                    primaryAction={primaryAction}
                                    report={moneyRequestReport}
                                    chatReport={chatReport}
                                    policy={policy}
                                    reportActions={reportActions}
                                    transactions={transactions}
                                    nonPendingDeleteTransactions={nonPendingDeleteTransactions}
                                    transaction={transaction}
                                    transactionViolations={transactionViolations}
                                    transactionThreadReportID={transactionThreadReportID}
                                    requestParentReportAction={requestParentReportAction}
                                    nextStep={nextStep}
                                    allTransactionViolations={allTransactionViolations}
                                    violations={violations}
                                    bankAccountList={bankAccountList}
                                    reportNameValuePairs={reportNameValuePairs}
                                    reportMetadata={reportMetadata}
                                    isChatReportArchived={isChatReportArchived}
                                    introSelected={introSelected}
                                    betas={betas}
                                    isExported={isExported}
                                    integrationNameFromExportMessage={integrationNameFromExportMessage}
                                    hasViolations={hasViolations}
                                    totalAmount={totalAmount}
                                    transactionIDs={transactionIDs}
                                    reportTransactions={reportTransactions}
                                    dismissedRejectUseExplanation={dismissedRejectUseExplanation}
                                    shouldShowPayButton={shouldShowPayButton}
                                    shouldShowApproveButton={shouldShowApproveButton}
                                    shouldDisableApproveButton={shouldDisableApproveButton}
                                    onlyShowPayElsewhere={onlyShowPayElsewhere}
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
                            {!!primaryAction && (
                                <View style={[styles.flex1]}>
                                    <MoneyReportHeaderPrimaryAction
                                        primaryAction={primaryAction}
                                        report={moneyRequestReport}
                                        policy={policy}
                                        chatReportID={chatReport?.reportID}
                                        reportActions={reportActions}
                                        transactions={transactions}
                                        transaction={transaction}
                                        transactionViolations={transactionViolations}
                                        transactionThreadReport={transactionThreadReport}
                                        transactionThreadReportID={transactionThreadReportID}
                                        requestParentReportAction={requestParentReportAction}
                                        nextStep={nextStep}
                                        allTransactionViolations={allTransactionViolations}
                                        introSelected={introSelected}
                                        betas={betas}
                                        isPaidAnimationRunning={isPaidAnimationRunning}
                                        isApprovedAnimationRunning={isApprovedAnimationRunning}
                                        isSubmittingAnimationRunning={isSubmittingAnimationRunning}
                                        stopAnimation={stopAnimation}
                                        startSubmittingAnimation={startSubmittingAnimation}
                                        shouldBlockSubmit={shouldBlockSubmit}
                                        isBlockSubmitDueToPreventSelfApproval={!!isBlockSubmitDueToPreventSelfApproval}
                                        shouldShowPayButton={shouldShowPayButton}
                                        shouldShowApproveButton={shouldShowApproveButton}
                                        shouldDisableApproveButton={shouldDisableApproveButton}
                                        canAllowSettlement={canAllowSettlement}
                                        totalAmount={totalAmount}
                                        onlyShowPayElsewhere={onlyShowPayElsewhere}
                                        isExported={isExported}
                                        hasViolations={hasViolations}
                                        userBillingGraceEndPeriods={userBillingGraceEndPeriods}
                                    />
                                </View>
                            )}
                            <MoneyReportHeaderSecondaryActions
                                primaryAction={primaryAction}
                                report={moneyRequestReport}
                                chatReport={chatReport}
                                policy={policy}
                                reportActions={reportActions}
                                transactions={transactions}
                                nonPendingDeleteTransactions={nonPendingDeleteTransactions}
                                transaction={transaction}
                                transactionViolations={transactionViolations}
                                transactionThreadReportID={transactionThreadReportID}
                                requestParentReportAction={requestParentReportAction}
                                nextStep={nextStep}
                                allTransactionViolations={allTransactionViolations}
                                violations={violations}
                                bankAccountList={bankAccountList}
                                reportNameValuePairs={reportNameValuePairs}
                                reportMetadata={reportMetadata}
                                isChatReportArchived={isChatReportArchived}
                                introSelected={introSelected}
                                betas={betas}
                                isExported={isExported}
                                integrationNameFromExportMessage={integrationNameFromExportMessage}
                                hasViolations={hasViolations}
                                totalAmount={totalAmount}
                                transactionIDs={transactionIDs}
                                reportTransactions={reportTransactions}
                                dismissedRejectUseExplanation={dismissedRejectUseExplanation}
                                shouldShowPayButton={shouldShowPayButton}
                                shouldShowApproveButton={shouldShowApproveButton}
                                shouldDisableApproveButton={shouldDisableApproveButton}
                                onlyShowPayElsewhere={onlyShowPayElsewhere}
                            />
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

                <HeaderLoadingBar />
                <MoneyReportHeaderModals
                    report={moneyRequestReport}
                    chatReport={chatReport}
                    hasOnlyHeldExpenses={hasOnlyHeldExpenses}
                    hasValidNonHeldAmount={hasValidNonHeldAmount}
                    nonHeldAmount={nonHeldAmount}
                    fullAmount={fullAmount}
                    transactionCount={transactionIDs?.length ?? 0}
                    requestParentReportAction={requestParentReportAction}
                    startAnimation={startAnimation}
                    startApprovedAnimation={startApprovedAnimation}
                    onRegisterTriggers={(triggers) => {
                        modalTriggersRef.current = triggers;
                    }}
                />
            </View>
        </MoneyReportHeaderProvider>
    );
}

export default MoneyReportHeader;
