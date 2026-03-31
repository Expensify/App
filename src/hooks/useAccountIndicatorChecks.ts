import {hasPaymentMethodError} from '@libs/actions/PaymentMethods';
import {hasPartiallySetupBankAccount, hasPersonalBankAccountMissingInfo} from '@libs/BankAccountUtils';
import {hasPendingExpensifyCardAction} from '@libs/CardUtils';
import {hasSubscriptionGreenDotInfo, hasSubscriptionRedDotError} from '@libs/SubscriptionUtils';
import {hasLoginListError, hasLoginListInfo} from '@libs/UserUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type IndicatorStatus from '@src/types/utils/IndicatorStatus';
import useCardFeedErrors from './useCardFeedErrors';
import useOnyx from './useOnyx';
import usePoliciesWithCardFeedErrors from './usePoliciesWithCardFeedErrors';

type AccountIndicatorChecksResult = {
    accountStatus: IndicatorStatus | undefined;
    infoStatus: IndicatorStatus | undefined;
};

function useAccountIndicatorChecks(): AccountIndicatorChecksResult {
    const [bankAccountList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST);
    const [fundList] = useOnyx(ONYXKEYS.FUND_LIST);
    const [userWallet] = useOnyx(ONYXKEYS.USER_WALLET);
    const [walletTerms] = useOnyx(ONYXKEYS.WALLET_TERMS);
    const [loginList] = useOnyx(ONYXKEYS.LOGIN_LIST);
    const [privatePersonalDetails] = useOnyx(ONYXKEYS.PRIVATE_PERSONAL_DETAILS);
    const [allCards] = useOnyx(`${ONYXKEYS.CARD_LIST}`);
    const [stripeCustomerId] = useOnyx(ONYXKEYS.NVP_PRIVATE_STRIPE_CUSTOMER_ID);
    const [retryBillingSuccessful] = useOnyx(ONYXKEYS.SUBSCRIPTION_RETRY_BILLING_STATUS_SUCCESSFUL);
    const [billingDisputePending] = useOnyx(ONYXKEYS.NVP_PRIVATE_BILLING_DISPUTE_PENDING);
    const [retryBillingFailed] = useOnyx(ONYXKEYS.SUBSCRIPTION_RETRY_BILLING_STATUS_FAILED);
    const [billingStatus] = useOnyx(ONYXKEYS.NVP_PRIVATE_BILLING_STATUS);
    const [amountOwed = 0] = useOnyx(ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED);
    const [ownerBillingGracePeriodEnd] = useOnyx(ONYXKEYS.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END);
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const [reimbursementAccount] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT);
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);

    const {
        companyCards: {shouldShowRBR: hasCompanyCardFeedErrors},
    } = useCardFeedErrors();
    const {isPolicyAdmin} = usePoliciesWithCardFeedErrors();

    const accountChecks: Partial<Record<IndicatorStatus, boolean>> = {
        [CONST.INDICATOR_STATUS.HAS_USER_WALLET_ERRORS]: Object.keys(userWallet?.errors ?? {}).length > 0,
        [CONST.INDICATOR_STATUS.HAS_PAYMENT_METHOD_ERROR]: hasPaymentMethodError(bankAccountList, fundList, allCards, session, policies),
        [CONST.INDICATOR_STATUS.HAS_SUBSCRIPTION_ERRORS]: hasSubscriptionRedDotError(
            stripeCustomerId,
            retryBillingSuccessful,
            billingDisputePending,
            retryBillingFailed,
            fundList,
            billingStatus,
            amountOwed,
            ownerBillingGracePeriodEnd,
        ),
        [CONST.INDICATOR_STATUS.HAS_REIMBURSEMENT_ACCOUNT_ERRORS]: Object.keys(reimbursementAccount?.errors ?? {}).length > 0,
        [CONST.INDICATOR_STATUS.HAS_LOGIN_LIST_ERROR]: !!loginList && hasLoginListError(loginList),
        // Wallet term errors that are not caused by an IOU (we show the red brick indicator for those in the LHN instead)
        [CONST.INDICATOR_STATUS.HAS_WALLET_TERMS_ERRORS]: Object.keys(walletTerms?.errors ?? {}).length > 0 && !walletTerms?.chatReportID,
        [CONST.INDICATOR_STATUS.HAS_PHONE_NUMBER_ERROR]: !!privatePersonalDetails?.errorFields?.phoneNumber,
        [CONST.INDICATOR_STATUS.HAS_EMPLOYEE_CARD_FEED_ERRORS]: !isPolicyAdmin ? hasCompanyCardFeedErrors : false,
        [CONST.INDICATOR_STATUS.HAS_LOCKED_BANK_ACCOUNT]: Object.values(bankAccountList ?? {}).some((bankAccount) => bankAccount?.accountData?.state === CONST.BANK_ACCOUNT.STATE.LOCKED),
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
            amountOwed,
            ownerBillingGracePeriodEnd,
        ),
        [CONST.INDICATOR_STATUS.HAS_PARTIALLY_SETUP_BANK_ACCOUNT_INFO]: hasPartiallySetupBankAccount(bankAccountList) || hasPersonalBankAccountMissingInfo(bankAccountList),
    };

    const [accountStatus] = Object.entries(accountChecks).find(([, value]) => value) ?? [];
    const [infoStatus] = Object.entries(infoChecks).find(([, value]) => value) ?? [];

    return {
        accountStatus: accountStatus as IndicatorStatus | undefined,
        infoStatus: infoStatus as IndicatorStatus | undefined,
    };
}

export default useAccountIndicatorChecks;
