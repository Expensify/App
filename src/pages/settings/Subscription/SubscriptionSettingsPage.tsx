import React, {useEffect} from 'react';
import {View} from 'react-native';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSubscriptionPlan from '@hooks/useSubscriptionPlan';
import useThemeStyles from '@hooks/useThemeStyles';
import {openSubscriptionPage} from '@libs/actions/Subscription';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsSplitNavigatorParamList} from '@libs/Navigation/types';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import CardSection from './CardSection/CardSection';
import SubscriptionPlan from './SubscriptionPlan';

type SubscriptionSettingsPageProps = PlatformStackScreenProps<SettingsSplitNavigatorParamList, typeof SCREENS.SETTINGS.SUBSCRIPTION.ROOT>;

function SubscriptionSettingsPage({route}: SubscriptionSettingsPageProps) {
    const backTo = route?.params?.backTo;
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const subscriptionPlan = useSubscriptionPlan();
    const illustrations = useMemoizedLazyIllustrations(['CreditCardsNew']);
    useEffect(() => {
        openSubscriptionPage();
    }, []);
    const [isAppLoading = true] = useOnyx(ONYXKEYS.IS_LOADING_APP, {canBeMissing: false});

    useEffect(() => {
        if (subscriptionPlan ?? isAppLoading) {
            return;
        }
        Navigation.removeScreenFromNavigationState(SCREENS.SETTINGS.SUBSCRIPTION.ROOT);
    }, [isAppLoading, subscriptionPlan]);

    if (!subscriptionPlan && isAppLoading) {
        return <FullScreenLoadingIndicator />;
    }

    if (!subscriptionPlan) {
        return null;
    }

    return (
        <ScreenWrapper
            testID="SubscriptionSettingsPage"
            shouldShowOfflineIndicatorInWideScreen
        >
            <HeaderWithBackButton
                title={translate('workspace.common.subscription')}
                onBackButtonPress={() => {
                    if (Navigation.getShouldPopToSidebar()) {
                        Navigation.popToSidebar();
                        return;
                    }
                    Navigation.goBack(backTo);
                }}
                shouldShowBackButton={shouldUseNarrowLayout}
                shouldDisplaySearchRouter
                icon={illustrations.CreditCardsNew}
                shouldUseHeadlineHeader
            />
            <ScrollView style={styles.pt3}>
                <View style={[styles.flex1, shouldUseNarrowLayout ? styles.workspaceSectionMobile : styles.workspaceSection]}>
                    <CardSection />
                    <SubscriptionPlan />
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
}

export default SubscriptionSettingsPage;
