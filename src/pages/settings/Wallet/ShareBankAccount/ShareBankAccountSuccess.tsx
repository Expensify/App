import React from 'react';
import ConfirmationPage from '@components/ConfirmationPage';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {BrokenCompanyCardBankConnection} from '@components/Icon/Illustrations';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@navigation/Navigation';
import type {PlatformStackScreenProps} from '@navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@navigation/types';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type ShareBankAccountSuccessProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.WALLET.SHARE_BANK_ACCOUNT_SUCCESS>;

function ShareBankAccountSuccess({route}: ShareBankAccountSuccessProps) {
    const bankAccountID = route.params?.bankAccountID;
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const onButtonPress = () => {
        Navigation.goBack(ROUTES.SETTINGS_WALLET);
    };

    const onBackButtonPress = () => {
        Navigation.goBack(ROUTES.SETTINGS_WALLET_SHARE_BANK_ACCOUNT.getRoute(Number(bankAccountID)));
    };

    return (
        <ScreenWrapper testID={ShareBankAccountSuccess.displayName}>
            <HeaderWithBackButton
                title={translate('walletPage.bankAccountShared')}
                onBackButtonPress={onBackButtonPress}
            />
            <ConfirmationPage
                heading={translate('walletPage.shareBankAccountSuccess')}
                description={translate('walletPage.shareBankAccountSuccessDescription')}
                illustration={BrokenCompanyCardBankConnection}
                shouldShowButton
                illustrationStyle={styles.errorStateCardIllustration}
                onButtonPress={onButtonPress}
                buttonText={translate('common.buttonConfirm')}
                containerStyle={styles.h100}
            />
        </ScreenWrapper>
    );
}

ShareBankAccountSuccess.displayName = 'ShareBankAccountSuccess';

export default ShareBankAccountSuccess;
