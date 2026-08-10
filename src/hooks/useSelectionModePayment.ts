import {useDelegateNoAccessActions, useDelegateNoAccessState} from '@components/DelegateNoAccessModalProvider';
import {KYCWallContext} from '@components/KYCWall/KYCWallContext';
import {useLockedAccountActions, useLockedAccountState} from '@components/LockedAccountModalProvider';
import type {PopoverMenuItem} from '@components/PopoverMenu';
import type {ActionHandledType} from '@components/ProcessMoneyReportHoldMenu';
import {useSearchQueryContext, useSearchResultsContext} from '@components/Search/SearchContext';
import type {PaymentActionParams} from '@components/SettlementButton/types';

import {payInvoice, payMoneyRequest} from '@libs/actions/IOU/PayMoneyRequest';
import {generateDefaultWorkspaceName} from '@libs/actions/Policy/Policy';
import deferModalPresentationAfterPopoverDismiss from '@libs/deferModalPresentationAfterPopoverDismiss';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {isTrackOnboardingChoice} from '@libs/OnboardingUtils';
import type {KYCFlowEvent, TriggerKYCFlow, WorkspacePolicyPaymentOption} from '@libs/PaymentUtils';
import {selectPaymentType} from '@libs/PaymentUtils';
import {sortPoliciesByName} from '@libs/PolicyUtils';
import {hasRequestFromCurrentAccount} from '@libs/ReportActionsUtils';
import {hasHeldExpensesFromTransactions, hasViolations as hasViolationsReportUtils, isInvoiceReport as isInvoiceReportUtil, isIOUReport as isIOUReportUtil} from '@libs/ReportUtils';
import refreshSearchAfterReportAction from '@libs/SearchRefreshUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
import type {PaymentMethodType} from '@src/types/onyx/OriginalMessage';

import {delegateEmailSelector} from '@selectors/Account';
import {hasSeenTourSelector} from '@selectors/Onboarding';
import {personalDetailsLoginSelector} from '@selectors/PersonalDetails';
import truncate from 'lodash/truncate';
import {useContext, useEffect, useRef} from 'react';

import useActiveAdminPolicies from './useActiveAdminPolicies';
import {useCurrencyListActions} from './useCurrencyList';
import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useDelegateAccountID from './useDelegateAccountID';
import useLastWorkspaceNumber from './useLastWorkspaceNumber';
import {useMemoizedLazyExpensifyIcons} from './useLazyAsset';
import useLocalize from './useLocalize';
import useNetwork from './useNetwork';
import useOnyx from './useOnyx';
import useParticipantsInvoiceReport from './useParticipantsInvoiceReport';
import usePayChatReportActions from './usePayChatReportActions';
import usePaymentOptions from './usePaymentOptions';
import usePermissions from './usePermissions';
import usePolicy from './usePolicy';
import useSearchShouldCalculateTotals from './useSearchShouldCalculateTotals';
import useVerifyAccountAndResume from './useVerifyAccountAndResume';

type HoldMenuOpenParams = {
    requestType: ActionHandledType;
    paymentType: PaymentMethodType;
    methodID?: number;
};

type UseSelectionModePaymentParams = {
    reportID: string | undefined;
    transactions: OnyxTypes.Transaction[];
    formattedAmount: string;
    shouldHidePaymentOptions: boolean;
    onlyShowPayElsewhere: boolean;
    hasPayAction: boolean;
    allExpensesSelected: boolean;
    onHoldMenuOpen: (params: HoldMenuOpenParams) => void;
    onPaymentComplete: () => void;
    onPaid?: () => void;
    confirmApproval: () => void;
};

