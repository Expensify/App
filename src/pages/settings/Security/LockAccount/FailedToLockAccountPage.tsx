import React from 'react';
import ConfirmationPage from '@components/ConfirmationPage';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Illustrations from '@components/Icon/Illustrations';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import ROUTES from '@src/ROUTES';

function FailedToLockAccountPage() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    return (
        <ScreenWrapper
            testID={FailedToLockAccountPage.displayName}
            includeSafeAreaPaddingBottom
        >
            <HeaderWithBackButton
                onBackButtonPress={() => Navigation.goBack()}
                title={translate('lockAccountPage.lockAccount')}
            />
            <ScrollView contentContainerStyle={styles.flexGrow1}>
                <ConfirmationPage
                    illustration={Illustrations.LockOpen}
                    heading={translate('failedToLockAccountPage.failedToLockAccount')}
                    description={translate('failedToLockAccountPage.failedToLockAccountDescription')}
                    shouldShowButton
                    descriptionStyle={styles.colorMuted}
                    buttonText={translate('failedToLockAccountPage.chatWithConcierge')}
                    onButtonPress={() => Navigation.navigate(ROUTES.CONCIERGE)}
                    containerStyle={styles.h100}
                />
            </ScrollView>
        </ScreenWrapper>
    );
}

FailedToLockAccountPage.displayName = 'FailedToLockAccountPage';

export default FailedToLockAccountPage;
