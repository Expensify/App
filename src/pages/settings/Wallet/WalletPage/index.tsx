import ActivityIndicator from '@components/ActivityIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';

import useDocumentTitle from '@hooks/useDocumentTitle';
import {useIsAppLoadPending} from '@hooks/useInFlightRequests';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

import {clearWalletError, getPaymentMethods} from '@userActions/PaymentMethods';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {UserWallet} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import isEmpty from 'lodash/isEmpty';
import React, {useEffect} from 'react';
import {View} from 'react-native';

import ExpensifyWalletSection from './ExpensifyWalletSection';
import WalletAssignedCardsSection from './WalletAssignedCardsSection';
import WalletBankAccountsSection from './WalletBankAccountsSection';

const hasWalletSelector = (userWallet: OnyxEntry<UserWallet>) => !isEmpty(userWallet);
const walletErrorsSelector = (userWallet: OnyxEntry<UserWallet>) => userWallet?.errors;

function WalletPage() {
    const [hasWallet = false] = useOnyx(ONYXKEYS.USER_WALLET, {selector: hasWalletSelector});
    const [walletErrors] = useOnyx(ONYXKEYS.USER_WALLET, {selector: walletErrorsSelector});
    const [countryByIp] = useOnyx(ONYXKEYS.COUNTRY);
    const isAppLoadPending = useIsAppLoadPending();
    const {isOffline} = useNetwork();
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    useDocumentTitle(translate('common.wallet'));

    useEffect(() => {
        if (isOffline) {
            return;
        }
        getPaymentMethods();
    }, [isOffline]);

    const shouldShowGBDisclaimer = countryByIp === CONST.COUNTRY.GB;
    const headerWithBackButton = (
        <HeaderWithBackButton
            title={translate('common.wallet')}
            shouldUseHeadlineHeader
            shouldShowBackButton={shouldUseNarrowLayout}
            shouldDisplaySearchRouter
            shouldDisplayHelpButton
        />
    );

    if (isAppLoadPending) {
        return (
            <ScreenWrapper
                testID="WalletPage"
                shouldShowOfflineIndicatorInWideScreen
            >
                {headerWithBackButton}
                <View style={[styles.flex1, styles.fullScreenLoading]}>
                    <ActivityIndicator size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE} />
                </View>
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper
            testID="WalletPage"
            shouldShowOfflineIndicatorInWideScreen
        >
            {headerWithBackButton}
            <ScrollView style={styles.pt3}>
                <View style={[styles.flex1, shouldUseNarrowLayout ? styles.workspaceSectionMobile : styles.workspaceSection]}>
                    <OfflineWithFeedback
                        style={styles.flex1}
                        contentContainerStyle={styles.flex1}
                        onClose={clearWalletError}
                        errors={walletErrors}
                        errorRowStyles={styles.ph6}
                    >
                        <WalletBankAccountsSection />
                        <WalletAssignedCardsSection />
                        {hasWallet && <ExpensifyWalletSection />}
                    </OfflineWithFeedback>
                    {!!shouldShowGBDisclaimer && <Text style={[styles.textMicroSupporting, styles.mh4, styles.mb5]}>{translate('workspace.companyCards.ukRegulation')}</Text>}
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
}

export default WalletPage;
