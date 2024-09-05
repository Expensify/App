import React from 'react';
import {StyleSheet, View} from 'react-native';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import {useOnyx} from 'react-native-onyx';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {isConnectionInProgress} from '@libs/actions/connections';
import * as PolicyUtils from '@libs/PolicyUtils';
import * as SubscriptionUtils from '@libs/SubscriptionUtils';
import * as UserUtils from '@libs/UserUtils';
import * as PaymentMethods from '@userActions/PaymentMethods';
import ONYXKEYS from '@src/ONYXKEYS';
import type {BankAccountList, FundList, LoginList, Policy, ReimbursementAccount, UserWallet, WalletTerms} from '@src/types/onyx';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

type CheckingMethod = () => boolean;

type IndicatorOnyxProps = {
    /** All the user's policies (from Onyx via withFullPolicy) */
    policies: OnyxCollection<Policy>;

    /** List of bank accounts */
    bankAccountList: OnyxEntry<BankAccountList>;

    /** List of user cards */
    fundList: OnyxEntry<FundList>;

    /** The user's wallet (coming from Onyx) */
    userWallet: OnyxEntry<UserWallet>;

    /** Bank account attached to free plan */
    reimbursementAccount: OnyxEntry<ReimbursementAccount>;

    /** Information about the user accepting the terms for payments */
    walletTerms: OnyxEntry<WalletTerms>;

    /** Login list for the user that is signed in */
    loginList: OnyxEntry<LoginList>;
};

type IndicatorProps = IndicatorOnyxProps;

function Indicator({reimbursementAccount, policies, bankAccountList, fundList, userWallet, walletTerms, loginList}: IndicatorOnyxProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const [allConnectionSyncProgresses] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS}`);

    // If a policy was just deleted from Onyx, then Onyx will pass a null value to the props, and
    // those should be cleaned out before doing any error checking
    const cleanPolicies = Object.fromEntries(Object.entries(policies ?? {}).filter(([, policy]) => policy?.id));

    // All of the error & info-checking methods are put into an array. This is so that using _.some() will return
    // early as soon as the first error / info condition is returned. This makes the checks very efficient since
    // we only care if a single error / info condition exists anywhere.
    const errorCheckingMethods: CheckingMethod[] = [
        () => Object.keys(userWallet?.errors ?? {}).length > 0,
        () => PaymentMethods.hasPaymentMethodError(bankAccountList, fundList),
        () => Object.values(cleanPolicies).some(PolicyUtils.hasPolicyError),
        () => Object.values(cleanPolicies).some(PolicyUtils.hasCustomUnitsError),
        () => Object.values(cleanPolicies).some(PolicyUtils.hasEmployeeListError),
        () =>
            Object.values(cleanPolicies).some((cleanPolicy) =>
                PolicyUtils.hasSyncError(
                    cleanPolicy,
                    isConnectionInProgress(allConnectionSyncProgresses?.[`${ONYXKEYS.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS}${cleanPolicy?.id}`], cleanPolicy),
                ),
            ),
        () => SubscriptionUtils.hasSubscriptionRedDotError(),
        () => Object.keys(reimbursementAccount?.errors ?? {}).length > 0,
        () => !!loginList && UserUtils.hasLoginListError(loginList),

        // Wallet term errors that are not caused by an IOU (we show the red brick indicator for those in the LHN instead)
        () => Object.keys(walletTerms?.errors ?? {}).length > 0 && !walletTerms?.chatReportID,
    ];
    const infoCheckingMethods: CheckingMethod[] = [() => !!loginList && UserUtils.hasLoginListInfo(loginList), () => SubscriptionUtils.hasSubscriptionGreenDotInfo()];
    const shouldShowErrorIndicator = errorCheckingMethods.some((errorCheckingMethod) => errorCheckingMethod());
    const shouldShowInfoIndicator = !shouldShowErrorIndicator && infoCheckingMethods.some((infoCheckingMethod) => infoCheckingMethod());

    const indicatorColor = shouldShowErrorIndicator ? theme.danger : theme.success;
    const indicatorStyles = [styles.alignItemsCenter, styles.justifyContentCenter, styles.statusIndicator(indicatorColor)];

    return (shouldShowErrorIndicator || shouldShowInfoIndicator) && <View style={StyleSheet.flatten(indicatorStyles)} />;
}

Indicator.displayName = 'Indicator';

export default function IndicatorOnyx(props: Omit<IndicatorProps, keyof IndicatorOnyxProps>) {
    const [policies, policiesMetadata] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [bankAccountList, bankAccountListMetadata] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST);
    const [reimbursementAccount, reimbursementAccountMetadata] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT);
    const [fundList, fundListMetadata] = useOnyx(ONYXKEYS.FUND_LIST);
    const [userWallet, userWalletMetadata] = useOnyx(ONYXKEYS.USER_WALLET);
    const [walletTerms, walletTermsMetadata] = useOnyx(ONYXKEYS.WALLET_TERMS);
    const [loginList, loginListMetadata] = useOnyx(ONYXKEYS.LOGIN_LIST);

    if (isLoadingOnyxValue(policiesMetadata, bankAccountListMetadata, reimbursementAccountMetadata, fundListMetadata, userWalletMetadata, walletTermsMetadata, loginListMetadata)) {
        return null;
    }

    return (
        <Indicator
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            policies={policies}
            bankAccountList={bankAccountList}
            reimbursementAccount={reimbursementAccount}
            fundList={fundList}
            userWallet={userWallet}
            walletTerms={walletTerms}
            loginList={loginList}
        />
    );
}
