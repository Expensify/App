import React from 'react';
import {StyleSheet, View} from 'react-native';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import * as PolicyUtils from '@libs/PolicyUtils';
import * as SubscriptionUtils from '@libs/SubscriptionUtils';
import * as UserUtils from '@libs/UserUtils';
import * as PaymentMethods from '@userActions/PaymentMethods';
import ONYXKEYS from '@src/ONYXKEYS';
import type {BankAccountList, FundList, LoginList, Policy, ReimbursementAccount, UserWallet, WalletTerms} from '@src/types/onyx';

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

export default withOnyx<IndicatorProps, IndicatorOnyxProps>({
    policies: {
        key: ONYXKEYS.COLLECTION.POLICY,
    },
    bankAccountList: {
        key: ONYXKEYS.BANK_ACCOUNT_LIST,
    },
    // @ts-expect-error: ONYXKEYS.REIMBURSEMENT_ACCOUNT is conflicting with ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM
    reimbursementAccount: {
        key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
    },
    fundList: {
        key: ONYXKEYS.FUND_LIST,
    },
    userWallet: {
        key: ONYXKEYS.USER_WALLET,
    },
    walletTerms: {
        key: ONYXKEYS.WALLET_TERMS,
    },
    loginList: {
        key: ONYXKEYS.LOGIN_LIST,
    },
})(Indicator);
