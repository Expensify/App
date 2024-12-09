import {useMemo} from 'react';
import {useOnyx} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import {isConnectionInProgress} from '@libs/actions/connections';
import * as PolicyUtils from '@libs/PolicyUtils';
import * as SubscriptionUtils from '@libs/SubscriptionUtils';
import * as UserUtils from '@libs/UserUtils';
import * as PaymentMethods from '@userActions/PaymentMethods';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import useTheme from './useTheme';

type IndicatorStatus = ValueOf<typeof CONST.INDICATOR_STATUS>;

type IndicatorStatusResult = {
    indicatorColor: string;
    status: ValueOf<typeof CONST.INDICATOR_STATUS> | undefined;
    policyIDWithErrors: string | undefined;
};

function useIndicatorStatus(): IndicatorStatusResult {
    const theme = useTheme();
    const [allConnectionSyncProgresses] = useOnyx(ONYXKEYS.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS);
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [bankAccountList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST);
    const [reimbursementAccount] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT);
    const [fundList] = useOnyx(ONYXKEYS.FUND_LIST);
    const [userWallet] = useOnyx(ONYXKEYS.USER_WALLET);
    const [walletTerms] = useOnyx(ONYXKEYS.WALLET_TERMS);
    const [loginList] = useOnyx(ONYXKEYS.LOGIN_LIST);
    const [privatePersonalDetails] = useOnyx(ONYXKEYS.PRIVATE_PERSONAL_DETAILS);

    // If a policy was just deleted from Onyx, then Onyx will pass a null value to the props, and
    // those should be cleaned out before doing any error checking
    const cleanPolicies = useMemo(() => Object.fromEntries(Object.entries(policies ?? {}).filter(([, policy]) => policy?.id)), [policies]);

    const policyErrors = {
        [CONST.INDICATOR_STATUS.HAS_POLICY_ERRORS]: Object.values(cleanPolicies).find(PolicyUtils.shouldShowPolicyError),
        [CONST.INDICATOR_STATUS.HAS_CUSTOM_UNITS_ERROR]: Object.values(cleanPolicies).find(PolicyUtils.shouldShowCustomUnitsError),
        [CONST.INDICATOR_STATUS.HAS_EMPLOYEE_LIST_ERROR]: Object.values(cleanPolicies).find(PolicyUtils.shouldShowEmployeeListError),
        [CONST.INDICATOR_STATUS.HAS_SYNC_ERRORS]: Object.values(cleanPolicies).find((cleanPolicy) =>
            PolicyUtils.shouldShowSyncError(
                cleanPolicy,
                isConnectionInProgress(allConnectionSyncProgresses?.[`${ONYXKEYS.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS}${cleanPolicy?.id}`], cleanPolicy),
            ),
        ),
    };

    // All of the error & info-checking methods are put into an array. This is so that using _.some() will return
    // early as soon as the first error / info condition is returned. This makes the checks very efficient since
    // we only care if a single error / info condition exists anywhere.
    const errorChecking: Partial<Record<IndicatorStatus, boolean>> = {
        [CONST.INDICATOR_STATUS.HAS_USER_WALLET_ERRORS]: Object.keys(userWallet?.errors ?? {}).length > 0,
        [CONST.INDICATOR_STATUS.HAS_PAYMENT_METHOD_ERROR]: PaymentMethods.hasPaymentMethodError(bankAccountList, fundList),
        ...(Object.fromEntries(Object.entries(policyErrors).map(([error, policy]) => [error, !!policy])) as Record<keyof typeof policyErrors, boolean>),
        [CONST.INDICATOR_STATUS.HAS_SUBSCRIPTION_ERRORS]: SubscriptionUtils.hasSubscriptionRedDotError(),
        [CONST.INDICATOR_STATUS.HAS_REIMBURSEMENT_ACCOUNT_ERRORS]: Object.keys(reimbursementAccount?.errors ?? {}).length > 0,
        [CONST.INDICATOR_STATUS.HAS_LOGIN_LIST_ERROR]: !!loginList && UserUtils.hasLoginListError(loginList),
        // Wallet term errors that are not caused by an IOU (we show the red brick indicator for those in the LHN instead)
        [CONST.INDICATOR_STATUS.HAS_WALLET_TERMS_ERRORS]: Object.keys(walletTerms?.errors ?? {}).length > 0 && !walletTerms?.chatReportID,
        [CONST.INDICATOR_STATUS.HAS_PHONE_NUMBER_ERROR]: !!privatePersonalDetails?.errorFields?.phoneNumber ?? undefined,
    };

    const infoChecking: Partial<Record<IndicatorStatus, boolean>> = {
        [CONST.INDICATOR_STATUS.HAS_LOGIN_LIST_INFO]: !!loginList && UserUtils.hasLoginListInfo(loginList),
        [CONST.INDICATOR_STATUS.HAS_SUBSCRIPTION_INFO]: SubscriptionUtils.hasSubscriptionGreenDotInfo(),
    };

    const [error] = Object.entries(errorChecking).find(([, value]) => value) ?? [];
    const [info] = Object.entries(infoChecking).find(([, value]) => value) ?? [];

    const status = (error ?? info) as IndicatorStatus | undefined;
    const policyIDWithErrors = Object.values(policyErrors).find(Boolean)?.id;
    const indicatorColor = error ? theme.danger : theme.success;

    return {indicatorColor, status, policyIDWithErrors};
}

export default useIndicatorStatus;

export type {IndicatorStatus};
