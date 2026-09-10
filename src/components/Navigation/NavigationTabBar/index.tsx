import FloatingCameraButton from '@components/FloatingCameraButton';
import FloatingGPSButton from '@components/FloatingGPSButton';
import Hoverable from '@components/Hoverable';
import ImageSVG from '@components/ImageSVG';
import DebugTabView from '@components/Navigation/DebugTabView';
import {PressableWithFeedback} from '@components/Pressable';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemePreference from '@hooks/useThemePreference';
import useThemeStyles from '@hooks/useThemeStyles';

import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import Navigation from '@libs/Navigation/Navigation';

import NavigationTabBarAvatar from '@pages/inbox/sidebar/NavigationTabBarAvatar';
import NavigationTabBarFloatingActionButton from '@pages/inbox/sidebar/NavigationTabBarFloatingActionButton';
import SupportalSwitcherButton from '@pages/inbox/sidebar/SupportalSwitcherButton';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

import type {ValueOf} from 'type-fest';

import {BlurView} from 'expo-blur';
import React from 'react';
import {Platform, View} from 'react-native';

import InboxTabButton from './InboxTabButton';
import NAVIGATION_TABS from './NAVIGATION_TABS';
import SearchTabButton from './SearchTabButton';
import TabBarItem from './TabBarItem';
import WorkspacesTabButton from './WorkspacesTabButton';

type NavigationTabBarProps = {
    selectedTab: ValueOf<typeof NAVIGATION_TABS>;

    /**
     * Whether to cast the shadow above the bar. Preloaded screens each render their own tab bar at the same spot,
     * so only the navigator's bar — the one stacked above the screens — opts in. Otherwise the shadows compound.
     */
    shouldShowTopShadow?: boolean;
    shouldShowFloatingButtons?: boolean;
};

const NAVIGATION_TAB_BAR_BLUR_INTENSITY = 40;

