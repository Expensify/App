import FloatingCameraButton from '@components/FloatingCameraButton';
import FloatingGPSButton from '@components/FloatingGPSButton';
import Hoverable from '@components/Hoverable';
import ImageSVG from '@components/ImageSVG';
import DebugTabView from '@components/Navigation/DebugTabView';
import {PressableWithFeedback} from '@components/Pressable';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import Navigation from '@libs/Navigation/Navigation';

import NavigationTabBarAvatar from '@pages/inbox/sidebar/NavigationTabBarAvatar';
import NavigationTabBarFloatingActionButton from '@pages/inbox/sidebar/NavigationTabBarFloatingActionButton';
import SupportalSwitcherButton from '@pages/inbox/sidebar/SupportalSwitcherButton';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

import type {StyleProp, ViewStyle} from 'react-native';
import type {ValueOf} from 'type-fest';

import React from 'react';
import {View} from 'react-native';

import InboxTabButton from './InboxTabButton';
import InsightsTabButton from './InsightsTabButton';
import NAVIGATION_TABS from './NAVIGATION_TABS';
import SearchTabButton from './SearchTabButton';
import TabBarItem from './TabBarItem';
import WorkspacesTabButton from './WorkspacesTabButton';

type NavigationTabBarProps = {
    selectedTab: ValueOf<typeof NAVIGATION_TABS>;
    shouldShowFloatingButtons?: boolean;

    /** Renders the narrow bar as a compact pill floating in the bottom-left corner (mWeb landscape) */
    isFloating?: boolean;

    /** Position of the FAB when floating. Required so it lands in the opposite corner from the pill. */
    floatingActionButtonStyle?: StyleProp<ViewStyle>;

    /** Position of the camera button when floating, stacked above the FAB */
    floatingCameraButtonStyle?: StyleProp<ViewStyle>;
};

function NavigationTabBar({selectedTab, shouldShowFloatingButtons = true, isFloating = false, floatingActionButtonStyle, floatingCameraButtonStyle}: NavigationTabBarProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [isDebugModeEnabled] = useOnyx(ONYXKEYS.IS_DEBUG_MODE_ENABLED);
    const {isBetaEnabled} = usePermissions();
    const isInsightsTabVisible = isBetaEnabled(CONST.BETAS.INSIGHTS_PAGE);
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['ExpensifyAppIcon', 'Home']);

    const {shouldUseNarrowLayout} = useResponsiveLayout();

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
                                {isInsightsTabVisible && (
                                    <InsightsTabButton
                                        selectedTab={selectedTab}
                                        isWideLayout
                                    />
                                )}
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
            {shouldShowDebugTabView && (
                <DebugTabView
                    selectedTab={selectedTab}
                    isFloating={isFloating}
                />
            )}
            <View
                style={isFloating ? styles.navigationTabBarFloatingContainer : styles.navigationTabBarContainer}
                testID="NavigationTabBar"
            >
                <PressableWithFeedback
                    onPress={navigateToNewDotHome}
                    role={CONST.ROLE.TAB}
                    accessibilityLabel={translate('common.home')}
                    wrapperStyle={isFloating ? undefined : styles.flex1}
                    style={isFloating ? styles.navigationTabBarFloatingItem : styles.navigationTabBarItem}
                    sentryLabel={CONST.SENTRY_LABEL.NAVIGATION_TAB_BAR.HOME}
                >
                    <TabBarItem
                        icon={expensifyIcons.Home}
                        label={translate('common.home')}
                        isSelected={selectedTab === NAVIGATION_TABS.HOME}
                        isFloating={isFloating}
                    />
                </PressableWithFeedback>
                <InboxTabButton
                    selectedTab={selectedTab}
                    isWideLayout={false}
                    isFloating={isFloating}
                />
                <SearchTabButton
                    selectedTab={selectedTab}
                    isWideLayout={false}
                    isFloating={isFloating}
                />
                {isInsightsTabVisible && (
                    <InsightsTabButton
                        selectedTab={selectedTab}
                        isWideLayout={false}
                    />
                )}
                <WorkspacesTabButton
                    selectedTab={selectedTab}
                    isWideLayout={false}
                    isFloating={isFloating}
                />
                {!isInsightsTabVisible && (
                    <NavigationTabBarAvatar
                        style={isFloating ? styles.navigationTabBarFloatingItem : styles.navigationTabBarItem}
                        isSelected={selectedTab === NAVIGATION_TABS.SETTINGS}
                        onPress={navigateToSettings}
                        isFloating={isFloating}
                    />
                )}
            </View>

            {shouldShowFloatingButtons && (
                <>
                    <View style={[styles.navigationTabBarFABItem, styles.ph0, isFloating ? floatingActionButtonStyle : styles.floatingActionButtonPosition]}>
                        <NavigationTabBarFloatingActionButton />
                    </View>
                    <FloatingGPSButton />
                    <FloatingCameraButton positionStyle={isFloating ? floatingCameraButtonStyle : undefined} />
                </>
            )}
        </>
    );
}

export default NavigationTabBar;
