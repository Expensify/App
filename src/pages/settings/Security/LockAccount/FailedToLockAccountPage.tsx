import React from 'react';
import ConfirmationPage from '@components/ConfirmationPage';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import ROUTES from '@src/ROUTES';

function FailedToLockAccountPage() {
    const illustrations = useMemoizedLazyIllustrations(['LockOpen']);
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    return (
        <ScreenWrapper
            testID="FailedToLockAccountPage"
            includeSafeAreaPaddingBottom
        >
            <HeaderWithBackButton
                onBackButtonPress={() => Navigation.goBack()}
                title={translate('lockAccountPage.lockAccount')}
            />
            <ScrollView contentContainerStyle={styles.flexGrow1}>
                <ConfirmationPage
                    illustration={illustrations.LockOpen}
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

export default FailedToLockAccountPage;