function NavigationTabBar({selectedTab, shouldShowFloatingButtons = true, shouldShowTopShadow = false}: NavigationTabBarProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [isDebugModeEnabled] = useOnyx(ONYXKEYS.IS_DEBUG_MODE_ENABLED);
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['ExpensifyAppIcon', 'Home']);

    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const themePreference = useThemePreference();

    const StyleUtils = useStyleUtils();

    const navigateToNewDotHome = () => {
        if (selectedTab === NAVIGATION_TABS.HOME) {
            return;
        }
        Navigation.navigate(ROUTES.HOME);
    };

    const navigateToSettings = () => {
        if (selectedTab === NAVIGATION_TABS.SETTINGS) {
            return;
        }
        interceptAnonymousUser(() => {
            Navigation.navigate(ROUTES.SETTINGS);
        });
    };

    // shouldShowFloatingButtons is false for the swipe-back duplicate tab bar rendered via
    // bottomContent — gating the debug view on it prevents it from appearing in that copy too.
    const shouldShowDebugTabView = !!isDebugModeEnabled && shouldShowFloatingButtons;

    if (!shouldUseNarrowLayout) {
        return (
            <>
                {shouldShowDebugTabView && <DebugTabView selectedTab={selectedTab} />}
                <Hoverable shouldUseNativeHoverEvents>
                    {(isSidebarHovered) => (
                        <View
                            style={styles.leftNavigationTabBarContainer}
                            testID="NavigationTabBar"
                        >
                            <View style={styles.flex1}>
                                <PressableWithFeedback
                                    role={CONST.ROLE.LINK}
                                    accessibilityLabel={translate('common.home')}
                                    accessible
                                    testID="ExpensifyLogoButton"
                                    onPress={navigateToNewDotHome}
                                    wrapperStyle={styles.leftNavigationTabBarItem}
                                    sentryLabel={CONST.SENTRY_LABEL.NAVIGATION_TAB_BAR.EXPENSIFY_LOGO}
                                >
                                    <ImageSVG
                                        style={StyleUtils.getAvatarStyle(CONST.AVATAR_SIZE.DEFAULT)}
                                        src={expensifyIcons.ExpensifyAppIcon}
                                        aria-hidden
                                    />
                                </PressableWithFeedback>
                                <PressableWithFeedback
                                    onPress={navigateToNewDotHome}
                                    role={CONST.ROLE.TAB}
                                    accessibilityLabel={translate('common.home')}
                                    style={({hovered}) => [styles.leftNavigationTabBarItem, hovered && styles.navigationTabBarItemHovered]}
                                    sentryLabel={CONST.SENTRY_LABEL.NAVIGATION_TAB_BAR.HOME}
                                >
                                    {({hovered}) => (
                                        <TabBarItem
                                            icon={expensifyIcons.Home}
                                            label={translate('common.home')}
                                            isSelected={selectedTab === NAVIGATION_TABS.HOME}
                                            isHovered={hovered}
                                        />
                                    )}
                                </PressableWithFeedback>
                                <InboxTabButton
                                    selectedTab={selectedTab}
                                    isWideLayout
                                />
                                <SearchTabButton
                                    selectedTab={selectedTab}
                                    isWideLayout
                                />
                                <WorkspacesTabButton
                                    selectedTab={selectedTab}
                                    isWideLayout
                                />
                                <NavigationTabBarAvatar
                                    style={styles.leftNavigationTabBarItem}
                                    isSelected={selectedTab === NAVIGATION_TABS.SETTINGS}
                                    onPress={navigateToSettings}
                                />
                            </View>
                            <View style={styles.leftNavigationTabBarFAB}>
                                <SupportalSwitcherButton isSidebarHovered={isSidebarHovered} />
                                <NavigationTabBarFloatingActionButton />
                            </View>
                        </View>
                    )}
                </Hoverable>
            </>
        );
    }

    return (
        <>
            {shouldShowDebugTabView && <DebugTabView selectedTab={selectedTab} />}
            <View
                style={[styles.navigationTabBarContainer, shouldShowTopShadow && styles.navigationTabBarTopShadow]}
                testID="NavigationTabBar"
            >
                {/* Painted first so it sits behind the tabs. The pill clips it to its rounded ends. */}
                {Platform.OS === 'web' ? (
                    <View style={styles.navigationTabBarBlur} />
                ) : (
                    <>
                        <BlurView
                            intensity={NAVIGATION_TAB_BAR_BLUR_INTENSITY}
                            tint={themePreference === CONST.THEME.DARK || themePreference === CONST.THEME.DARK_CONTRAST ? 'dark' : 'light'}
                            style={styles.navigationTabBarBlur}
                        />
                        <View style={styles.navigationTabBarTint} />
                    </>
                )}
                <PressableWithFeedback
                    onPress={navigateToNewDotHome}
                    role={CONST.ROLE.TAB}
                    accessibilityLabel={translate('common.home')}
                    wrapperStyle={styles.flex1}
                    style={[styles.navigationTabBarItem, selectedTab === NAVIGATION_TABS.HOME && styles.navigationTabBarItemSelected]}
                    sentryLabel={CONST.SENTRY_LABEL.NAVIGATION_TAB_BAR.HOME}
                >
                    <TabBarItem
                        icon={expensifyIcons.Home}
                        label={translate('common.home')}
                        isSelected={selectedTab === NAVIGATION_TABS.HOME}
                        shouldShowLabel={false}
                    />
                </PressableWithFeedback>
                <InboxTabButton
                    selectedTab={selectedTab}
                    isWideLayout={false}
                />
                <SearchTabButton
                    selectedTab={selectedTab}
                    isWideLayout={false}
                />
                <WorkspacesTabButton
                    selectedTab={selectedTab}
                    isWideLayout={false}
                />
                <NavigationTabBarAvatar
                    style={[styles.navigationTabBarItem, selectedTab === NAVIGATION_TABS.SETTINGS && styles.navigationTabBarItemSelected]}
                    isSelected={selectedTab === NAVIGATION_TABS.SETTINGS}
                    onPress={navigateToSettings}
                />
            </View>

            {shouldShowFloatingButtons && (
                <>
                    <View style={[styles.navigationTabBarFABItem, styles.ph0, styles.floatingActionButtonPosition]}>
                        <NavigationTabBarFloatingActionButton />
                    </View>
                    <FloatingGPSButton />
                    <FloatingCameraButton />
                </>
            )}
        </>
    );
}

export default NavigationTabBar;
