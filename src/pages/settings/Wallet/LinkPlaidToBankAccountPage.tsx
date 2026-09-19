/**
 * Page for linking (or re-linking/fixing) an existing verified Business Bank Account to Plaid.
 * Reached from the Wallet page when the account is provisioned for the Expensify Card or its
 * policy is on the Expensify Card waitlist.
 */
import ActivityIndicator from '@components/ActivityIndicator';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import ConfirmationPage from '@components/ConfirmationPage';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import PlaidLink from '@components/PlaidLink';
import RenderHTML from '@components/RenderHTML';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';

import useBeforeRemove from '@hooks/useBeforeRemove';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import {clearLinkPlaidBankAccountErrors, clearPlaid, linkPlaidToBankAccount} from '@libs/actions/BankAccounts';
import {openPlaidBankLogin} from '@libs/actions/Plaid';
import {getPlaidLinkableCardPolicyID, hasBrokenPlaidConnection, isConnectedViaPlaid} from '@libs/BankAccountUtils';
import {getLatestErrorMessage} from '@libs/ErrorUtils';
import Log from '@libs/Log';

import Navigation from '@navigation/Navigation';
import type {PlatformStackScreenProps} from '@navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@navigation/types';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import cardOnWaitlistPolicyIDsSelector from '@selectors/CardOnWaitlist';
import React, {useEffect} from 'react';
import {View} from 'react-native';

type LinkPlaidToBankAccountPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.WALLET.DYNAMIC_BANK_ACCOUNT_LINK_PLAID>;

type LinkPlaidToBankAccountInnerProps = {
    /** ID of the bank account being (re)linked to Plaid */
    bankAccountID: number;

    /** Route to navigate back to when the flow is done, cancelled, or exited */
    backPath: Route;
};

function LinkPlaidToBankAccountInner({bankAccountID, backPath}: LinkPlaidToBankAccountInnerProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const illustrations = useMemoizedLazyIllustrations(['BankCheck', 'BankX']);

    const [plaidLinkToken] = useOnyx(ONYXKEYS.RAM_ONLY_PLAID_LINK_TOKEN);
    const [isPlaidDisabled] = useOnyx(ONYXKEYS.IS_PLAID_DISABLED);
    const [bankAccount] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST, {selector: (list) => list?.[bankAccountID]});
    const [cardOnWaitlistPolicyIDs] = useOnyx(ONYXKEYS.COLLECTION.NVP_EXPENSIFY_ON_CARD_WAITLIST, {selector: cardOnWaitlistPolicyIDsSelector});

    const policyID = getPlaidLinkableCardPolicyID(bankAccount, cardOnWaitlistPolicyIDs);
    const latestErrorMessage = getLatestErrorMessage(bankAccount);
    const isWrongAccountError = latestErrorMessage === CONST.ERROR.PLAID_WRONG_BANK_ACCOUNT;
    const isSuccess = !bankAccount?.isLoading && !latestErrorMessage && isConnectedViaPlaid(bankAccount?.accountData) && !hasBrokenPlaidConnection(bankAccount?.accountData);

    useEffect(() => {
        openPlaidBankLogin(false, bankAccountID);
    }, [bankAccountID]);

    useBeforeRemove(() => {
        clearLinkPlaidBankAccountErrors(bankAccountID);
        clearPlaid();
    });

    if (isPlaidDisabled) {
        return (
            <View style={[styles.flex1, styles.alignItemsCenter, styles.justifyContentCenter, styles.ph5]}>
                <Text style={styles.formError}>{translate('bankAccount.error.tooManyAttempts')}</Text>
            </View>
        );
    }

    if (isSuccess) {
        return (
            <ScrollView contentContainerStyle={styles.flexGrow1}>
                <ConfirmationPage
                    heading={translate('walletPage.linkPlaid.successHeading')}
                    description={translate('walletPage.linkPlaid.successDescription')}
                    descriptionStyle={styles.textSupportingNormal}
                    illustration={illustrations.BankCheck}
                    shouldShowButton
                    onButtonPress={() => Navigation.goBack(backPath)}
                    buttonText={translate('common.buttonConfirm')}
                    containerStyle={styles.h100}
                />
            </ScrollView>
        );
    }

    if (isWrongAccountError) {
        return (
            <ScrollView contentContainerStyle={styles.flexGrow1}>
                <ConfirmationPage
                    heading={translate('walletPage.linkPlaid.wrongAccountHeading')}
                    description={translate('walletPage.linkPlaid.wrongAccountDescription')}
                    descriptionStyle={styles.textSupportingNormal}
                    illustration={illustrations.BankX}
                    shouldShowButton
                    onButtonPress={() => Navigation.goBack(backPath)}
                    buttonText={translate('common.buttonConfirm')}
                    containerStyle={styles.h100}
                />
            </ScrollView>
        );
    }

    if (latestErrorMessage) {
        return (
            <ScrollView contentContainerStyle={styles.flexGrow1}>
                <ConfirmationPage
                    heading={translate('walletPage.linkPlaid.failureHeading')}
                    illustration={illustrations.BankX}
                    descriptionComponent={
                        <View style={[styles.renderHTML, styles.textAlignCenter, styles.mh5]}>
                            <RenderHTML html={translate('walletPage.linkPlaid.failureDescription')} />
                        </View>
                    }
                    shouldShowButton
                    onButtonPress={() => Navigation.goBack(backPath)}
                    buttonText={translate('common.buttonConfirm')}
                    containerStyle={styles.h100}
                />
            </ScrollView>
        );
    }

    if (plaidLinkToken) {
        return (
            <PlaidLink
                token={plaidLinkToken}
                onSuccess={({publicToken}) => {
                    Log.info('[PlaidLink] Success!');
                    linkPlaidToBankAccount(bankAccountID, publicToken, policyID);
                }}
                onError={(error) => Log.hmmm('[LinkPlaidToBankAccount] PlaidLink error: ', error?.message)}
                onEvent={() => {}}
                onExit={() => Navigation.goBack(backPath)}
            />
        );
    }

    return (
        <View style={[styles.flex1, styles.alignItemsCenter, styles.justifyContentCenter]}>
            <ActivityIndicator size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE} />
        </View>
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
