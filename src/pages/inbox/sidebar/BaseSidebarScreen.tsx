import React from 'react';
import {View} from 'react-native';
import Onyx from 'react-native-onyx';
import NavigationTabBar from '@components/Navigation/NavigationTabBar';
import NAVIGATION_TABS from '@components/Navigation/NavigationTabBar/NAVIGATION_TABS';
import TopBar from '@components/Navigation/TopBar';
import OptionsListSkeletonView from '@components/OptionsListSkeletonView';
import ScreenWrapper from '@components/ScreenWrapper';
import useConfirmReadyToOpenApp from '@hooks/useConfirmReadyToOpenApp';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {isMobile} from '@libs/Browser';
import ONYXKEYS from '@src/ONYXKEYS';
import SidebarLinksData from './SidebarLinksData';

// Once the app finishes loading for the first time, we never show the skeleton again
// (even if isLoadingApp briefly flips back to true during a reconnect).
let hasEverFinishedLoading = false;
Onyx.connectWithoutView({
    key: ONYXKEYS.IS_LOADING_APP,
    callback: (value) => {
        if (value !== false) {
            return;
        }
        hasEverFinishedLoading = true;
    },
});

function BaseSidebarScreen() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const shouldDisplayLHB = !shouldUseNarrowLayout;

    const [isLoadingApp = true] = useOnyx(ONYXKEYS.IS_LOADING_APP);
    const shouldShowSkeleton = isLoadingApp && !hasEverFinishedLoading;

    // Must be called unconditionally so openApp() can proceed even when
    // the skeleton is shown and SidebarLinksData has not mounted yet.
    useConfirmReadyToOpenApp();

    return (
        <ScreenWrapper
            shouldEnableKeyboardAvoidingView={false}
            style={[styles.sidebar, isMobile() ? styles.userSelectNone : {}]}
            testID="BaseSidebarScreen"
            bottomContent={!shouldDisplayLHB && <NavigationTabBar selectedTab={NAVIGATION_TABS.INBOX} />}
        >
            {({insets}) => (
                <>
                    <TopBar
                        breadcrumbLabel={translate('common.inbox')}
                        shouldDisplaySearch={shouldUseNarrowLayout}
                        shouldDisplayHelpButton={shouldUseNarrowLayout}
                    />
                    <View style={[styles.flex1]}>{shouldShowSkeleton ? <OptionsListSkeletonView shouldAnimate /> : <SidebarLinksData insets={insets} />}</View>
                    {shouldDisplayLHB && <NavigationTabBar selectedTab={NAVIGATION_TABS.INBOX} />}
                </>
            )}
        </ScreenWrapper>
    );
}

export default BaseSidebarScreen;
