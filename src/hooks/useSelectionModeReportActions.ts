import type {DropdownOption} from '@components/ButtonWithDropdownMenu/types';
import type {PopoverMenuItem} from '@components/PopoverMenu';
import type {ActionHandledType} from '@components/ProcessMoneyReportHoldMenu';
import {useSearchSelectionActions} from '@components/Search/SearchContext';

import {canIOUBePaid as canIOUBePaidAction} from '@libs/actions/IOU/ReportWorkflow';
import {turnOffMobileSelectionMode} from '@libs/actions/MobileSelectionMode';
import {getTotalAmountForIOUReportPreviewButton} from '@libs/MoneyRequestReportUtils';
import TransitionTracker from '@libs/Navigation/TransitionTracker';
import type {KYCFlowEvent, TriggerKYCFlow} from '@libs/PaymentUtils';
import {isSubmitPolicy} from '@libs/PolicyUtils';
import {getReportPrimaryAction} from '@libs/ReportPrimaryActionUtils';
import {getSecondaryReportActions} from '@libs/ReportSecondaryActionUtils';
import {getNonHeldAndFullAmount, hasOnlyHeldExpenses as hasOnlyHeldExpensesReportUtils, hasUpdatedTotal, shouldShowMarkAsDone} from '@libs/ReportUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {personalDetailsLoginSelector} from '@src/selectors/PersonalDetails';
import type * as OnyxTypes from '@src/types/onyx';
import type {PaymentMethodType} from '@src/types/onyx/OriginalMessage';

import type {OnyxEntry} from 'react-native-onyx';

import {isTrackIntentUserSelector} from '@selectors/Onboarding';
import {useState} from 'react';

import {useCurrencyListActions} from './useCurrencyList';
import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useEnvironment from './useEnvironment';
import {useMemoizedLazyExpensifyIcons} from './useLazyAsset';
import useLifecycleActions from './useLifecycleActions';
import useLocalize from './useLocalize';
import useNetwork from './useNetwork';
import useOnyx from './useOnyx';
import useReportIsArchived from './useReportIsArchived';
import useSelectionModePayment from './useSelectionModePayment';

type UseSelectionModeReportActionsParams = {
    report: OnyxEntry<OnyxTypes.Report>;
    chatReport: OnyxEntry<OnyxTypes.Report>;
    policy: OnyxEntry<OnyxTypes.Policy>;
    reportActions: OnyxTypes.ReportAction[];
    reportNameValuePairs: OnyxEntry<OnyxTypes.ReportNameValuePairs>;
    reportMetadata: OnyxEntry<OnyxTypes.ReportMetadata>;
    transactions: OnyxTypes.Transaction[];
    selectedTransactionIDs: string[];
};

