/**
 * Shown after the user submits the Wise business onboarding only when Wise approves the account right away.
 * An approval that arrives after the user left the flow does not bring them back here.
 */
import ConfirmationPage from '@components/ConfirmationPage';
import FixedFooter from '@components/FixedFooter';
import Header from '@components/Header';
import ScreenWrapper from '@components/ScreenWrapper';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import Navigation from '@navigation/Navigation';

import React from 'react';

function WiseOnboardingApprovedPage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    // The onboarding is already submitted, so both the back button and Done close the whole flow instead of returning to the terms page
    const closeFlow = () => Navigation.dismissModal();

    return (
        <ScreenWrapper
            testID="WiseOnboardingApprovedPage"
            includeSafeAreaPaddingBottom
        >
            <Header>
                <Header.BackButton onPress={closeFlow} />
                <Header.Title title={translate('walletPage.wiseOnboarding.approved.title')} />
            </Header>
            <ConfirmationPage>
                <ConfirmationPage.Content style={styles.ph5}>
                    {/* The default illustration is the fireworks animation from the design */}
                    <ConfirmationPage.Illustration />
                    <ConfirmationPage.Heading>{translate('walletPage.wiseOnboarding.approved.heading')}</ConfirmationPage.Heading>
                    <ConfirmationPage.Description style={styles.textSupporting}>{translate('walletPage.wiseOnboarding.approved.description')}</ConfirmationPage.Description>
                </ConfirmationPage.Content>
                <FixedFooter>
                    <ConfirmationPage.PrimaryButton
                        text={translate('common.done')}
                        onPress={closeFlow}
                    />
                </FixedFooter>
            </ConfirmationPage>
        </ScreenWrapper>
    );
}

export default WiseOnboardingApprovedPage;
