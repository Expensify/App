import type {ValueOf} from 'type-fest';
import {isConnectionInProgress} from '@libs/actions/connections';
import {shouldShowQBOReimbursableExportDestinationAccountError} from '@libs/actions/connections/QuickbooksOnline';
import {hasPaymentMethodError} from '@libs/actions/PaymentMethods';
import {hasPartiallySetupBankAccount} from '@libs/BankAccountUtils';
import {hasPendingExpensifyCardAction} from '@libs/CardUtils';
import {getUberConnectionErrorDirectlyFromPolicy, shouldShowCustomUnitsError, shouldShowEmployeeListError, shouldShowPolicyError, shouldShowSyncError} from '@libs/PolicyUtils';
import {hasSubscriptionGreenDotInfo, hasSubscriptionRedDotError} from '@libs/SubscriptionUtils';
import {hasLoginListError, hasLoginListInfo} from '@libs/UserUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';
import useCardFeedErrors from './useCardFeedErrors';
import useOnyx from './useOnyx';
import usePoliciesWithCardFeedErrors from './usePoliciesWithCardFeedErrors';

type IndicatorStatus = ValueOf<typeof CONST.INDICATOR_STATUS>;

type NavigationTabBarChecksResult = {
    accountStatus: IndicatorStatus | undefined;
    policyStatus: IndicatorStatus | undefined;
    infoStatus: IndicatorStatus | undefined;
    policyIDWithErrors: string | undefined;
};

