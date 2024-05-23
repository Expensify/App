import React from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Illustrations from '@components/Icon/Illustrations';
import ScreenWrapper from '@components/ScreenWrapper';
import useWindowDimensions from '@hooks/useWindowDimensions';
import Navigation from '@libs/Navigation/Navigation';

function SubscriptionSettingsPage() {
    const {isSmallScreenWidth} = useWindowDimensions();

    return (
        <ScreenWrapper testID={SubscriptionSettingsPage.displayName}>
            <HeaderWithBackButton
                title="Subscription"
                onBackButtonPress={() => Navigation.goBack()}
                shouldShowBackButton={isSmallScreenWidth}
                icon={Illustrations.CreditCardsNew}
            />
        </ScreenWrapper>
    );
}

SubscriptionSettingsPage.displayName = 'SubscriptionSettingsPage';

export default SubscriptionSettingsPage;
