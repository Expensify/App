import ActivityIndicator from '@components/ActivityIndicator';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import PlaidLink from '@components/PlaidLink';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';

import useBeforeRemove from '@hooks/useBeforeRemove';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import {clearLinkPlaidBankAccountErrors, clearPlaid, linkPlaidToBankAccount} from '@libs/actions/BankAccounts';
import {openPlaidBankLogin} from '@libs/actions/Plaid';
import Log from '@libs/Log';

import Navigation from '@navigation/Navigation';
import type {PlatformStackScreenProps} from '@navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@navigation/types';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import type {LinkAccount} from 'react-native-plaid-link-sdk';
import type {PlaidAccount} from 'react-plaid-link';

import React, {useEffect} from 'react';
import {View} from 'react-native';

type LinkPlaidToBankAccountPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.WALLET.DYNAMIC_BANK_ACCOUNT_LINK_PLAID>;

type PlaidLinkAccount = PlaidAccount | LinkAccount;

type LinkPlaidToBankAccountInnerProps = {
    /** ID of the bank account being (re)linked to Plaid */
    bankAccountID: number;

    /** Route to navigate back to when the flow is done, cancelled, or exited */
    backPath: Route;
};

function LinkPlaidToBankAccountInner({bankAccountID, backPath}: LinkPlaidToBankAccountInnerProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const [plaidLinkToken] = useOnyx(ONYXKEYS.RAM_ONLY_PLAID_LINK_TOKEN);
    const [isPlaidDisabled] = useOnyx(ONYXKEYS.IS_PLAID_DISABLED);
    const [bankAccountList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST);

    const policyID = bankAccountList?.[bankAccountID]?.accountData?.additionalData?.policyID;
    const isLoading = !!bankAccountList?.[bankAccountID]?.isLoading;

    useEffect(() => {
        openPlaidBankLogin(false, bankAccountID);
    }, [bankAccountID]);

    useBeforeRemove(() => {
        clearLinkPlaidBankAccountErrors(bankAccountID);
        clearPlaid();
    });

    const submit = (publicToken: string, account: PlaidLinkAccount | undefined) => {
        linkPlaidToBankAccount(bankAccountID, publicToken, account?.mask, policyID);
    };

    const handlePlaidSuccess = ({publicToken, accounts}: {publicToken: string; accounts: PlaidLinkAccount[]}) => {
        submit(publicToken, accounts.at(0));
    };

    if (isPlaidDisabled) {
        return (
            <View style={[styles.flex1, styles.alignItemsCenter, styles.justifyContentCenter, styles.ph5]}>
                <Text style={styles.formError}>{translate('bankAccount.error.tooManyAttempts')}</Text>
            </View>
        );
    }

    if (isLoading || !plaidLinkToken) {
        return (
            <View style={[styles.flex1, styles.alignItemsCenter, styles.justifyContentCenter]}>
                <ActivityIndicator size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE} />
            </View>
        );
    }

    return (
        <PlaidLink
            token={plaidLinkToken}
            onSuccess={({publicToken, metadata}) => handlePlaidSuccess({publicToken, accounts: metadata?.accounts ?? []})}
            onError={(error) => Log.hmmm('[LinkPlaidToBankAccount] PlaidLink error: ', error?.message)}
            onEvent={() => {}}
            onExit={() => Navigation.goBack(backPath)}
        />
    );
}

function LinkPlaidToBankAccountPage({route}: LinkPlaidToBankAccountPageProps) {
    const {translate} = useLocalize();
    const bankAccountID = Number(route.params?.bankAccountID);
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.BANK_ACCOUNT_LINK_PLAID.path);

    return (
        <ScreenWrapper testID={'LinkPlaidToBankAccountPage'}>
            <HeaderWithBackButton
                title={translate('walletPage.linkPlaid.title')}
                onBackButtonPress={() => Navigation.goBack(backPath)}
            />
            <FullPageOfflineBlockingView>
                <LinkPlaidToBankAccountInner
                    bankAccountID={bankAccountID}
                    backPath={backPath}
                />
            </FullPageOfflineBlockingView>
        </ScreenWrapper>
    );
}

export default LinkPlaidToBankAccountPage;
