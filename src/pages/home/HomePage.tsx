import React from 'react';
import {View} from 'react-native';
import NavigationTabBar from '@components/Navigation/NavigationTabBar';
import NAVIGATION_TABS from '@components/Navigation/NavigationTabBar/NAVIGATION_TABS';
import TopBar from '@components/Navigation/TopBar';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import useConfirmReadyToOpenApp from '@hooks/useConfirmReadyToOpenApp';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import usePreloadFullScreenNavigators from '@libs/Navigation/AppNavigator/usePreloadFullScreenNavigators';
import AnnouncementSection from './AnnouncementSection';
import DiscoverSection from './DiscoverSection';
import ForYouSection from './ForYouSection';
import TimeSensitiveSection from './TimeSensitiveSection';

function HomePage() {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const shouldDisplayLHB = !shouldUseNarrowLayout;
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    // This hook signals that the app is ready to be opened after HomePage mounts
    // to make sure everything loads properly
    useConfirmReadyToOpenApp();

    // This hook preloads the screens of adjacent tabs to make changing tabs faster.
    usePreloadFullScreenNavigators();

    return (
        <ScreenWrapper
            shouldEnablePickerAvoiding={false}
            shouldShowOfflineIndicatorInWideScreen
            testID="HomePage"
            enableEdgeToEdgeBottomSafeAreaPadding={false}
            bottomContent={
                shouldUseNarrowLayout && (
                    <NavigationTabBar
                        selectedTab={NAVIGATION_TABS.HOME}
                        shouldShowFloatingButtons
                    />
                )
            }
        >
            <TopBar
                breadcrumbLabel={translate('common.home')}
                shouldShowLoadingBar={false}
            />
            <ScrollView
                contentContainerStyle={styles.homePageContentContainer}
                addBottomSafeAreaPadding
            >
                <View style={styles.homePageMainLayout(shouldUseNarrowLayout)}>
                    {/* Widgets handle their own visibility and may return null to avoid duplicating visibility logic here */}
                    <View style={styles.homePageLeftColumn(shouldUseNarrowLayout)}>
                        <TimeSensitiveSection />
                        <ForYouSection />
                        <DiscoverSection />
                    </View>
                    <View style={styles.homePageRightColumn(shouldUseNarrowLayout)}>
                        <AnnouncementSection />
                    </View>
                </View>
            </ScrollView>
            {shouldDisplayLHB && <NavigationTabBar selectedTab={NAVIGATION_TABS.HOME} />}
        </ScreenWrapper>
    );
}

export default HomePage;
