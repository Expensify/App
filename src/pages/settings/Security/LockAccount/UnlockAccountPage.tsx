import React from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import ConfirmationPage from '@components/ConfirmationPage';
import HeaderPageLayout from '@components/HeaderPageLayout';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import variables from '@styles/variables';
import ROUTES from '@src/ROUTES';

function UnlockAccountPage() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    return (
        <>
            <HeaderWithBackButton
                onBackButtonPress={() => Navigation.goBack()}
                title={translate('lockAccountPage.lockAccount')}
            />
            <ScrollView contentContainerStyle={styles.flexGrow1}>
                <ConfirmationPage
                    illustration={Expensicons.EmptyStateSpyPigeon}
                    heading={translate('unlockAccountPage.yourAccountIsLocked')}
                    description={translate('unlockAccountPage.chatToConciergeToUnlock')}
                    shouldShowButton
                    buttonText={translate('unlockAccountPage.chatWithConcierge')}
                    onButtonPress={() => Navigation.navigate(ROUTES.CONCIERGE)}
                    containerStyle={styles.h100}
                />
            </ScrollView>
        </>
    );
}

UnlockAccountPage.displayName = 'UnlockAccountPage';
export default UnlockAccountPage;
