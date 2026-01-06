import type {ValueOf} from 'type-fest';
import {hasPaymentMethodError} from '@libs/actions/PaymentMethods';
import {hasPartiallySetupBankAccount} from '@libs/BankAccountUtils';
import {checkIfFeedConnectionIsBroken, hasPendingExpensifyCardAction} from '@libs/CardUtils';
import {hasSubscriptionGreenDotInfo, hasSubscriptionRedDotError} from '@libs/SubscriptionUtils';
import {hasLoginListError, hasLoginListInfo} from '@libs/UserUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import useOnyx from './useOnyx';
import useTheme from './useTheme';

type AccountTabIndicatorStatus = ValueOf<typeof CONST.INDICATOR_STATUS>;

type AccountTabIndicatorStatusResult = {
    indicatorColor: string;
    status: ValueOf<typeof CONST.INDICATOR_STATUS> | undefined;
};

function useAccountTabIndicatorStatus(): AccountTabIndicatorStatusResult {
    const theme = useTheme();
    const [bankAccountList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST, {canBeMissing: true});
    const [reimbursementAccount] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {canBeMissing: true});
    const [fundList] = useOnyx(ONYXKEYS.FUND_LIST, {canBeMissing: true});
    const [userWallet] = useOnyx(ONYXKEYS.USER_WALLET, {canBeMissing: true});
    const [walletTerms] = useOnyx(ONYXKEYS.WALLET_TERMS, {canBeMissing: true});
    const [loginList] = useOnyx(ONYXKEYS.LOGIN_LIST, {canBeMissing: true});
    const [privatePersonalDetails] = useOnyx(ONYXKEYS.PRIVATE_PERSONAL_DETAILS, {canBeMissing: true});
    const [allCards] = useOnyx(`${ONYXKEYS.CARD_LIST}`, {canBeMissing: true});
    const hasBrokenFeedConnection = checkIfFeedConnectionIsBroken(allCards, CONST.EXPENSIFY_CARD.BANK);
    const [session] = useOnyx(ONYXKEYS.SESSION, {canBeMissing: true});
    const [stripeCustomerId] = useOnyx(ONYXKEYS.NVP_PRIVATE_STRIPE_CUSTOMER_ID, {canBeMissing: true});
    const [retryBillingSuccessful] = useOnyx(ONYXKEYS.SUBSCRIPTION_RETRY_BILLING_STATUS_SUCCESSFUL, {canBeMissing: true});
    const [billingDisputePending] = useOnyx(ONYXKEYS.NVP_PRIVATE_BILLING_DISPUTE_PENDING, {canBeMissing: true});
    const [retryBillingFailed] = useOnyx(ONYXKEYS.SUBSCRIPTION_RETRY_BILLING_STATUS_FAILED, {canBeMissing: true});
    const [billingStatus] = useOnyx(ONYXKEYS.NVP_PRIVATE_BILLING_STATUS, {canBeMissing: true});
    // All of the error & info-checking methods are put into an array. This is so that using _.some() will return
    // early as soon as the first error / info condition is returned. This makes the checks very efficient since
    // we only care if a single error / info condition exists anywhere.
    const errorChecking: Partial<Record<AccountTabIndicatorStatus, boolean>> = {
        [CONST.INDICATOR_STATUS.HAS_USER_WALLET_ERRORS]: Object.keys(userWallet?.errors ?? {}).length > 0,
        [CONST.INDICATOR_STATUS.HAS_PAYMENT_METHOD_ERROR]: hasPaymentMethodError(bankAccountList, fundList, allCards),
        [CONST.INDICATOR_STATUS.HAS_REIMBURSEMENT_ACCOUNT_ERRORS]: Object.keys(reimbursementAccount?.errors ?? {}).length > 0,
        [CONST.INDICATOR_STATUS.HAS_LOGIN_LIST_ERROR]: !!loginList && hasLoginListError(loginList),
        // Wallet term errors that are not caused by an IOU (we show the red brick indicator for those in the LHN instead)
        [CONST.INDICATOR_STATUS.HAS_WALLET_TERMS_ERRORS]: Object.keys(walletTerms?.errors ?? {}).length > 0 && !walletTerms?.chatReportID,
        [CONST.INDICATOR_STATUS.HAS_CARD_CONNECTION_ERROR]: hasBrokenFeedConnection,
        [CONST.INDICATOR_STATUS.HAS_PHONE_NUMBER_ERROR]: !!privatePersonalDetails?.errorFields?.phoneNumber,
        [CONST.INDICATOR_STATUS.HAS_SUBSCRIPTION_ERRORS]: hasSubscriptionRedDotError(
            stripeCustomerId,
            retryBillingSuccessful,
            billingDisputePending,
            retryBillingFailed,
            fundList,
            billingStatus,
        ),
    };

    const infoChecking: Partial<Record<AccountTabIndicatorStatus, boolean>> = {
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

    const [error] = Object.entries(errorChecking).find(([, value]) => value) ?? [];
    const [info] = Object.entries(infoChecking).find(([, value]) => value) ?? [];

    const status = (error ?? info) as AccountTabIndicatorStatus | undefined;
    const indicatorColor = error ? theme.danger : theme.success;

    return {indicatorColor, status};
}

export default useAccountTabIndicatorStatus;
