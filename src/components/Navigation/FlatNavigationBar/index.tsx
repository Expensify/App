import AccountNavigationAvatar from '@components/Avatar/AccountNavigationAvatar';
import EnvironmentBadge from '@components/EnvironmentBadge';
import Hoverable from '@components/Hoverable';
import DebugTabView from '@components/Navigation/DebugTabView';
import getTabAccessibilityLabel from '@components/Navigation/NavigationTabBar/getTabAccessibilityLabel';
import NAVIGATION_TABS from '@components/Navigation/NavigationTabBar/NAVIGATION_TABS';
import useAccountTabNavigation from '@components/Navigation/NavigationTabBar/useAccountTabNavigation';
import useHomeTabNavigation from '@components/Navigation/NavigationTabBar/useHomeTabNavigation';
import useInsightsTabNavigation from '@components/Navigation/NavigationTabBar/useInsightsTabNavigation';
import useSearchTabNavigation from '@components/Navigation/NavigationTabBar/useSearchTabNavigation';
import useWideInboxNavigation from '@components/Navigation/NavigationTabBar/useWideInboxNavigation';
import {
    COLLAPSE_SURFACE,
    getCollapseFadeStyle,
    getFlatNavigationBarAccountAvatarStyle,
    getFlatNavigationBarLayoutWidthStyle,
    getFlatNavigationBarPeekShadowStyle,
    getFlatNavigationBarVisualWidthStyle,
    useSearchSidebarCollapse,
} from '@components/Navigation/SearchSidebarCollapseStore';
import ScrollView from '@components/ScrollView';

import useAccountTabIndicatorStatus from '@hooks/useAccountTabIndicatorStatus';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useInboxTabIndicatorStatus from '@hooks/useInboxTabIndicatorStatus';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useRestoreWorkspacesTabOnNavigate from '@hooks/useRestoreWorkspacesTabOnNavigate';
import useThemeStyles from '@hooks/useThemeStyles';
import useWorkspacesTabIndicatorStatus from '@hooks/useWorkspacesTabIndicatorStatus';

import isHTMLElement from '@libs/isHTMLElement';
import {setIsSearchTabHovered} from '@libs/Navigation/helpers/searchTabPreloadStore';

import useCreateMenuVisibility from '@pages/inbox/sidebar/FABPopoverContent/useCreateMenuVisibility';
import SupportalSwitcherButton from '@pages/inbox/sidebar/SupportalSwitcherButton';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import type {NativeSyntheticEvent, TargetedEvent} from 'react-native';
import type {ValueOf} from 'type-fest';

import React, {useEffect, useRef} from 'react';
import {View} from 'react-native';
import Animated from 'react-native-reanimated';

import FlatNavAccountStatus from './FlatNavAccountStatus';
import FlatNavCollapseToggle from './FlatNavCollapseToggle';
import FlatNavCreateButton from './FlatNavCreateButton';
import FlatNavDivider from './FlatNavDivider';
import FlatNavItem from './FlatNavItem';
import FlatNavLogo from './FlatNavLogo';

type FlatNavigationBarProps = {
    selectedTab: ValueOf<typeof NAVIGATION_TABS>;
};