function useNavigationTabBarIndicatorChecks(): NavigationTabBarChecksResult {
    const [allConnectionSyncProgresses] = useOnyx(ONYXKEYS.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS, {canBeMissing: true});
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {canBeMissing: true});
    const [bankAccountList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST, {canBeMissing: true});
    const [reimbursementAccount] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {canBeMissing: true});
    const [fundList] = useOnyx(ONYXKEYS.FUND_LIST, {canBeMissing: true});
    const [userWallet] = useOnyx(ONYXKEYS.USER_WALLET, {canBeMissing: true});
    const [walletTerms] = useOnyx(ONYXKEYS.WALLET_TERMS, {canBeMissing: true});
    const [loginList] = useOnyx(ONYXKEYS.LOGIN_LIST, {canBeMissing: true});
    const [privatePersonalDetails] = useOnyx(ONYXKEYS.PRIVATE_PERSONAL_DETAILS, {canBeMissing: true});
    const [allCards] = useOnyx(`${ONYXKEYS.CARD_LIST}`, {canBeMissing: true});
    const [stripeCustomerId] = useOnyx(ONYXKEYS.NVP_PRIVATE_STRIPE_CUSTOMER_ID, {canBeMissing: true});
    const [retryBillingSuccessful] = useOnyx(ONYXKEYS.SUBSCRIPTION_RETRY_BILLING_STATUS_SUCCESSFUL, {canBeMissing: true});
    const [billingDisputePending] = useOnyx(ONYXKEYS.NVP_PRIVATE_BILLING_DISPUTE_PENDING, {canBeMissing: true});
    const [retryBillingFailed] = useOnyx(ONYXKEYS.SUBSCRIPTION_RETRY_BILLING_STATUS_FAILED, {canBeMissing: true});
    const [billingStatus] = useOnyx(ONYXKEYS.NVP_PRIVATE_BILLING_STATUS, {canBeMissing: true});
    const [session] = useOnyx(ONYXKEYS.SESSION, {canBeMissing: true});

    const {
        companyCards: {shouldShowRBR: hasCompanyCardFeedErrors},
    } = useCardFeedErrors();
    const {policiesWithCardFeedErrors, isPolicyAdmin} = usePoliciesWithCardFeedErrors();

    // If a policy was just deleted from Onyx, then Onyx will pass a null value to the props, and
    // those should be cleaned out before doing any error checking
    const cleanPolicies = Object.values(policies ?? {}).filter((policy) => policy?.id);

    const policyChecks: Partial<Record<IndicatorStatus, Policy | undefined>> = {
        [CONST.INDICATOR_STATUS.HAS_POLICY_ERRORS]: cleanPolicies.find(shouldShowPolicyError),
        [CONST.INDICATOR_STATUS.HAS_CUSTOM_UNITS_ERROR]: cleanPolicies.find(shouldShowCustomUnitsError),
        [CONST.INDICATOR_STATUS.HAS_EMPLOYEE_LIST_ERROR]: cleanPolicies.find(shouldShowEmployeeListError),
        [CONST.INDICATOR_STATUS.HAS_SYNC_ERRORS]: cleanPolicies.find((cleanPolicy) =>
            shouldShowSyncError(cleanPolicy, isConnectionInProgress(allConnectionSyncProgresses?.[`${ONYXKEYS.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS}${cleanPolicy?.id}`], cleanPolicy)),
        ),
        [CONST.INDICATOR_STATUS.HAS_QBO_EXPORT_ERROR]: cleanPolicies.find(shouldShowQBOReimbursableExportDestinationAccountError),
        [CONST.INDICATOR_STATUS.HAS_UBER_CREDENTIALS_ERROR]: cleanPolicies.find(getUberConnectionErrorDirectlyFromPolicy),
        [CONST.INDICATOR_STATUS.HAS_POLICY_ADMIN_CARD_FEED_ERRORS]: isPolicyAdmin ? policiesWithCardFeedErrors.at(0) : undefined,
    };

    // All the error & info-checking methods are put into an array. This is so that using _.some() will return
    // early as soon as the first error / info condition is returned. This makes the checks very efficient since
    // we only care if a single error / info condition exists anywhere.
    const accountChecks: Partial<Record<IndicatorStatus, boolean>> = {
        [CONST.INDICATOR_STATUS.HAS_USER_WALLET_ERRORS]: Object.keys(userWallet?.errors ?? {}).length > 0,
        [CONST.INDICATOR_STATUS.HAS_PAYMENT_METHOD_ERROR]: hasPaymentMethodError(bankAccountList, fundList, allCards),
        [CONST.INDICATOR_STATUS.HAS_SUBSCRIPTION_ERRORS]: hasSubscriptionRedDotError(
            stripeCustomerId,
            retryBillingSuccessful,
            billingDisputePending,
            retryBillingFailed,
            fundList,
            billingStatus,
        ),
        [CONST.INDICATOR_STATUS.HAS_REIMBURSEMENT_ACCOUNT_ERRORS]: Object.keys(reimbursementAccount?.errors ?? {}).length > 0,
        [CONST.INDICATOR_STATUS.HAS_LOGIN_LIST_ERROR]: !!loginList && hasLoginListError(loginList),
        // Wallet term errors that are not caused by an IOU (we show the red brick indicator for those in the LHN instead)
        [CONST.INDICATOR_STATUS.HAS_WALLET_TERMS_ERRORS]: Object.keys(walletTerms?.errors ?? {}).length > 0 && !walletTerms?.chatReportID,
        [CONST.INDICATOR_STATUS.HAS_PHONE_NUMBER_ERROR]: !!privatePersonalDetails?.errorFields?.phoneNumber,
        [CONST.INDICATOR_STATUS.HAS_EMPLOYEE_CARD_FEED_ERRORS]: !isPolicyAdmin ? hasCompanyCardFeedErrors : false,
    };

    const infoChecks: Partial<Record<IndicatorStatus, boolean>> = {
        [CONST.INDICATOR_STATUS.HAS_LOGIN_LIST_INFO]: !!loginList && hasLoginListInfo(loginList, session?.email),
        [CONST.INDICATOR_STATUS.HAS_PENDING_CARD_INFO]: hasPendingExpensifyCardAction(allCards, privatePersonalDetails),
        [CONST.INDICATOR_STATUS.HAS_SUBSCRIPTION_INFO]: hasSubscriptionGreenDotInfo(
            stripeCustomerId,
            retryBillingSuccessful,
            billingDisputePending,
            retryBillingFailed,
            fundList,
            billingStatus,
        ),
        [CONST.INDICATOR_STATUS.HAS_PARTIALLY_SETUP_BANK_ACCOUNT_INFO]: hasPartiallySetupBankAccount(bankAccountList),
    };

    const [accountStatus] = Object.entries(accountChecks).find(([, value]) => value) ?? [];
    const [policyStatus] = Object.entries(policyChecks).find(([, value]) => value) ?? [];
    const [infoStatus] = Object.entries(infoChecks).find(([, value]) => value) ?? [];

    const policyIDWithErrors = Object.values(policyChecks).find(Boolean)?.id;

    return {
        accountStatus: accountStatus as IndicatorStatus | undefined,
        policyStatus: policyStatus as IndicatorStatus | undefined,
        infoStatus: infoStatus as IndicatorStatus | undefined,
        policyIDWithErrors,
    };
}

export default useNavigationTabBarIndicatorChecks;

export type {IndicatorStatus};
