import React from 'react';
import NavigationTabBar from '@components/Navigation/NavigationTabBar';
import NAVIGATION_TABS from '@components/Navigation/NavigationTabBar/NAVIGATION_TABS';
import TopBar from '@components/Navigation/TopBar';
import ScreenWrapper from '@components/ScreenWrapper';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';

function HomePage() {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const shouldDisplayLHB = !shouldUseNarrowLayout;
    const {translate} = useLocalize();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();

    const firstName = currentUserPersonalDetails?.firstName;
    const greeting = firstName ? translate('common.greetingsWithName', firstName) : translate('common.greetings');

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
                breadcrumbLabel={greeting}
                shouldShowLoadingBar={false}
            />
            {shouldDisplayLHB && <NavigationTabBar selectedTab={NAVIGATION_TABS.HOME} />}
        </ScreenWrapper>
    );
}

export default HomePage;