/** Wide-layout left navigation that lists every top-level destination as a full-width row, with Account at the bottom. */
function FlatNavigationBar({selectedTab}: FlatNavigationBarProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [isDebugModeEnabled] = useOnyx(ONYXKEYS.IS_DEBUG_MODE_ENABLED);
    const icons = useMemoizedLazyExpensifyIcons(['Home', 'Inbox', 'ReceiptMultiple', 'PieChart', 'Buildings']);
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const {isCollapsed, isPeeking, isVisuallyCollapsed, toggleSidebar, startPeek, endPeek} = useSearchSidebarCollapse(COLLAPSE_SURFACE.NAVIGATION_BAR);

    const {status: inboxStatus, indicatorColor: inboxIndicatorColor} = useInboxTabIndicatorStatus();
    const {status: workspacesStatus, indicatorColor: workspacesIndicatorColor} = useWorkspacesTabIndicatorStatus();
    const {status: accountStatus} = useAccountTabIndicatorStatus();

    const isHomeSelected = selectedTab === NAVIGATION_TABS.HOME;
    const isAccountSelected = selectedTab === NAVIGATION_TABS.SETTINGS;

    const navigateToInbox = useWideInboxNavigation(selectedTab === NAVIGATION_TABS.INBOX);
    const navigateToSearch = useSearchTabNavigation(selectedTab === NAVIGATION_TABS.SEARCH);
    const navigateToInsights = useInsightsTabNavigation(selectedTab === NAVIGATION_TABS.INSIGHTS);
    const navigateToWorkspaces = useRestoreWorkspacesTabOnNavigate();

    const navigateToHome = useHomeTabNavigation(isHomeSelected);
    const navigateToAccount = useAccountTabNavigation(isAccountSelected);

    // The Spend row gets no hover out when the bar goes away while hovered, on a switch to the narrow layout or an unmount.
    useEffect(() => () => setIsSearchTabHovered(false), []);

    // A peek has no hover out to end it when the bar goes away while hovered, on a switch to the narrow layout or an unmount.
    useEffect(() => endPeek, [endPeek]);

    const {isCreateMenuActive, isCreateMenuVisible, showCreateMenu, hideCreateMenu} = useCreateMenuVisibility();
    const barContainerRef = useRef<View>(null);

    // Only keyboard focus counts: an item clicked with the mouse keeps focus too, and must not hold the bar open after the pointer leaves.
    const hasKeyboardFocusInside = () => {
        const element = barContainerRef.current;
        return isHTMLElement(element) && !!element.querySelector(':focus-visible');
    };

    // Closing the Create menu hands focus back to its button, and that focus must not reopen a peek the pointer has already left.
    const startPeekOnKeyboardFocus = () => {
        if (!hasKeyboardFocusInside()) {
            return;
        }
        startPeek();
    };

    // The menu's overlay covers the bar until its modal is gone, so the bar never reads as hovered before then.
    // Checking any earlier ends the peek under a pointer that is still on the bar, and the bar then peeks right back.
    const endPeekIfPointerAndFocusLeft = () => {
        const element = barContainerRef.current;
        const isHovered = isHTMLElement(element) && element.matches(':hover');
        if (isCreateMenuVisible || isHovered || hasKeyboardFocusInside()) {
            return;
        }
        endPeek();
    };

    const endPeekIfIdle = () => {
        if (isCreateMenuVisible || hasKeyboardFocusInside()) {
            return;
        }
        endPeek();
    };

    const endPeekUnlessStaying = (event: NativeSyntheticEvent<TargetedEvent>) => {
        if (isCreateMenuVisible) {
            return;
        }
        const currentTarget = event.currentTarget;
        // On web the native event is a DOM FocusEvent, whose relatedTarget is the element receiving focus.
        const relatedTarget = 'relatedTarget' in event.nativeEvent ? event.nativeEvent.relatedTarget : null;
        // Tabbing between items inside the bar keeps the peek open.
        if (isHTMLElement(currentTarget) && isHTMLElement(relatedTarget) && currentTarget.contains(relatedTarget)) {
            return;
        }
        const element = barContainerRef.current;
        if (isHTMLElement(element) && element.matches(':hover')) {
            return;
        }
        endPeek();
    };

    const accountLabel = currentUserPersonalDetails.displayName ? currentUserPersonalDetails.displayName : translate('initialSettingsPage.account');

    return (
        <>
            {!!isDebugModeEnabled && <DebugTabView selectedTab={selectedTab} />}
            {/* The layout box reserves the room the content is offset by. Peeking only widens the bar drawn over it. */}
            <Animated.View style={[styles.h100, getFlatNavigationBarLayoutWidthStyle(isCollapsed)]}>
                <Hoverable
                    shouldUseNativeHoverEvents
                    onHoverOut={endPeekIfIdle}
                >
                    {(isBarHovered) => (
                        <Animated.View
                            ref={barContainerRef}
                            style={[styles.flatNavigationBarContainer, styles.stickToLeft, styles.zIndex1, getFlatNavigationBarVisualWidthStyle(isVisuallyCollapsed)]}
                            testID="FlatNavigationBar"
                        >
                            <Animated.View
                                style={[styles.flatNavigationBarPeekShadow, getFlatNavigationBarPeekShadowStyle(isPeeking)]}
                                pointerEvents="none"
                            />
                            <View style={styles.flatNavigationBarHeader}>
                                <Animated.View
                                    testID="FlatNavLogoContainer"
                                    style={[styles.flatNavigationBarLogoContainer, styles.flexRow, styles.alignItemsCenter, getCollapseFadeStyle(isVisuallyCollapsed)]}
                                    pointerEvents={isVisuallyCollapsed ? 'none' : 'auto'}
                                >
                                    <FlatNavLogo
                                        isCollapsed={isVisuallyCollapsed}
                                        onPress={navigateToHome}
                                    />
                                    <EnvironmentBadge style={styles.flatNavigationBarEnvironmentBadge} />
                                </Animated.View>
                                <FlatNavCollapseToggle
                                    isCollapsed={isCollapsed}
                                    onPress={toggleSidebar}
                                />
                            </View>
                            {/* The header stays out of the peek, so pressing the toggle never races the bar widening under the pointer. */}
                            <Hoverable onHoverIn={startPeek}>
                                <View
                                    testID="FlatNavPeekBody"
                                    style={styles.flex1}
                                    onFocus={startPeekOnKeyboardFocus}
                                    onBlur={endPeekUnlessStaying}
                                >
                                    <View style={styles.flex1}>
                                        <View style={styles.flatNavigationBarCreateButtonContainer}>
                                            <FlatNavCreateButton
                                                isCompact={isVisuallyCollapsed}
                                                isCreateMenuActive={isCreateMenuActive}
                                                isCreateMenuVisible={isCreateMenuVisible}
                                                showCreateMenu={showCreateMenu}
                                                hideCreateMenu={hideCreateMenu}
                                                onCreateMenuHidden={endPeekIfPointerAndFocusLeft}
                                            />
                                        </View>
                                        <ScrollView
                                            style={styles.flex1}
                                            showsVerticalScrollIndicator={false}
                                        >
                                            <FlatNavItem
                                                isCollapsed={isVisuallyCollapsed}
                                                label={translate('common.home')}
                                                icon={icons.Home}
                                                isSelected={isHomeSelected}
                                                sentryLabel={CONST.SENTRY_LABEL.NAVIGATION_TAB_BAR.HOME}
                                                onPress={navigateToHome}
                                            />
                                            <FlatNavItem
                                                isCollapsed={isVisuallyCollapsed}
                                                label={translate('common.inbox')}
                                                icon={icons.Inbox}
                                                isSelected={selectedTab === NAVIGATION_TABS.INBOX}
                                                statusIndicatorColor={inboxStatus ? inboxIndicatorColor : undefined}
                                                accessibilityLabel={getTabAccessibilityLabel(translate('common.inbox'), !!inboxStatus, translate)}
                                                sentryLabel={CONST.SENTRY_LABEL.NAVIGATION_TAB_BAR.INBOX}
                                                onPress={navigateToInbox}
                                            />
                                            <FlatNavDivider />
                                            <FlatNavItem
                                                isCollapsed={isVisuallyCollapsed}
                                                label={translate('common.spend')}
                                                icon={icons.ReceiptMultiple}
                                                isSelected={selectedTab === NAVIGATION_TABS.SEARCH}
                                                sentryLabel={CONST.SENTRY_LABEL.NAVIGATION_TAB_BAR.REPORTS}
                                                onPress={navigateToSearch}
                                                onHoverIn={() => setIsSearchTabHovered(true)}
                                                onHoverOut={() => setIsSearchTabHovered(false)}
                                            />
                                            <FlatNavItem
                                                isCollapsed={isVisuallyCollapsed}
                                                label={translate('common.insights')}
                                                icon={icons.PieChart}
                                                isSelected={selectedTab === NAVIGATION_TABS.INSIGHTS}
                                                sentryLabel={CONST.SENTRY_LABEL.NAVIGATION_TAB_BAR.INSIGHTS}
                                                onPress={navigateToInsights}
                                            />
                                            <FlatNavDivider />
                                            <FlatNavItem
                                                isCollapsed={isVisuallyCollapsed}
                                                label={translate('common.workspacesTabTitle')}
                                                icon={icons.Buildings}
                                                isSelected={selectedTab === NAVIGATION_TABS.WORKSPACES}
                                                statusIndicatorColor={workspacesStatus ? workspacesIndicatorColor : undefined}
                                                accessibilityLabel={getTabAccessibilityLabel(translate('common.workspacesTabTitle'), !!workspacesStatus, translate)}
                                                sentryLabel={CONST.SENTRY_LABEL.NAVIGATION_TAB_BAR.WORKSPACES}
                                                onPress={navigateToWorkspaces}
                                            />
                                        </ScrollView>
                                    </View>
                                    <View style={styles.pb3}>
                                        <View style={[styles.flexRow, styles.ph3]}>
                                            <SupportalSwitcherButton isSidebarHovered={isBarHovered && !isVisuallyCollapsed} />
                                        </View>
                                        <FlatNavDivider />
                                        <FlatNavItem
                                            isCollapsed={isVisuallyCollapsed}
                                            label={accountLabel}
                                            renderLeftElement={({backgroundColor}) => (
                                                <Animated.View style={getFlatNavigationBarAccountAvatarStyle(isVisuallyCollapsed)}>
                                                    <AccountNavigationAvatar
                                                        isSelected={isAccountSelected}
                                                        badgeBorderColor={backgroundColor}
                                                        shouldShowStatus={false}
                                                    />
                                                </Animated.View>
                                            )}
                                            rightElement={<FlatNavAccountStatus isCollapsed={isVisuallyCollapsed} />}
                                            isSelected={isAccountSelected}
                                            isTall
                                            accessibilityLabel={getTabAccessibilityLabel(`${accountLabel}, ${translate('sidebarScreen.buttonMySettings')}`, !!accountStatus, translate)}
                                            sentryLabel={CONST.SENTRY_LABEL.NAVIGATION_TAB_BAR.ACCOUNT}
                                            onPress={navigateToAccount}
                                        />
                                    </View>
                                </View>
                            </Hoverable>
                        </Animated.View>
                    )}
                </Hoverable>
            </Animated.View>
        </>
    );
}

export default FlatNavigationBar;
