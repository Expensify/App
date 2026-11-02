/**
 * Shown after the user submits the Wise business onboarding and Wise does not approve the account right away.
 * The user can leave the flow, and we message them once Wise finishes the review or needs more information.
 */
import ConfirmationPage from '@components/ConfirmationPage';
import FixedFooter from '@components/FixedFooter';
import Header from '@components/Header';
import ScreenWrapper from '@components/ScreenWrapper';

import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import Navigation from '@navigation/Navigation';

import ROUTES from '@src/ROUTES';

import React from 'react';

function WiseOnboardingInReviewPage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const illustrations = useMemoizedLazyIllustrations(['NotebookGremlin']);

    // The onboarding is already submitted, so both the back button and Done close the whole flow instead of returning to the terms page
    const closeFlow = () => Navigation.dismissModal();

    return (
        <ScreenWrapper
            testID="WiseOnboardingInReviewPage"
            includeSafeAreaPaddingBottom
        >
            <Header>
                <Header.BackButton onPress={closeFlow} />
                <Header.Title title={translate('walletPage.wiseOnboarding.inReview.title')} />
            </Header>
            <ConfirmationPage>
                <ConfirmationPage.Content style={styles.ph5}>
                    <ConfirmationPage.Illustration illustration={illustrations.NotebookGremlin} />
                    <ConfirmationPage.Heading>{translate('walletPage.wiseOnboarding.inReview.heading')}</ConfirmationPage.Heading>
                    <ConfirmationPage.Description style={styles.textSupporting}>{translate('walletPage.wiseOnboarding.inReview.description')}</ConfirmationPage.Description>
                </ConfirmationPage.Content>
                <FixedFooter>
                    <ConfirmationPage.SecondaryButton
                        text={translate('walletPage.wiseOnboarding.inReview.chatWithConcierge')}
                        onPress={() => Navigation.navigate(ROUTES.CONCIERGE)}
                    />
                    <ConfirmationPage.PrimaryButton
                        text={translate('common.done')}
                        onPress={closeFlow}
                    />
                </FixedFooter>
            </ConfirmationPage>
        </ScreenWrapper>
    );
}

export default WiseOnboardingInReviewPage;
