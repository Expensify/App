import React, {useEffect} from 'react';
import {View} from 'react-native';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSubscriptionPlan from '@hooks/useSubscriptionPlan';
import useThemeStyles from '@hooks/useThemeStyles';
import {openSubscriptionPage} from '@libs/actions/Subscription';
import Navigation from '@libs/Navigation/Navigation';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import CardSection from './CardSection/CardSection';
import SubscriptionPlan from './SubscriptionPlan';

function DynamicSubscriptionSettingsPage() {
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.SUBSCRIPTION.path);
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const subscriptionPlan = useSubscriptionPlan();
    const illustrations = useMemoizedLazyIllustrations(['CreditCardsNew']);
    useEffect(() => {
        openSubscriptionPage();
    }, []);
    const [isAppLoading = true] = useOnyx(ONYXKEYS.IS_LOADING_APP);

    useEffect(() => {
        if (subscriptionPlan ?? isAppLoading) {
            return;
        }
        Navigation.removeScreenFromNavigationState(SCREENS.SETTINGS.DYNAMIC_SUBSCRIPTION);
    }, [isAppLoading, subscriptionPlan]);

    if (!subscriptionPlan && isAppLoading) {
        return <FullScreenLoadingIndicator />;
    }

    if (!subscriptionPlan) {
        return null;
    }

    return (
        <ScreenWrapper
            testID="DynamicSubscriptionSettingsPage"
            shouldShowOfflineIndicatorInWideScreen
        >
            <HeaderWithBackButton
                title={translate('workspace.common.subscription')}
                onBackButtonPress={() => Navigation.goBack(backPath)}
                shouldShowBackButton={shouldUseNarrowLayout}
                shouldDisplaySearchRouter
                shouldDisplayHelpButton
                icon={illustrations.CreditCardsNew}
                shouldUseHeadlineHeader
            />
            <ScrollView contentContainerStyle={[styles.flexGrow1, styles.flexShrink1]}>
                <View style={[shouldUseNarrowLayout ? styles.workspaceSectionMobile : styles.workspaceSection]}>
                    <SubscriptionPlan />
                    <CardSection />
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
}

DynamicSubscriptionSettingsPage.displayName = 'DynamicSubscriptionSettingsPage';

export default DynamicSubscriptionSettingsPage;
