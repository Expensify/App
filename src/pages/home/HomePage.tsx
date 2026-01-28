import React, {useEffect} from 'react';
import {View} from 'react-native';
import NavigationTabBar from '@components/Navigation/NavigationTabBar';
import NAVIGATION_TABS from '@components/Navigation/NavigationTabBar/NAVIGATION_TABS';
import TopBar from '@components/Navigation/TopBar';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {confirmReadyToOpenApp} from '@libs/actions/App';
import usePreloadFullScreenNavigators from '@libs/Navigation/AppNavigator/usePreloadFullScreenNavigators';
import ONYXKEYS from '@src/ONYXKEYS';
import {hasSeenTourSelector} from '@src/selectors/Onboarding';
import DiscoverSection from './DiscoverSection';

function HomePage() {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const shouldDisplayLHB = !shouldUseNarrowLayout;
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [isSelfTourViewed = false] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {selector: hasSeenTourSelector, canBeMissing: true});

    // confirmReadyToOpenApp must be called after HomePage mounts     
    // to make sure everything loads properly
    useEffect(() => {
        confirmReadyToOpenApp();
    }, []);

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
                    <View style={styles.homePageLeftColumn(shouldUseNarrowLayout)}>
                        {!isSelfTourViewed && <DiscoverSection />}
                    </View>
                    <View style={styles.homePageRightColumn(shouldUseNarrowLayout)} />
                </View>
            </ScrollView>
            {shouldDisplayLHB && <NavigationTabBar selectedTab={NAVIGATION_TABS.HOME} />}
        </ScreenWrapper>
    );
}

export default HomePage;
