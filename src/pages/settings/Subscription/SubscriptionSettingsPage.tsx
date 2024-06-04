import React, {useEffect} from 'react';
import {View} from 'react-native';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Illustrations from '@components/Icon/Illustrations';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSubscriptionPlan from '@hooks/useSubscriptionPlan';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import Navigation from '@libs/Navigation/Navigation';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import * as Subscription from '@userActions/Subscription';
import CardSection from './CardSection/CardSection';
import ReducedFunctionalityMessage from './ReducedFunctionalityMessage';
import SubscriptionPlan from './SubscriptionPlan';

function SubscriptionSettingsPage() {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {isSmallScreenWidth} = useWindowDimensions();
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const subscriptionPlan = useSubscriptionPlan();

    useEffect(() => {
        Subscription.openSubscriptionPage();
    }, []);

    if (!subscriptionPlan) {
        return <NotFoundPage />;
    }

    return (
        <ScreenWrapper testID={SubscriptionSettingsPage.displayName}>
            <HeaderWithBackButton
                title={translate('workspace.common.subscription')}
                onBackButtonPress={() => Navigation.goBack()}
                shouldShowBackButton={shouldUseNarrowLayout}
                icon={Illustrations.CreditCardsNew}
            />
            <ScrollView style={styles.pt3}>
                <View style={[styles.flex1, isSmallScreenWidth ? styles.workspaceSectionMobile : styles.workspaceSection]}>
                    <ReducedFunctionalityMessage />
                    <CardSection />
                    <SubscriptionPlan />
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
}

SubscriptionSettingsPage.displayName = 'SubscriptionSettingsPage';

export default SubscriptionSettingsPage;
