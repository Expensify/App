import React, {useEffect} from 'react';
import NavigationTabBar from '@components/Navigation/NavigationTabBar';
import NAVIGATION_TABS from '@components/Navigation/NavigationTabBar/NAVIGATION_TABS';
import ScreenWrapper from '@components/ScreenWrapper';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {isMobile} from '@libs/Browser';
import Performance from '@libs/Performance';
import SidebarInboxContent from '@pages/home/sidebar/SidebarInboxContent';
import CONST from '@src/CONST';

function BaseSidebarScreen() {
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    useEffect(() => {
        Performance.markStart(CONST.TIMING.SIDEBAR_LOADED);
    }, []);

    return (
        <ScreenWrapper
            shouldEnableKeyboardAvoidingView={false}
            style={[styles.sidebar, isMobile() ? styles.userSelectNone : {}]}
            testID={BaseSidebarScreen.displayName}
            bottomContent={shouldUseNarrowLayout && <NavigationTabBar selectedTab={NAVIGATION_TABS.HOME} />}
        >
            {({insets}) => (
                <SidebarInboxContent
                    shouldUseNarrowLayout={shouldUseNarrowLayout}
                    insets={insets}
                />
            )}
        </ScreenWrapper>
    );
}

BaseSidebarScreen.displayName = 'BaseSidebarScreen';

export default BaseSidebarScreen;
