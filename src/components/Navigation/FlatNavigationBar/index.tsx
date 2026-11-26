import AccountNavigationAvatar from '@components/Avatar/AccountNavigationAvatar';
import EnvironmentBadge from '@components/EnvironmentBadge';
import Hoverable from '@components/Hoverable';
import DebugTabView from '@components/Navigation/DebugTabView';
import {DEFAULT_INSIGHTS_TAB_ROUTE} from '@components/Navigation/NavigationTabBar/getInsightsTabRoute';
import getTabAccessibilityLabel from '@components/Navigation/NavigationTabBar/getTabAccessibilityLabel';
import NAVIGATION_TABS from '@components/Navigation/NavigationTabBar/NAVIGATION_TABS';
import useAccountTabNavigation from '@components/Navigation/NavigationTabBar/useAccountTabNavigation';
import useHomeTabNavigation from '@components/Navigation/NavigationTabBar/useHomeTabNavigation';
import useInsightsTabNavigation from '@components/Navigation/NavigationTabBar/useInsightsTabNavigation';
import useSearchTabNavigation from '@components/Navigation/NavigationTabBar/useSearchTabNavigation';
import useSignedInLinkRoute from '@components/Navigation/NavigationTabBar/useSignedInLinkRoute';
import useStoredSearchTabRoute from '@components/Navigation/NavigationTabBar/useStoredSearchTabRoute';
import useWideInboxNavigation from '@components/Navigation/NavigationTabBar/useWideInboxNavigation';
import PeekSurfaceContext from '@components/Navigation/PeekSurfaceContext';
import {
    COLLAPSE_SURFACE,
    getCollapseFadeStyle,
    getFlatNavigationBarAccountAvatarStyle,
    getFlatNavigationBarLayoutWidthStyle,
    getFlatNavigationBarPeekShadowStyle,
    getFlatNavigationBarVisualWidthStyle,
    useSearchSidebarCollapse,
} from '@components/Navigation/SearchSidebarCollapseStore';
import useSupportalSwitcherVisibility from '@components/Navigation/SupportalSwitcher/useSupportalSwitcherVisibility';
import ScrollView from '@components/ScrollView';
import {useSearchQueryContext} from '@components/Search/SearchContext';

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

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

import type {ComponentRef} from 'react';
import type {NativeSyntheticEvent, TargetedEvent} from 'react-native';
import type {ValueOf} from 'type-fest';

import {useEffect, useRef, useState} from 'react';
import {View} from 'react-native';
import Animated from 'react-native-reanimated';

