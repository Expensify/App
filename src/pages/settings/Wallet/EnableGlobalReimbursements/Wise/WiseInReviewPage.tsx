import ConfirmationPage from '@components/ConfirmationPage';
import Header from '@components/Header';
import ScreenWrapper from '@components/ScreenWrapper';

import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import Navigation from '@navigation/Navigation';

import ROUTES from '@src/ROUTES';

import React from 'react';

/** Where the admin lands after Wise's page, while Wise reviews the business */
function WiseInReviewPage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const illustrations = useMemoizedLazyIllustrations(['Hourglass']);

    const closeFlow = () => Navigation.goBack(ROUTES.SETTINGS_WALLET);

    return (
        <ScreenWrapper testID="WiseInReviewPage">
            <Header>
                <Header.BackButton onPress={closeFlow} />
                <Header.Title title={translate('walletPage.wiseOnboarding.inReview.headerTitle')} />
            </Header>
            <ConfirmationPage
                illustration={illustrations.Hourglass}
                heading={translate('walletPage.wiseOnboarding.inReview.title')}
                description={translate('walletPage.wiseOnboarding.inReview.subtitle')}
                descriptionStyle={styles.textSupporting}
                shouldShowSecondaryButton
                secondaryButtonText={translate('walletPage.wiseOnboarding.inReview.chatWithConcierge')}
                onSecondaryButtonPress={() => Navigation.navigate(ROUTES.CONCIERGE)}
                shouldShowButton
                buttonText={translate('common.done')}
                onButtonPress={closeFlow}
            />
        </ScreenWrapper>
    );
}

export default WiseInReviewPage;