function useSelectionModePayment({
    reportID,
    transactions,
    formattedAmount,
    shouldHidePaymentOptions,
    onlyShowPayElsewhere,
    hasPayAction,
    allExpensesSelected,
    onHoldMenuOpen,
    onPaymentComplete,
    onPaid,
    confirmApproval,
}: UseSelectionModePaymentParams) {
    const {translate, localeCompare} = useLocalize();
    const {getCurrencyDecimals} = useCurrencyListActions();
    const {isOffline} = useNetwork();
    const {isBetaEnabled} = usePermissions();
    const isASAPSubmitBetaEnabled = isBetaEnabled(CONST.BETAS.ASAP_SUBMIT);
    const activeAdminPolicies = useActiveAdminPolicies();
    const lastWorkspaceNumber = useLastWorkspaceNumber();

    const {currentSearchQueryJSON, currentSearchKey} = useSearchQueryContext();
    const {currentSearchResults} = useSearchResultsContext();
    const shouldCalculateTotals = useSearchShouldCalculateTotals(currentSearchKey, currentSearchQueryJSON?.hash, true);

    const [moneyRequestReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(reportID)}`);
    const [ownerLogin] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {selector: personalDetailsLoginSelector(moneyRequestReport?.ownerAccountID)});
    const [chatReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(moneyRequestReport?.chatReportID)}`);
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${getNonEmptyStringOnyxID(moneyRequestReport?.policyID)}`);
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const [delegateEmail] = useOnyx(ONYXKEYS.ACCOUNT, {selector: delegateEmailSelector});
    const [allTransactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS);
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const [userBillingGracePeriodEnds] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_USER_BILLING_GRACE_PERIOD_END);
    const [amountOwed] = useOnyx(ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED);
    const [ownerBillingGracePeriodEnd] = useOnyx(ONYXKEYS.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END);
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const [conciergeChat] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${conciergeReportID}`);
    const [isSelfTourViewed = false] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {selector: hasSeenTourSelector});

    const {accountID, login: currentUserLogin, localCurrencyCode} = useCurrentUserPersonalDetails();
    const delegateAccountID = useDelegateAccountID();
    const email = session?.email;

    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID);
    const isTrackIntentUser = isTrackOnboardingChoice(introSelected?.choice);
    const activePolicy = usePolicy(activePolicyID);
    const chatReportPolicy = usePolicy(chatReport?.policyID);
    const existingB2BInvoiceReport = useParticipantsInvoiceReport(activePolicyID, CONST.REPORT.INVOICE_RECEIVER_TYPE.BUSINESS, chatReport?.policyID);
    const getChatReportActions = usePayChatReportActions(chatReport, existingB2BInvoiceReport);

    const {isDelegateAccessRestricted} = useDelegateNoAccessState();
    const {showDelegateNoAccessModal} = useDelegateNoAccessActions();
    const {isAccountLocked} = useLockedAccountState();
    const {showLockedAccountModal} = useLockedAccountActions();
    const kycWallRef = useContext(KYCWallContext);

    // Store the pending payment and resume it after the user validates, instead of dropping it on the way to the magic-code screen.
    const {isUserValidated, verifyAccountAndResume} = useVerifyAccountAndResume((retry) => retry?.());

    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Cash', 'ArrowRight', 'Building'] as const);

    const hasViolations = hasViolationsReportUtils(moneyRequestReport?.reportID, allTransactionViolations, accountID, email ?? '');
    const isInvoiceReport = isInvoiceReportUtil(moneyRequestReport);
    const isAnyTransactionOnHold = hasHeldExpensesFromTransactions(transactions);

    const presentBlockingAction = (action: () => void, deferBlockingPresentation: boolean) => {
        if (deferBlockingPresentation) {
            deferModalPresentationAfterPopoverDismiss(action);
        } else {
            action();
        }
    };

    const shouldBlockAction = (paymentMethodType?: PaymentMethodType, deferBlockingPresentation = false, retry?: () => void) => {
        if (isDelegateAccessRestricted) {
            presentBlockingAction(showDelegateNoAccessModal, deferBlockingPresentation);
            return true;
        }
        if (isAccountLocked) {
            presentBlockingAction(showLockedAccountModal, deferBlockingPresentation);
            return true;
        }
        if (!isUserValidated && paymentMethodType !== CONST.IOU.PAYMENT_TYPE.ELSEWHERE) {
            presentBlockingAction(() => verifyAccountAndResume(retry), deferBlockingPresentation);
            return true;
        }
        return false;
    };

    const runPaymentAction = (paymentMethodType: PaymentMethodType | undefined, deferBlockingPresentation: boolean, action: () => void) => {
        if (shouldBlockAction(paymentMethodType, deferBlockingPresentation, action)) {
            return;
        }
        action();
    };

    const confirmPaymentRef = useRef<(params: PaymentActionParams) => void>(() => {});

    const confirmPayment = ({paymentType: type, payAsBusiness, methodID, paymentMethod}: PaymentActionParams) => {
        if (!type || !chatReport) {
            return;
        }

        if (isDelegateAccessRestricted) {
            showDelegateNoAccessModal();
            return;
        }

        if (isAnyTransactionOnHold) {
            onHoldMenuOpen({
                requestType: CONST.IOU.REPORT_ACTION_TYPE.PAY,
                paymentType: type,
                methodID: type === CONST.IOU.PAYMENT_TYPE.VBBA ? methodID : undefined,
            });
            return;
        }

        if (isInvoiceReport) {
            payInvoice({
                getCurrencyDecimals,
                paymentMethodType: type,
                chatReport,
                invoiceReport: moneyRequestReport,
                introSelected,
                currentUserAccountIDParam: accountID,
                currentUserEmailParam: email ?? '',
                currentUserLocalCurrency: localCurrencyCode ?? CONST.CURRENCY.USD,
                payAsBusiness,
                existingB2BInvoiceReport,
                methodID,
                paymentMethod,
                activePolicy,
                conciergeChat,
                betas,
                isSelfTourViewed,
                defaultWorkspaceName: generateDefaultWorkspaceName(email ?? '', lastWorkspaceNumber, translate),
                chatReportActions: getChatReportActions(payAsBusiness),
                delegateAccountID,
                isTrackIntentUser,
            });
        } else {
            payMoneyRequest({
                getCurrencyDecimals,
                paymentType: type,
                chatReport,
                iouReport: moneyRequestReport,
                introSelected,
                currentUserAccountID: accountID,
                currentUserLogin: currentUserLogin ?? '',
                activePolicy,
                policy,
                chatReportPolicy,
                betas,
                isSelfTourViewed,
                userBillingGracePeriodEnds,
                amountOwed,
                ownerBillingGracePeriodEnd,
                methodID: type === CONST.IOU.PAYMENT_TYPE.VBBA ? methodID : undefined,
                onPaid,
                chatReportActions: getChatReportActions(false),
                delegateAccountID,
                isTrackIntentUser,
                conciergeChat,
            });
            refreshSearchAfterReportAction({
                currentSearchQueryJSON,
                currentSearchKey,
                shouldCalculateTotals,
                isOffline,
                isLoading: !!currentSearchResults?.search?.isLoading,
            });
        }

        onPaymentComplete();
    };

    useEffect(() => {
        confirmPaymentRef.current = confirmPayment;
    });

    const paymentButtonOptions = usePaymentOptions({
        currency: moneyRequestReport?.currency,
        iouReport: moneyRequestReport,
        chatReportID: chatReport?.reportID,
        formattedAmount,
        policyID: moneyRequestReport?.policyID,
        onPress: (params: PaymentActionParams) => confirmPaymentRef.current(params),
        shouldHidePaymentOptions,
        shouldShowApproveButton: false,
        shouldDisableApproveButton: false,
        onlyShowPayElsewhere,
    });

    const workspacePolicyOptions = (() => {
        if (!isIOUReportUtil(moneyRequestReport)) {
            return [];
        }
        const hasPersonalPaymentOption = paymentButtonOptions.some((opt) => opt.value === CONST.IOU.PAYMENT_TYPE.EXPENSIFY);
        if (!hasPersonalPaymentOption || !activeAdminPolicies.length) {
            return [];
        }
        const canUseBusinessBankAccount = !!moneyRequestReport?.reportID && !hasRequestFromCurrentAccount(moneyRequestReport, accountID ?? CONST.DEFAULT_NUMBER_ID);
        if (!canUseBusinessBankAccount) {
            return [];
        }
        return sortPoliciesByName(activeAdminPolicies, localeCompare);
    })();

    const handleWorkspaceSelected = (wp: OnyxTypes.Policy) => {
        runPaymentAction(undefined, true, () => kycWallRef.current?.continueAction?.({policy: wp}));
    };

    const paymentSubMenuItems: PopoverMenuItem[] = (() => {
        if (!workspacePolicyOptions.length) {
            return [...Object.values(paymentButtonOptions)];
        }
        const result: PopoverMenuItem[] = [];
        for (const opt of Object.values(paymentButtonOptions)) {
            result.push(opt);
            if (opt.value === CONST.IOU.PAYMENT_TYPE.EXPENSIFY) {
                for (const wp of workspacePolicyOptions) {
                    const workspacePolicyItem: WorkspacePolicyPaymentOption = {
                        text: translate('iou.payWithPolicy', truncate(wp.name, {length: CONST.ADDITIONAL_ALLOWED_CHARACTERS}), ''),
                        icon: expensifyIcons.Building,
                        workspacePolicy: wp,
                    };
                    result.push(workspacePolicyItem);
                }
            }
        }
        return result;
    })();

    const invokePaymentSelect = (event: KYCFlowEvent, iouPaymentType: PaymentMethodType, triggerKYCFlow: TriggerKYCFlow) => {
        selectPaymentType({
            getCurrencyDecimals,
            event,
            iouPaymentType,
            triggerKYCFlow,
            policy,
            onPress: confirmPayment,
            currentAccountID: accountID,
            currentEmail: email ?? '',
            hasViolations,
            isASAPSubmitBetaEnabled,
            confirmApproval,
            iouReport: moneyRequestReport,
            betas,
            userBillingGracePeriodEnds,
            amountOwed,
            ownerBillingGracePeriodEnd,
            delegateEmail,
            expenseReportPolicy: policy,
            isTrackIntentUser,
            ownerLogin,
            delegateAccountID,
        });
    };

    const onSelectionModePaymentSelect = (event: KYCFlowEvent, iouPaymentType: PaymentMethodType, triggerKYCFlow: TriggerKYCFlow) => {
        runPaymentAction(iouPaymentType, true, () => invokePaymentSelect(event, iouPaymentType, triggerKYCFlow));
    };

    const selectionModeKYCSuccess = (type?: PaymentMethodType) => {
        confirmPayment({paymentType: type});
    };

    const hasActualPaymentOptions = paymentButtonOptions.some((opt) => Object.values(CONST.IOU.PAYMENT_TYPE).some((type) => type === opt.value));
    const hasPayInSelectionMode = allExpensesSelected && hasPayAction && hasActualPaymentOptions;

    return {
        confirmPayment,
        runPaymentAction,
        invokePaymentSelect,
        onSelectionModePaymentSelect,
        selectionModeKYCSuccess,
        paymentSubMenuItems,
        handleWorkspaceSelected,
        hasPayInSelectionMode,
        hasActualPaymentOptions,
        isAnyTransactionOnHold,
        isInvoiceReport,
        kycWallRef,
    };
}

export default useSelectionModePayment;
