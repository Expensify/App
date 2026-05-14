import React from 'react';
import {View} from 'react-native';
import Onyx from 'react-native-onyx';
import Animated, {useAnimatedStyle} from 'react-native-reanimated';
import MenuIcon from '@assets/images/menu.svg';
import Icon from '@components/Icon';
import NAVIGATION_TABS from '@components/Navigation/NavigationTabBar/NAVIGATION_TABS';
import {collapseProgress, peekProgress, toggleSidebar} from '@components/Navigation/SidebarCollapseStore';
import TabBarBottomContent from '@components/Navigation/TabBarBottomContent';
import TopBarWithLoadingBar from '@components/Navigation/TopBarWithLoadingBar';
import OptionsListSkeletonView from '@components/OptionsListSkeletonView';
import {PressableWithoutFeedback} from '@components/Pressable';
import ScreenWrapper from '@components/ScreenWrapper';
import useConfirmReadyToOpenApp from '@hooks/useConfirmReadyToOpenApp';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {isMobile} from '@libs/Browser';
import type {SkeletonSpanReasonAttributes} from '@libs/telemetry/useSkeletonSpan';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SidebarLinksData from './SidebarLinksData';

// Once the app finishes loading for the first time, we never show the skeleton again
// (even if isLoadingApp briefly flips back to true during a reconnect).
// This uses a module-level variable + connectWithoutView instead of a ref because
// a ref resets on unmount, so the skeleton would flash again when the component
// remounts (e.g. navigating between tabs).
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
    const theme = useTheme();
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const [isLoadingApp = true] = useOnyx(ONYXKEYS.IS_LOADING_APP);
    const shouldShowSkeleton = isLoadingApp && !hasEverFinishedLoading;
    // Must be called unconditionally so openApp() can proceed even when
    // the skeleton is shown and SidebarLinksData has not mounted yet.
    useConfirmReadyToOpenApp();

    // Fade + slide the "Inbox" breadcrumb in lockstep with the collapse animation.
    const sidebarLabelAnimatedStyle = useAnimatedStyle(() => {
        const cp = collapseProgress.get();
        const pp = peekProgress.get();
        const visualExpansion = 1 - cp * (1 - pp);
        return {
            opacity: visualExpansion,
            transform: [{translateX: -8 * (1 - visualExpansion)}],
        };
    });

    // Slide the toggle button horizontally so it lands at the collapsed-sidebar center.
    // Toggle's natural center inside the 320-wide TopBar: SIDEBAR_WIDTH - mr3(12)
    // - half-pressable(16) = 292. Collapsed-sidebar target center: COLLAPSED_WIDTH / 2
    // = 38. Travel: 292 - 38 = 254. Plus a 1px nudge left for visual centering.
    const sidebarToggleAnimatedStyle = useAnimatedStyle(() => {
        const cp = collapseProgress.get();
        const pp = peekProgress.get();
        const visualExpansion = 1 - cp * (1 - pp);
        return {transform: [{translateX: -1 - 254 * (1 - visualExpansion)}]};
    });

    return (
        <ScreenWrapper
            shouldEnableKeyboardAvoidingView={false}
            style={[styles.sidebar, isMobile() ? styles.userSelectNone : {}]}
            testID="BaseSidebarScreen"
            bottomContent={<TabBarBottomContent selectedTab={NAVIGATION_TABS.INBOX} />}
            bottomContentStyle={styles.overflowVisible}
        >
            {({insets}) => (
                <>
                    <TopBarWithLoadingBar
                        breadcrumbLabel={translate('common.inbox')}
                        breadcrumbAnimatedStyle={shouldUseNarrowLayout ? undefined : sidebarLabelAnimatedStyle}
                        shouldDisplaySearch={shouldUseNarrowLayout}
                        shouldDisplayHelpButton={shouldUseNarrowLayout}
                    >
                        {!shouldUseNarrowLayout && (
                            <Animated.View style={sidebarToggleAnimatedStyle}>
                                <PressableWithoutFeedback
                                    accessibilityLabel="Toggle sidebar"
                                    onPress={toggleSidebar}
                                    sentryLabel={CONST.SENTRY_LABEL.TOP_BAR.CANCEL_BUTTON}
                                    style={[styles.p2, styles.br2]}
                                >
                                    <Icon
                                        src={MenuIcon}
                                        width={variables.iconSizeSmall}
                                        height={variables.iconSizeSmall}
                                        fill={theme.icon}
                                    />
                                </PressableWithoutFeedback>
                            </Animated.View>
                        )}
                    </TopBarWithLoadingBar>
                    <View style={[styles.flex1]}>
                        {shouldShowSkeleton ? (
                            <OptionsListSkeletonView
                                shouldAnimate
                                reasonAttributes={{context: 'BaseSidebarScreen', isLoadingApp, hasEverFinishedLoading} satisfies SkeletonSpanReasonAttributes}
                            />
                        ) : (
                            <SidebarLinksData insets={insets} />
                        )}
                    </View>
                </>
            )}
        </ScreenWrapper>
    );
}

export default BaseSidebarScreen;