function useSelectionModeReportActions({
    report,
    chatReport,
    policy,
    reportActions,
    reportNameValuePairs,
    reportMetadata,
    transactions,
    selectedTransactionIDs,
}: UseSelectionModeReportActionsParams) {
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const {convertToDisplayString} = useCurrencyListActions();
    const {accountID: currentUserAccountID, login: currentUserLogin} = useCurrentUserPersonalDetails();
    const {clearSelectedTransactions} = useSearchSelectionActions();

    const [bankAccountList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST);
    const [allTransactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS);
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [outstandingReportsByPolicyID] = useOnyx(ONYXKEYS.DERIVED.OUTSTANDING_REPORTS_BY_POLICY_ID);
    const [submitterLogin] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {selector: personalDetailsLoginSelector(report?.ownerAccountID)}, [report?.ownerAccountID]);
    const [invoiceReceiverPolicy] = useOnyx(
        `${ONYXKEYS.COLLECTION.POLICY}${chatReport?.invoiceReceiver && 'policyID' in chatReport.invoiceReceiver ? chatReport.invoiceReceiver.policyID : undefined}`,
    );
    const [isTrackIntentUser] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED, {selector: isTrackIntentUserSelector});

    const {isProduction} = useEnvironment();
    const isChatReportArchived = useReportIsArchived(chatReport?.reportID);

    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Send', 'ThumbsUp', 'Cash', 'ArrowRight'] as const);

    // Hold menu state (managed locally on mobile; desktop uses modals context)
    const [isHoldMenuVisible, setIsHoldMenuVisible] = useState(false);
    const [paymentType, setPaymentType] = useState<PaymentMethodType>();
    const [requestType, setRequestType] = useState<ActionHandledType>();
    const [selectedVBBAToPayFromHoldMenu, setSelectedVBBAToPayFromHoldMenu] = useState<number | undefined>(undefined);

    // Submit/approve via shared useLifecycleActions (no animations on mobile, skipAnimation=true)
    const {
        confirmApproval: lifecycleConfirmApproval,
        handleSubmitReport: lifecycleHandleSubmitReport,
        shouldBlockSubmit,
        isBlockSubmitDueToPreventSelfApproval,
    } = useLifecycleActions({
        reportID: report?.reportID,
        startApprovedAnimation: () => {},
        startAnimation: () => {},
        startSubmittingAnimation: () => {},
        onHoldMenuOpen: (rt, _onConfirm, pt) => {
            setRequestType(rt);
            if (pt) {
                setPaymentType(pt);
            }
            setIsHoldMenuVisible(true);
        },
        onCleanup: turnOffMobileSelectionMode,
    });

    const handleSubmitReport = () => {
        lifecycleHandleSubmitReport(true);
    };

    const confirmApproval = () => {
        lifecycleConfirmApproval(true);
    };

    // Payment flow
    const nonPendingDeleteTransactions = transactions.filter((t): t is OnyxTypes.Transaction => !!t && (isOffline || t.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE));

    const getCanIOUBePaid = (onlyShowPayElsewhere = false) =>
        canIOUBePaidAction(report, chatReport, policy, bankAccountList, currentUserLogin ?? '', currentUserAccountID, transactions, onlyShowPayElsewhere, undefined, invoiceReceiverPolicy);
    const canIOUBePaid = getCanIOUBePaid();
    const onlyShowPayElsewhere = !canIOUBePaid && getCanIOUBePaid(true);
    const shouldShowPayButton = canIOUBePaid || onlyShowPayElsewhere;
    const canAllowSettlement = hasUpdatedTotal(report, policy);

    const totalAmount = getTotalAmountForIOUReportPreviewButton(report, policy, CONST.REPORT.PRIMARY_ACTIONS.PAY, nonPendingDeleteTransactions, convertToDisplayString);
    const {nonHeldAmount, fullAmount, hasValidNonHeldAmount} = getNonHeldAndFullAmount(report, shouldShowPayButton, transactions);

    // Primary/secondary action detection
    const currentUserEmail = currentUserLogin ?? '';

    const primaryAction = getReportPrimaryAction({
        currentUserLogin: currentUserEmail,
        currentUserAccountID,
        report,
        chatReport,
        reportTransactions: transactions,
        violations: allTransactionViolations,
        bankAccountList,
        policy,
        reportNameValuePairs,
        reportActions,
        reportMetadata,
        isChatReportArchived,
        invoiceReceiverPolicy,
        ownerLogin: submitterLogin,
    });

    const secondaryActions = (() => {
        if (!report) {
            return [];
        }
        return getSecondaryReportActions({
            currentUserLogin: currentUserEmail,
            currentUserAccountID,
            submitterLogin,
            report,
            chatReport,
            reportTransactions: transactions,
            originalTransaction: undefined,
            violations: allTransactionViolations,
            bankAccountList,
            policy,
            reportNameValuePairs,
            reportActions,
            reportMetadata,
            policies,
            outstandingReportsByPolicyID,
            isChatReportArchived,
            isProduction,
        });
    })();

    const hasSubmitAction = primaryAction === CONST.REPORT.PRIMARY_ACTIONS.SUBMIT || secondaryActions.includes(CONST.REPORT.SECONDARY_ACTIONS.SUBMIT);
    const hasApproveAction = primaryAction === CONST.REPORT.PRIMARY_ACTIONS.APPROVE || secondaryActions.includes(CONST.REPORT.SECONDARY_ACTIONS.APPROVE);
    const hasPayAction = primaryAction === CONST.REPORT.PRIMARY_ACTIONS.PAY || secondaryActions.includes(CONST.REPORT.SECONDARY_ACTIONS.PAY);

    const allExpensesSelected = selectedTransactionIDs.length > 0 && selectedTransactionIDs.length === transactions.length;

    const selectedTransactions = transactions.filter((transaction) => selectedTransactionIDs.includes(transaction.transactionID));
    const hasSelectedTransactionsOnSubmitPolicy = isSubmitPolicy(policy) && selectedTransactions.length > 0;
    const isBlockSubmitDueToSelectedTransactionsOnSubmitPolicy = hasSelectedTransactionsOnSubmitPolicy && selectedTransactions.length > 1;
    const effectiveShouldBlockSubmit = shouldBlockSubmit || isBlockSubmitDueToSelectedTransactionsOnSubmitPolicy;

    // Shared payment hook
    const {confirmPayment, shouldBlockAction, invokePaymentSelect, selectionModeKYCSuccess, paymentSubMenuItems, hasPayInSelectionMode, isAnyTransactionOnHold, isInvoiceReport, kycWallRef} =
        useSelectionModePayment({
            reportID: report?.reportID,
            transactions,
            formattedAmount: totalAmount,
            shouldHidePaymentOptions: !shouldShowPayButton,
            onlyShowPayElsewhere,
            hasPayAction,
            allExpensesSelected,
            onHoldMenuOpen: ({requestType: rt, paymentType: pt, methodID}) => {
                setRequestType(rt);
                setPaymentType(pt);
                setSelectedVBBAToPayFromHoldMenu(methodID);
                setIsHoldMenuVisible(true);
            },
            onPaymentComplete: () => {
                clearSelectedTransactions(true);
                turnOffMobileSelectionMode();
            },
            confirmApproval,
        });

    // Defer payment select until the popover dismiss animation completes. Blocking modals are shown
    // synchronously inside the callback (popover already closed) to avoid double-defer on Android.
    const onSelectionModePaymentSelect = (event: KYCFlowEvent, iouPaymentType: PaymentMethodType, triggerKYCFlow: TriggerKYCFlow) => {
        TransitionTracker.runAfterTransitions({
            callback: () => {
                if (shouldBlockAction(iouPaymentType)) {
                    return;
                }
                invokePaymentSelect(event, iouPaymentType, triggerKYCFlow);
            },
            waitForUpcomingTransition: true,
        });
    };

    // Build report-level action menu
    const selectionModeReportLevelActions = (() => {
        const actions: Array<DropdownOption<string> & Pick<PopoverMenuItem, 'backButtonText' | 'rightIcon' | 'subMenuItems'>> = [];
        let idx = 0;
        if (hasSubmitAction && !effectiveShouldBlockSubmit) {
            actions[idx++] = {
                text: shouldShowMarkAsDone({policy, report, isTrackIntentUser}) ? translate('common.markAsDone') : translate('common.submit'),
                icon: expensifyIcons.Send,
                value: CONST.REPORT.PRIMARY_ACTIONS.SUBMIT,
                onSelected: handleSubmitReport,
            };
        }
        if (hasApproveAction && !isBlockSubmitDueToPreventSelfApproval) {
            actions[idx++] = {
                text: translate('iou.approve'),
                icon: expensifyIcons.ThumbsUp,
                value: CONST.REPORT.PRIMARY_ACTIONS.APPROVE,
                onSelected: confirmApproval,
            };
        }
        if (hasPayAction && !(isOffline && !canAllowSettlement)) {
            actions[idx++] = {
                text: translate('iou.settlePayment', totalAmount),
                icon: expensifyIcons.Cash,
                value: CONST.REPORT.PRIMARY_ACTIONS.PAY,
                rightIcon: expensifyIcons.ArrowRight,
                backButtonText: translate('iou.settlePayment', totalAmount),
                subMenuItems: paymentSubMenuItems,
                onSelected: () => {},
            };
        }
        return actions;
    })();

    const handleHoldMenuClose = () => {
        setSelectedVBBAToPayFromHoldMenu(undefined);
        setIsHoldMenuVisible(false);
    };

    const handleHoldMenuConfirm = () => {
        clearSelectedTransactions(true);
        turnOffMobileSelectionMode();
    };

    return {
        selectionModeReportLevelActions,
        allExpensesSelected,
        shouldBlockSubmit: effectiveShouldBlockSubmit,
        isBlockSubmitDueToPreventSelfApproval,

        // Hold menu state
        isHoldMenuVisible,
        requestType,
        paymentType,
        selectedVBBAToPayFromHoldMenu,
        handleHoldMenuClose,
        handleHoldMenuConfirm,
        confirmPayment,
        confirmApproval,
        shouldBlockAction,

        // Pay-related
        hasPayAction,
        hasPayInSelectionMode,
        hasSubmitAction,
        hasSelectedTransactionsOnSubmitPolicy,
        hasApproveAction,
        totalAmount,
        canAllowSettlement,
        isAnyTransactionOnHold,
        isInvoiceReport,
        hasOnlyHeldExpenses: hasOnlyHeldExpensesReportUtils(transactions),
        nonHeldAmount,
        fullAmount,
        hasValidNonHeldAmount,

        // KYC dropdown integration
        onSelectionModePaymentSelect,
        selectionModeKYCSuccess,

        // Data for external use
        primaryAction,
        kycWallRef,
    };
}

export default useSelectionModeReportActions;
