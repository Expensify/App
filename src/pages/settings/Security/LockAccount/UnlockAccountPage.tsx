import React from 'react';
import ConfirmationPage from '@components/ConfirmationPage';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Expensicons from '@components/Icon/Expensicons';
import ScrollView from '@components/ScrollView';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import ROUTES from '@src/ROUTES';

function UnlockAccountPage() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    return (
        <>
            <HeaderWithBackButton
                onBackButtonPress={() => Navigation.dismissModal()}
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