import FlatNavAccountStatus from './FlatNavAccountStatus';
import FlatNavCollapseToggle from './FlatNavCollapseToggle';
import FlatNavCreateButton from './FlatNavCreateButton';
import FlatNavDivider from './FlatNavDivider';
import FlatNavItem from './FlatNavItem';
import FlatNavLogo from './FlatNavLogo';
import FlatNavSpendSubnav from './FlatNavSpendSubnav';
import FlatNavSupportalItem from './FlatNavSupportalItem';
import hasKeyboardFocusIn from './hasKeyboardFocusIn';
import isFocusMovingWithin from './isFocusMovingWithin';

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
    const {currentSearchKey} = useSearchQueryContext();

    const {status: inboxStatus, indicatorColor: inboxIndicatorColor} = useInboxTabIndicatorStatus();
    const {status: workspacesStatus, indicatorColor: workspacesIndicatorColor} = useWorkspacesTabIndicatorStatus();
    const {status: accountStatus} = useAccountTabIndicatorStatus();

    const isHomeSelected = selectedTab === NAVIGATION_TABS.HOME;
    const isAccountSelected = selectedTab === NAVIGATION_TABS.SETTINGS;

    const navigateToInbox = useWideInboxNavigation(selectedTab === NAVIGATION_TABS.INBOX);
    const navigateToSearch = useSearchTabNavigation(selectedTab === NAVIGATION_TABS.SEARCH);
    const getSignedInLinkRoute = useSignedInLinkRoute();
    const storedSearchTabRoute = useStoredSearchTabRoute();
    const navigateToInsights = useInsightsTabNavigation(selectedTab === NAVIGATION_TABS.INSIGHTS);
    const navigateToWorkspaces = useRestoreWorkspacesTabOnNavigate();

    const navigateToHome = useHomeTabNavigation(isHomeSelected);
    const navigateToAccount = useAccountTabNavigation(isAccountSelected);

    // The Spend row gets no hover out when the bar goes away while hovered, on a switch to the narrow layout or an unmount.
    useEffect(() => () => setIsSearchTabHovered(false), []);

    // A peek has no hover out to end it when the bar goes away while hovered, on a switch to the narrow layout or an unmount.
    useEffect(() => endPeek, [endPeek]);

    const {isCreateMenuActive, isCreateMenuVisible, showCreateMenu, hideCreateMenu} = useCreateMenuVisibility();
    const {isSupportAgent, isSwitcherVisible: isSupportalSwitcherVisible, showSwitcher: showSupportalSwitcher, hideSwitcher: hideSupportalSwitcher} = useSupportalSwitcherVisibility();
    // A popover the bar opened holds the peek: its overlay ends the hover without the pointer ever leaving the bar.
    const isBarPopoverVisible = isCreateMenuVisible || isSupportalSwitcherVisible;
    const barContainerRef = useRef<ComponentRef<typeof View>>(null);
    // A saved search's menu in the Spend subnav renders its backdrop outside the bar, which reads as the pointer leaving. The menu reports
    // its visibility through PeekSurfaceContext so the bar keeps its peek until the menu is gone. Its modal layer allows only one menu at a time, so one flag is enough.
    const isSubnavMenuOpenRef = useRef(false);
    const getIsAnyPopoverVisible = () => isBarPopoverVisible || isSubnavMenuOpenRef.current;

    const hasKeyboardFocusInside = () => hasKeyboardFocusIn(barContainerRef.current);

    // Closing the Create menu hands focus back to its button, and that focus must not reopen a peek the pointer has already left.
    const startPeekOnKeyboardFocus = () => {
        if (!hasKeyboardFocusInside()) {
            return;
        }
        startPeek();
    };

    // A popover's overlay covers the bar until its modal is gone, so the bar never reads as hovered before then.
    // Checking any earlier ends the peek under a pointer that is still on the bar, and the bar then peeks right back.
    const endPeekIfPointerAndFocusLeft = () => {
        const element = barContainerRef.current;
        const isHovered = isHTMLElement(element) && element.matches(':hover');
        if (getIsAnyPopoverVisible() || isHovered || hasKeyboardFocusInside()) {
            return;
        }
        endPeek();
    };

    const endPeekIfIdle = () => {
        if (getIsAnyPopoverVisible() || hasKeyboardFocusInside()) {
            return;
        }
        endPeek();
    };

    const endPeekUnlessStaying = (event: NativeSyntheticEvent<TargetedEvent>) => {
        if (getIsAnyPopoverVisible()) {
            return;
        }
        // Tabbing between items inside the bar keeps the peek open.
        if (isFocusMovingWithin(event)) {
            return;
        }
        const element = barContainerRef.current;
        if (isHTMLElement(element) && element.matches(':hover')) {
            return;
        }
        endPeek();
    };

    // Supportal sits right above Account and shows only while the pointer or keyboard focus is on that pair, so it never clutters the bar.
    const [hasKeyboardFocusOnAccountArea, setHasKeyboardFocusOnAccountArea] = useState(false);
    const accountAreaRef = useRef<ComponentRef<typeof View>>(null);

    const updateAccountAreaFocus = () => setHasKeyboardFocusOnAccountArea(hasKeyboardFocusIn(accountAreaRef.current));

    const clearAccountAreaFocus = (event: NativeSyntheticEvent<TargetedEvent>) => {
        // Tabbing between Account and Supportal keeps Supportal showing.
        if (isFocusMovingWithin(event)) {
            return;
        }
        setHasKeyboardFocusOnAccountArea(false);
    };

    const holdPeekUntilMenuCloses = () => {
        isSubnavMenuOpenRef.current = true;
    };

    const endPeekIfPointerLeft = () => {
        isSubnavMenuOpenRef.current = false;
        endPeekIfPointerAndFocusLeft();
    };

    const accountLabel = currentUserPersonalDetails.displayName ? currentUserPersonalDetails.displayName : translate('initialSettingsPage.account');

    return (
        <PeekSurfaceContext.Provider value={{holdPeekUntilMenuCloses, endPeekIfPointerLeft}}>
            {!!isDebugModeEnabled && <DebugTabView selectedTab={selectedTab} />}
            {/* The layout box reserves the room the content is offset by. Peeking only widens the bar drawn over it. */}
            <Animated.View style={[styles.h100, getFlatNavigationBarLayoutWidthStyle(isCollapsed)]}>
                <Hoverable
                    shouldUseNativeHoverEvents
                    onHoverOut={endPeekIfIdle}
                >
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
                                            linkRoute={ROUTES.HOME}
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
                                            linkRoute={ROUTES.INBOX}
                                        />
                                        <FlatNavDivider />
                                        <FlatNavItem
                                            isCollapsed={isVisuallyCollapsed}
                                            label={translate('common.spend')}
                                            icon={icons.ReceiptMultiple}
                                            // While a search of the open subnav is selected, the subnav marks it, so the Spend row does not.
                                            isSelected={selectedTab === NAVIGATION_TABS.SEARCH && (isVisuallyCollapsed || !currentSearchKey)}
                                            sentryLabel={CONST.SENTRY_LABEL.NAVIGATION_TAB_BAR.REPORTS}
                                            onPress={navigateToSearch}
                                            linkRoute={getSignedInLinkRoute(storedSearchTabRoute)}
                                            onHoverIn={() => setIsSearchTabHovered(true)}
                                            onHoverOut={() => setIsSearchTabHovered(false)}
                                        />
                                        {selectedTab === NAVIGATION_TABS.SEARCH && <FlatNavSpendSubnav isVisuallyCollapsed={isVisuallyCollapsed} />}
                                        <FlatNavItem
                                            isCollapsed={isVisuallyCollapsed}
                                            label={translate('common.insights')}
                                            icon={icons.PieChart}
                                            isSelected={selectedTab === NAVIGATION_TABS.INSIGHTS}
                                            sentryLabel={CONST.SENTRY_LABEL.NAVIGATION_TAB_BAR.INSIGHTS}
                                            onPress={navigateToInsights}
                                            linkRoute={getSignedInLinkRoute(DEFAULT_INSIGHTS_TAB_ROUTE)}
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
                                            linkRoute={getSignedInLinkRoute(ROUTES.WORKSPACES_LIST.route)}
                                        />
                                    </ScrollView>
                                </View>
                                <View style={styles.pb3}>
                                    <FlatNavDivider />
                                    {/* Hover covers Supportal too, so the pointer can move up from Account onto it without it disappearing.
                                        The switcher's portal is a React child of this area, so synthetic hover events would count its overlay as part of the area and never end the hover once it closes. */}
                                    <Hoverable shouldUseNativeHoverEvents>
                                        {(isAccountAreaHovered) => (
                                            <View
                                                ref={accountAreaRef}
                                                testID="FlatNavAccountArea"
                                                onFocus={updateAccountAreaFocus}
                                                onBlur={clearAccountAreaFocus}
                                            >
                                                <FlatNavSupportalItem
                                                    isCollapsed={isVisuallyCollapsed}
                                                    isSupportAgent={isSupportAgent}
                                                    isRowVisible={isAccountAreaHovered || hasKeyboardFocusOnAccountArea}
                                                    isSwitcherVisible={isSupportalSwitcherVisible}
                                                    showSwitcher={showSupportalSwitcher}
                                                    hideSwitcher={hideSupportalSwitcher}
                                                    onSwitcherHidden={endPeekIfPointerAndFocusLeft}
                                                />
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
                                                    accessibilityLabel={getTabAccessibilityLabel(
                                                        `${accountLabel}, ${translate('sidebarScreen.buttonMySettings')}`,
                                                        !!accountStatus,
                                                        translate,
                                                    )}
                                                    sentryLabel={CONST.SENTRY_LABEL.NAVIGATION_TAB_BAR.ACCOUNT}
                                                    onPress={navigateToAccount}
                                                    linkRoute={getSignedInLinkRoute(ROUTES.SETTINGS)}
                                                />
                                            </View>
                                        )}
                                    </Hoverable>
                                </View>
                            </View>
                        </Hoverable>
                    </Animated.View>
                </Hoverable>
            </Animated.View>
        </PeekSurfaceContext.Provider>
    );
}

export default FlatNavigationBar;
