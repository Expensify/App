import React, {useEffect} from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Illustrations from '@components/Icon/Illustrations';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import useLocalize from '@hooks/useLocalize';
import useWindowDimensions from '@hooks/useWindowDimensions';
import Navigation from '@libs/Navigation/Navigation';
import * as Subscription from '@userActions/Subscription';
import SubscriptionDetails from './SubscriptionDetails';
import SubscriptionPlan from './SubscriptionPlan';

function SubscriptionSettingsPage() {
    const {isSmallScreenWidth} = useWindowDimensions();
    const {translate} = useLocalize();

    useEffect(() => {
        Subscription.openSubscriptionPage();
    }, []);

    return (
        <ScreenWrapper testID={SubscriptionSettingsPage.displayName}>
            <HeaderWithBackButton
                title={translate('workspace.common.subscription')}
                onBackButtonPress={() => Navigation.goBack()}
                shouldShowBackButton={isSmallScreenWidth}
                icon={Illustrations.CreditCardsNew}
            />
            <ScrollView>
                <SubscriptionPlan />
                <SubscriptionDetails />
            </ScrollView>
        </ScreenWrapper>
    );
}

SubscriptionSettingsPage.displayName = 'SubscriptionSettingsPage';

export default SubscriptionSettingsPage;
