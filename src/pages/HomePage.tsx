import React from 'react';
import NavigationTabBar from '@components/Navigation/NavigationTabBar';
import NAVIGATION_TABS from '@components/Navigation/NavigationTabBar/NAVIGATION_TABS';
import ScreenWrapper from '@components/ScreenWrapper';
import useResponsiveLayout from '@hooks/useResponsiveLayout';

function HomePage() {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const shouldDisplayLHB = !shouldUseNarrowLayout;

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
            {shouldDisplayLHB && <NavigationTabBar selectedTab={NAVIGATION_TABS.HOME} />}
        </ScreenWrapper>
    );
}

export default HomePage;
