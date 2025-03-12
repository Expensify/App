import React, {useEffect} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Illustrations from '@components/Icon/Illustrations';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSubscriptionPlan from '@hooks/useSubscriptionPlan';
import useThemeStyles from '@hooks/useThemeStyles';
import {openSubscriptionPage} from '@libs/actions/Subscription';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import CardSection from './CardSection/CardSection';
import ReducedFunctionalityMessage from './ReducedFunctionalityMessage';
import SubscriptionDetails from './SubscriptionDetails';
import SubscriptionPlan from './SubscriptionPlan';
import SubscriptionSettings from './SubscriptionSettings';

type SubscriptionSettingsPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.SUBSCRIPTION.ROOT>;

function SubscriptionSettingsPage({route}: SubscriptionSettingsPageProps) {
    const backTo = route?.params?.backTo;
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const subscriptionPlan = useSubscriptionPlan();

    useEffect(() => {
        openSubscriptionPage();
    }, []);
    const [isAppLoading] = useOnyx(ONYXKEYS.IS_LOADING_APP);

    if (!subscriptionPlan && isAppLoading) {
        return <FullScreenLoadingIndicator />;
    }
    if (!subscriptionPlan) {
        return <NotFoundPage />;
    }

    return (
        <ScreenWrapper
            testID={SubscriptionSettingsPage.displayName}
            shouldShowOfflineIndicatorInWideScreen
        >
            <HeaderWithBackButton
                title={translate('workspace.common.subscription')}
                onBackButtonPress={() => Navigation.goBack(backTo)}
                shouldShowBackButton={shouldUseNarrowLayout}
                shouldDisplaySearchRouter
                icon={Illustrations.CreditCardsNew}
                shouldUseHeadlineHeader
            />
            <ScrollView style={styles.pt3}>
                <View style={[styles.flex1, shouldUseNarrowLayout ? styles.workspaceSectionMobile : styles.workspaceSection]}>
                    <ReducedFunctionalityMessage />
                    <CardSection />
                    <SubscriptionPlan />
                    <SubscriptionDetails />
                    <SubscriptionSettings />
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
}

SubscriptionSettingsPage.displayName = 'SubscriptionSettingsPage';

export default SubscriptionSettingsPage;
