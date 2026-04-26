import {delegateEmailSelector, isUserValidatedSelector} from '@selectors/Account';
import {hasSeenTourSelector} from '@selectors/Onboarding';
import truncate from 'lodash/truncate';
import {useContext, useEffect, useRef, useState} from 'react';
import {InteractionManager} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import type {DropdownOption} from '@components/ButtonWithDropdownMenu/types';
import {useDelegateNoAccessActions, useDelegateNoAccessState} from '@components/DelegateNoAccessModalProvider';
import {KYCWallContext} from '@components/KYCWall/KYCWallContext';
import {useLockedAccountActions, useLockedAccountState} from '@components/LockedAccountModalProvider';
import type {PopoverMenuItem} from '@components/PopoverMenu';
import type {ActionHandledType} from '@components/ProcessMoneyReportHoldMenu';
import {useSearchActionsContext, useSearchStateContext} from '@components/Search/SearchContext';
import type {PaymentActionParams} from '@components/SettlementButton/types';
import {payInvoice, payMoneyRequest} from '@libs/actions/IOU/PayMoneyRequest';
import {approveMoneyRequest, canApproveIOU, canIOUBePaid as canIOUBePaidAction, submitReport} from '@libs/actions/IOU/ReportWorkflow';
import {turnOffMobileSelectionMode} from '@libs/actions/MobileSelectionMode';
import {search} from '@libs/actions/Search';
import getPlatform from '@libs/getPlatform';
import {getTotalAmountForIOUReportPreviewButton} from '@libs/MoneyRequestReportUtils';
import type {KYCFlowEvent, TriggerKYCFlow} from '@libs/PaymentUtils';
import {handleUnvalidatedAccount, selectPaymentType} from '@libs/PaymentUtils';
import {sortPoliciesByName} from '@libs/PolicyUtils';
import {hasRequestFromCurrentAccount} from '@libs/ReportActionsUtils';
import {getReportPrimaryAction} from '@libs/ReportPrimaryActionUtils';
import {getSecondaryReportActions} from '@libs/ReportSecondaryActionUtils';
import {
    getNextApproverAccountID,
    getNonHeldAndFullAmount,
    hasHeldExpenses as hasHeldExpensesReportUtils,
    hasOnlyHeldExpenses as hasOnlyHeldExpensesReportUtils,
    hasUpdatedTotal,
    hasViolations as hasViolationsReportUtils,
    isAllowedToApproveExpenseReport,
    isInvoiceReport as isInvoiceReportUtil,
    isIOUReport as isIOUReportUtil,
    isReportOwner,
    shouldBlockSubmitDueToStrictPolicyRules,
} from '@libs/ReportUtils';
import {hasAnyPendingRTERViolation as hasAnyPendingRTERViolationTransactionUtils, isExpensifyCardTransaction, isPending} from '@libs/TransactionUtils';
import {markPendingRTERTransactionsAsCash} from '@userActions/Transaction';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
import type {PaymentMethodType} from '@src/types/onyx/OriginalMessage';
import useActiveAdminPolicies from './useActiveAdminPolicies';
import useConfirmPendingRTERAndProceed from './useConfirmPendingRTERAndProceed';
import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import {useMemoizedLazyExpensifyIcons} from './useLazyAsset';
import useLocalize from './useLocalize';
import useNetwork from './useNetwork';
import useOnyx from './useOnyx';
import useParticipantsInvoiceReport from './useParticipantsInvoiceReport';
import usePaymentOptions from './usePaymentOptions';
import usePermissions from './usePermissions';
import usePolicy from './usePolicy';
import useReportIsArchived from './useReportIsArchived';
import useSearchShouldCalculateTotals from './useSearchShouldCalculateTotals';
import useStrictPolicyRules from './useStrictPolicyRules';

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
    const {translate, localeCompare} = useLocalize();
    const {accountID: currentUserAccountID} = useCurrentUserPersonalDetails();
    const {isBetaEnabled} = usePermissions();
    const {areStrictPolicyRulesEnabled} = useStrictPolicyRules();
    const {isDelegateAccessRestricted} = useDelegateNoAccessState();
    const {showDelegateNoAccessModal} = useDelegateNoAccessActions();
    const {isAccountLocked} = useLockedAccountState();
    const {showLockedAccountModal} = useLockedAccountActions();
    const kycWallRef = useContext(KYCWallContext);

    const {currentSearchQueryJSON, currentSearchKey, currentSearchResults} = useSearchStateContext();
    const {clearSelectedTransactions} = useSearchActionsContext();
    const shouldCalculateTotals = useSearchShouldCalculateTotals(currentSearchKey, currentSearchQueryJSON?.hash, true);

    const [session] = useOnyx(ONYXKEYS.SESSION);
    const [isUserValidated] = useOnyx(ONYXKEYS.ACCOUNT, {selector: isUserValidatedSelector});
    const [delegateEmail] = useOnyx(ONYXKEYS.ACCOUNT, {selector: delegateEmailSelector});
    const [allTransactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS);
    const [nextStep] = useOnyx(`${ONYXKEYS.COLLECTION.NEXT_STEP}${report?.reportID}`);
    const [amountOwed] = useOnyx(ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED);
    const [ownerBillingGracePeriodEnd] = useOnyx(ONYXKEYS.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END);
    const [userBillingGracePeriodEnds] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_USER_BILLING_GRACE_PERIOD_END);
    const [bankAccountList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST);
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [outstandingReportsByPolicyID] = useOnyx(ONYXKEYS.DERIVED.OUTSTANDING_REPORTS_BY_POLICY_ID);
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [isSelfTourViewed = false] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {selector: hasSeenTourSelector});
    const {isOffline} = useNetwork();

    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID);
    const activePolicy = usePolicy(activePolicyID);
    const [invoiceReceiverPolicy] = useOnyx(
        `${ONYXKEYS.COLLECTION.POLICY}${chatReport?.invoiceReceiver && 'policyID' in chatReport.invoiceReceiver ? chatReport.invoiceReceiver.policyID : undefined}`,
    );
    const existingB2BInvoiceReport = useParticipantsInvoiceReport(activePolicyID, CONST.REPORT.INVOICE_RECEIVER_TYPE.BUSINESS, chatReport?.policyID);
    const activeAdminPolicies = useActiveAdminPolicies();

    const isChatReportArchived = useReportIsArchived(chatReport?.reportID);

    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Send', 'ThumbsUp', 'Cash', 'ArrowRight', 'Building'] as const);

    const isASAPSubmitBetaEnabled = isBetaEnabled(CONST.BETAS.ASAP_SUBMIT);
    const isBulkSubmitApprovePayBetaEnabled = isBetaEnabled(CONST.BETAS.BULK_SUBMIT_APPROVE_PAY);

    const currentUserEmail = session?.email;
    const hasViolations = hasViolationsReportUtils(report?.reportID, allTransactionViolations, currentUserAccountID, currentUserEmail ?? '');

    const hasAnyPendingRTERViolation = hasAnyPendingRTERViolationTransactionUtils(transactions, allTransactionViolations, currentUserEmail ?? '', currentUserAccountID, report, policy);

    const handleMarkPendingRTERTransactionsAsCash = () => {
        markPendingRTERTransactionsAsCash(transactions, allTransactionViolations, reportActions);
    };

    const confirmPendingRTERAndProceed = useConfirmPendingRTERAndProceed(hasAnyPendingRTERViolation, handleMarkPendingRTERTransactionsAsCash);

    const nextApproverAccountID = getNextApproverAccountID(report);
    const isSubmitterSameAsNextApprover = isReportOwner(report) && (nextApproverAccountID === report?.ownerAccountID || report?.managerID === report?.ownerAccountID);
    const isBlockSubmitDueToPreventSelfApproval = isSubmitterSameAsNextApprover && policy?.preventSelfApproval;
    const isBlockSubmitDueToStrictPolicyRules = shouldBlockSubmitDueToStrictPolicyRules(
        report?.reportID,
        allTransactionViolations,
        areStrictPolicyRulesEnabled,
        currentUserAccountID,
        currentUserEmail ?? '',
        transactions,
    );
    const shouldBlockSubmit = isBlockSubmitDueToStrictPolicyRules || isBlockSubmitDueToPreventSelfApproval;

    const canAllowSettlement = hasUpdatedTotal(report, policy);
    const isAnyTransactionOnHold = hasHeldExpensesReportUtils(report?.reportID, transactions);
    const isInvoiceReport = isInvoiceReportUtil(report);

    const hasOnlyPendingTransactions = !!transactions && transactions.length > 0 && transactions.every((t) => isExpensifyCardTransaction(t) && isPending(t));
    const nonPendingDeleteTransactions = transactions.filter((t): t is OnyxTypes.Transaction => !!t && (isOffline || t.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE));

    const getCanIOUBePaid = (onlyShowPayElsewhere = false) =>
        canIOUBePaidAction(report, chatReport, policy, bankAccountList, transactions, onlyShowPayElsewhere, undefined, invoiceReceiverPolicy);

    const canIOUBePaid = getCanIOUBePaid();
    const onlyShowPayElsewhere = !canIOUBePaid && getCanIOUBePaid(true);

    const shouldShowPayButton = canIOUBePaid || onlyShowPayElsewhere;

    const {nonHeldAmount, fullAmount, hasValidNonHeldAmount} = getNonHeldAndFullAmount(report, shouldShowPayButton);

    const shouldShowApproveButton = canApproveIOU(report, policy, reportMetadata, transactions) && !hasOnlyPendingTransactions;

    const shouldDisableApproveButton = shouldShowApproveButton && !isAllowedToApproveExpenseReport(report);

    const totalAmount = getTotalAmountForIOUReportPreviewButton(report, policy, CONST.REPORT.PRIMARY_ACTIONS.PAY, nonPendingDeleteTransactions);

    // confirmPayment is declared below but used by usePaymentOptions; we use a ref to avoid a circular dependency.
    const confirmPaymentRef = useRef<(params: PaymentActionParams) => void>(() => {});

    const paymentButtonOptions = usePaymentOptions({
        currency: report?.currency,
        iouReport: report,
        chatReportID: chatReport?.reportID,
        formattedAmount: totalAmount,
        policyID: report?.policyID,
        onPress: (params: PaymentActionParams) => confirmPaymentRef.current(params),
        shouldHidePaymentOptions: !shouldShowPayButton,
        shouldShowApproveButton,
        shouldDisableApproveButton,
        onlyShowPayElsewhere,
    });

    const workspacePolicyOptions = (() => {
        if (!isIOUReportUtil(report)) {
            return [];
        }

        const hasPersonalPaymentOption = paymentButtonOptions.some((opt) => opt.value === CONST.IOU.PAYMENT_TYPE.EXPENSIFY);
        if (!hasPersonalPaymentOption || !activeAdminPolicies.length) {
            return [];
        }

        const canUseBusinessBankAccount = report?.reportID && !hasRequestFromCurrentAccount(report, currentUserAccountID ?? CONST.DEFAULT_NUMBER_ID);
        if (!canUseBusinessBankAccount) {
            return [];
        }

        return sortPoliciesByName(activeAdminPolicies, localeCompare);
    })();

    const primaryAction = getReportPrimaryAction({
        currentUserLogin: currentUserEmail ?? '',
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
    });

    const secondaryActions = (() => {
        if (!report) {
            return [];
        }
        return getSecondaryReportActions({
            currentUserLogin: currentUserEmail ?? '',
            currentUserAccountID,
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
        });
    })();

    const hasSubmitAction = primaryAction === CONST.REPORT.PRIMARY_ACTIONS.SUBMIT || secondaryActions.includes(CONST.REPORT.SECONDARY_ACTIONS.SUBMIT);
    const hasApproveAction = primaryAction === CONST.REPORT.PRIMARY_ACTIONS.APPROVE || secondaryActions.includes(CONST.REPORT.SECONDARY_ACTIONS.APPROVE);
    const hasPayAction = primaryAction === CONST.REPORT.PRIMARY_ACTIONS.PAY || secondaryActions.includes(CONST.REPORT.SECONDARY_ACTIONS.PAY);

    const allExpensesSelected = selectedTransactionIDs.length > 0 && selectedTransactionIDs.length === transactions.length;

    // Hold menu state
    const [isHoldMenuVisible, setIsHoldMenuVisible] = useState(false);
    const [paymentType, setPaymentType] = useState<PaymentMethodType>();
    const [requestType, setRequestType] = useState<ActionHandledType>();
    const [selectedVBBAToPayFromHoldMenu, setSelectedVBBAToPayFromHoldMenu] = useState<number | undefined>(undefined);

    const shouldBlockAction = (paymentMethodType?: PaymentMethodType) => {
        if (isDelegateAccessRestricted) {
            showDelegateNoAccessModal();
            return true;
        }
        if (isAccountLocked) {
            showLockedAccountModal();
            return true;
        }
        if (!isUserValidated && paymentMethodType !== CONST.IOU.PAYMENT_TYPE.ELSEWHERE) {
            handleUnvalidatedAccount(report);
            return true;
        }
        return false;
    };

    const handleSubmitReport = () => {
        if (!report || shouldBlockSubmit) {
            return;
        }
        const doSubmit = () => {
            submitReport({
                expenseReport: report,
                policy,
                currentUserAccountIDParam: currentUserAccountID,
                currentUserEmailParam: currentUserEmail ?? '',
                hasViolations,
                isASAPSubmitBetaEnabled,
                expenseReportCurrentNextStepDeprecated: nextStep,
                userBillingGracePeriodEnds,
                amountOwed,
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
            clearSelectedTransactions(true);
            turnOffMobileSelectionMode();
        };
        confirmPendingRTERAndProceed(doSubmit);
    };

    const confirmApproval = () => {
        setRequestType(CONST.IOU.REPORT_ACTION_TYPE.APPROVE);
        if (isDelegateAccessRestricted) {
            showDelegateNoAccessModal();
        } else if (isAnyTransactionOnHold) {
            setIsHoldMenuVisible(true);
        } else {
            approveMoneyRequest({
                expenseReport: report,
                policy,
                currentUserAccountIDParam: currentUserAccountID,
                currentUserEmailParam: currentUserEmail ?? '',
                hasViolations,
                isASAPSubmitBetaEnabled,
                expenseReportCurrentNextStepDeprecated: nextStep,
                betas,
                userBillingGracePeriodEnds,
                amountOwed,
                ownerBillingGracePeriodEnd,
                delegateEmail,
                full: true,
                expenseReportPolicy: policy,
            });
            clearSelectedTransactions(true);
            turnOffMobileSelectionMode();
        }
    };

    const confirmPayment = ({paymentType: type, payAsBusiness, methodID, paymentMethod}: PaymentActionParams) => {
        if (!type || !chatReport) {
            return;
        }
        setPaymentType(type);
        setRequestType(CONST.IOU.REPORT_ACTION_TYPE.PAY);
        if (isDelegateAccessRestricted) {
            showDelegateNoAccessModal();
        } else if (isAnyTransactionOnHold) {
            setSelectedVBBAToPayFromHoldMenu(type === CONST.IOU.PAYMENT_TYPE.VBBA ? methodID : undefined);
            if (getPlatform() === CONST.PLATFORM.IOS) {
                // On iOS, opening the hold menu immediately can conflict with the popover dismiss animation, so we defer it.
                // eslint-disable-next-line @typescript-eslint/no-deprecated
                InteractionManager.runAfterInteractions(() => setIsHoldMenuVisible(true));
            } else {
                setIsHoldMenuVisible(true);
            }
        } else if (isInvoiceReport) {
            payInvoice({
                paymentMethodType: type,
                chatReport,
                invoiceReport: report,
                invoiceReportCurrentNextStepDeprecated: nextStep,
                introSelected,
                currentUserAccountIDParam: currentUserAccountID,
                currentUserEmailParam: currentUserEmail ?? '',
                payAsBusiness,
                existingB2BInvoiceReport,
                methodID,
                paymentMethod,
                activePolicy,
                betas,
                isSelfTourViewed,
            });
            clearSelectedTransactions(true);
            turnOffMobileSelectionMode();
        } else {
            payMoneyRequest({
                paymentType: type,
                chatReport,
                iouReport: report,
                introSelected,
                iouReportCurrentNextStepDeprecated: nextStep,
                currentUserAccountID,
                activePolicy,
                policy,
                betas,
                isSelfTourViewed,
                userBillingGracePeriodEnds,
                amountOwed,
                ownerBillingGracePeriodEnd,
                methodID: type === CONST.IOU.PAYMENT_TYPE.VBBA ? methodID : undefined,
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
            clearSelectedTransactions(true);
            turnOffMobileSelectionMode();
        }
    };

    // Keep confirmPaymentRef in sync so usePaymentOptions always calls the latest version.
    useEffect(() => {
        confirmPaymentRef.current = confirmPayment;
    });

    const handleApproveSelected = () => {
        confirmApproval();
    };

    // No-op: the Pay action has subMenuItems, so PopoverMenu navigates into the submenu
    // without calling onSelected. This handler exists only to satisfy the DropdownOption type.
    const handlePaySelected = () => {};

    const onSelectionModePaymentSelect = (event: KYCFlowEvent, iouPaymentType: PaymentMethodType, triggerKYCFlow: TriggerKYCFlow) => {
        if (shouldBlockAction(iouPaymentType)) {
            return;
        }
        // This callback fires via onSubItemSelected before the popover closes. Defer heavy payment
        // work so the dropdown dismiss animation completes first, avoiding perceived UI lag.
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        InteractionManager.runAfterInteractions(() => {
            selectPaymentType({
                event,
                iouPaymentType,
                triggerKYCFlow,
                policy,
                onPress: confirmPayment,
                currentAccountID: currentUserAccountID,
                currentEmail: currentUserEmail ?? '',
                hasViolations,
                isASAPSubmitBetaEnabled,
                isUserValidated,
                confirmApproval: () => confirmApproval(),
                iouReport: report,
                iouReportNextStep: nextStep,
                betas,
                userBillingGracePeriodEnds,
                amountOwed,
                ownerBillingGracePeriodEnd,
                delegateEmail,
                expenseReportPolicy: policy,
            });
        });
    };

    const selectionModeKYCSuccess = (type?: PaymentMethodType) => {
        confirmPayment({paymentType: type});
    };

    const hasActualPaymentOptions = paymentButtonOptions.some((opt) => Object.values(CONST.IOU.PAYMENT_TYPE).some((type) => type === opt.value));
    const hasPayInSelectionMode = allExpensesSelected && hasPayAction && hasActualPaymentOptions;

    const handleWorkspaceSelected = (wp: OnyxTypes.Policy) => {
        if (shouldBlockAction()) {
            return;
        }
        kycWallRef.current?.continueAction?.({policy: wp});
    };

    const paymentSubMenuItems = ((): PopoverMenuItem[] => {
        if (!workspacePolicyOptions.length) {
            return Object.values(paymentButtonOptions);
        }

        const result: PopoverMenuItem[] = [];
        let idx = 0;
        for (const opt of Object.values(paymentButtonOptions)) {
            result[idx++] = opt;
            if (opt.value === CONST.IOU.PAYMENT_TYPE.EXPENSIFY) {
                for (const wp of workspacePolicyOptions) {
                    result[idx++] = {
                        text: translate('iou.payWithPolicy', truncate(wp.name, {length: CONST.ADDITIONAL_ALLOWED_CHARACTERS}), ''),
                        icon: expensifyIcons.Building,
                        onSelected: () => handleWorkspaceSelected(wp),
                    };
                }
            }
        }

        return result;
    })();

    const selectionModeReportLevelActions = (() => {
        if (!isBulkSubmitApprovePayBetaEnabled) {
            return [];
        }
        const actions: Array<DropdownOption<string> & Pick<PopoverMenuItem, 'backButtonText' | 'rightIcon' | 'subMenuItems'>> = [];
        let idx = 0;
        if (hasSubmitAction && !shouldBlockSubmit) {
            actions[idx++] = {
                text: translate('common.submit'),
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
                onSelected: handleApproveSelected,
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
                onSelected: handlePaySelected,
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
        shouldBlockSubmit,
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
        hasApproveAction,
        totalAmount,
        canAllowSettlement,
        isAnyTransactionOnHold,
        isInvoiceReport,
        hasOnlyHeldExpenses: hasOnlyHeldExpensesReportUtils(report?.reportID, transactions),
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
export type {UseSelectionModeReportActionsParams};
