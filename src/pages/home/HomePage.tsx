import React from 'react';
import {View} from 'react-native';
import NavigationTabBar from '@components/Navigation/NavigationTabBar';
import NAVIGATION_TABS from '@components/Navigation/NavigationTabBar/NAVIGATION_TABS';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import TopBar from '@components/Navigation/TopBar';
import useLocalize from '@hooks/useLocalize';
import AnnouncementsSection from './AnnouncementsSection';
import DiscoverSection from './DiscoverSection';
import ForYouSection from './ForYouSection';

function HomePage() {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const shouldDisplayLHB = !shouldUseNarrowLayout;
    const styles = useThemeStyles();
    const {translate} = useLocalize();

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
                    <View style={styles.homePageLeftColumn(shouldUseNarrowLayout)}>
                        <ForYouSection />
                        <DiscoverSection />
                    </View>
                    <View style={styles.homePageRightColumn(shouldUseNarrowLayout)}>
                        <AnnouncementsSection />
                    </View>
                </View>
            </ScrollView>
            {shouldDisplayLHB && <NavigationTabBar selectedTab={NAVIGATION_TABS.HOME} />}
        </ScreenWrapper>
    );
}

export default HomePage;
