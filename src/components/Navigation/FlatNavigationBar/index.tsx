import SidebarLeftIcon from '@assets/images/sidebar-left.svg';
import SidebarRightIcon from '@assets/images/sidebar-right.svg';

import AccountNavigationAvatar from '@components/Avatar/AccountNavigationAvatar';
import Hoverable from '@components/Hoverable';
import Icon from '@components/Icon';
import DebugTabView from '@components/Navigation/DebugTabView';
import getTabAccessibilityLabel from '@components/Navigation/NavigationTabBar/getTabAccessibilityLabel';
import NAVIGATION_TABS from '@components/Navigation/NavigationTabBar/NAVIGATION_TABS';
import useAccountTabNavigation from '@components/Navigation/NavigationTabBar/useAccountTabNavigation';
import useHomeTabNavigation from '@components/Navigation/NavigationTabBar/useHomeTabNavigation';
import useInsightsTabNavigation from '@components/Navigation/NavigationTabBar/useInsightsTabNavigation';
import useSearchTabNavigation from '@components/Navigation/NavigationTabBar/useSearchTabNavigation';
import useWideInboxNavigation from '@components/Navigation/NavigationTabBar/useWideInboxNavigation';
import {
    useFlatNavigationBarLayoutWidthStyle,
    useFlatNavigationBarPeekShadowStyle,
    useFlatNavigationBarVisualWidthStyle,
    useSearchSidebarCollapse,
    useSearchSidebarCollapseFadeStyle,
} from '@components/Navigation/SearchSidebarCollapseStore';
import {PressableWithFeedback} from '@components/Pressable';
import ScrollView from '@components/ScrollView';

import useAccountTabIndicatorStatus from '@hooks/useAccountTabIndicatorStatus';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useInboxTabIndicatorStatus from '@hooks/useInboxTabIndicatorStatus';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useRestoreWorkspacesTabOnNavigate from '@hooks/useRestoreWorkspacesTabOnNavigate';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWorkspacesTabIndicatorStatus from '@hooks/useWorkspacesTabIndicatorStatus';

import clearSelectedText from '@libs/clearSelectedText/clearSelectedText';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import {setIsSearchTabHovered} from '@libs/Navigation/helpers/searchTabPreloadStore';
import Navigation from '@libs/Navigation/Navigation';

import {requestNewConciergeQuestion} from '@pages/AskConcierge/NewQuestionStore';
import SupportalSwitcherButton from '@pages/inbox/sidebar/SupportalSwitcherButton';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Report} from '@src/types/onyx';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';

import React, {useEffect} from 'react';
import {View} from 'react-native';
import Animated from 'react-native-reanimated';

import FlatNavAccountStatus from './FlatNavAccountStatus';
import FlatNavCreateButton from './FlatNavCreateButton';
import FlatNavDivider from './FlatNavDivider';
import FlatNavItem from './FlatNavItem';
import FlatNavLogo from './FlatNavLogo';

/** Destinations the design calls for that have no page yet, shown only while the debug toggle is on. */
const PLACEHOLDER_DESTINATIONS = [
    {label: 'Bills', iconName: 'Coins'},
    {label: 'Invoices', iconName: 'InvoiceGeneric'},
    {label: 'Travel', iconName: 'LuggageWithLines'},
] as const;

/** Whether Concierge has said something in this chat that the user has not read. Their own messages never count. */
function hasUnreadFromConcierge(report: OnyxEntry<Report>, currentUserAccountID: number | undefined) {
    return (report?.lastReadTime ?? '') < (report?.lastVisibleActionCreated ?? '') && report?.lastActorAccountID !== currentUserAccountID;
}

/**
 * Whether the Concierge chat or any of its threads holds an unread reply, since an answer usually lands in a thread
 * rather than in the chat itself.
 */
const makeHasUnreadConciergeMessageSelector = (currentUserAccountID: number | undefined, conciergeReportID: string | undefined) => (reports: OnyxCollection<Report>) => {
    if (!conciergeReportID) {
        return false;
    }
    return Object.values(reports ?? {}).some(
        (report) => (report?.reportID === conciergeReportID || report?.parentReportID === conciergeReportID) && hasUnreadFromConcierge(report, currentUserAccountID),
    );
};

type FlatNavigationBarProps = {
    selectedTab: ValueOf<typeof NAVIGATION_TABS>;
};

/** Wide-layout left navigation that lists every top-level destination as a full-width row, with Account at the bottom. */
function FlatNavigationBar({selectedTab}: FlatNavigationBarProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const [isDebugModeEnabled] = useOnyx(ONYXKEYS.IS_DEBUG_MODE_ENABLED);
    const icons = useMemoizedLazyExpensifyIcons(['Home', 'Inbox', 'ReceiptMultiple', 'PieChart', 'Buildings', 'Concierge', 'Coins', 'InvoiceGeneric', 'LuggageWithLines']);
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const [shouldShowExtraNavItems = false] = useOnyx(ONYXKEYS.SHOULD_SHOW_EXTRA_NAV_ITEMS);
    const [shouldShowAskConciergeNavItem = true] = useOnyx(ONYXKEYS.SHOULD_SHOW_ASK_CONCIERGE_NAV_ITEM);
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();

    const {status: inboxStatus, indicatorColor: inboxIndicatorColor} = useInboxTabIndicatorStatus();
    const {status: workspacesStatus, indicatorColor: workspacesIndicatorColor} = useWorkspacesTabIndicatorStatus();
    const {status: accountStatus} = useAccountTabIndicatorStatus();

    const {isCollapsed, isVisuallyCollapsed, toggleSidebar, startPeek, endPeek} = useSearchSidebarCollapse();
    const layoutWidthStyle = useFlatNavigationBarLayoutWidthStyle();
    const visualWidthStyle = useFlatNavigationBarVisualWidthStyle();
    const logoFadeStyle = useSearchSidebarCollapseFadeStyle();
    const peekShadowStyle = useFlatNavigationBarPeekShadowStyle();

    const hasUnreadConciergeMessageSelector = makeHasUnreadConciergeMessageSelector(currentUserPersonalDetails.accountID, conciergeReportID);
    const [hasUnreadConciergeMessage = false] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {selector: hasUnreadConciergeMessageSelector});

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

    const navigateToAskConcierge = () => {
        // Pressing the row while the page is open starts a new question, since there is nowhere to navigate.
        if (selectedTab === NAVIGATION_TABS.ASK_CONCIERGE) {
            requestNewConciergeQuestion();
            return;
        }
        clearSelectedText();
        interceptAnonymousUser(() => {
            Navigation.navigate(ROUTES.ASK_CONCIERGE);
        }, session);
    };

    const accountLabel = currentUserPersonalDetails.displayName ? currentUserPersonalDetails.displayName : translate('initialSettingsPage.account');

    return (
        <>
            {!!isDebugModeEnabled && <DebugTabView selectedTab={selectedTab} />}
            <Animated.View style={layoutWidthStyle}>
                <Hoverable
                    shouldUseNativeHoverEvents
                    onHoverOut={endPeek}
                >
                    {(isBarHovered) => (
                        <Animated.View
                            style={[styles.flatNavigationBarContainer, styles.stickToLeft, styles.zIndex1, visualWidthStyle]}
                            testID="FlatNavigationBar"
                        >
                            {/* Its own layer so the shadow can fade on its own while the bar peeks over the content. */}
                            <Animated.View
                                style={[styles.flatNavigationBarPeekShadow, peekShadowStyle]}
                                pointerEvents="none"
                            />
                            <View style={[styles.flatNavigationBarHeader, isVisuallyCollapsed && styles.flatNavigationBarHeaderCollapsed]}>
                                <Animated.View style={[styles.flatNavigationBarLogoContainer, logoFadeStyle]}>
                                    <FlatNavLogo onPress={navigateToHome} />
                                </Animated.View>
                                <PressableWithFeedback
                                    onPress={toggleSidebar}
                                    role={CONST.ROLE.BUTTON}
                                    accessibilityLabel={translate(isCollapsed ? 'reportActionCompose.expand' : 'reportActionCompose.collapse')}
                                    sentryLabel={CONST.SENTRY_LABEL.NAVIGATION_TAB_BAR.COLLAPSE}
                                    style={styles.flatNavigationBarCollapseButton}
                                >
                                    <Icon
                                        src={isCollapsed ? SidebarRightIcon : SidebarLeftIcon}
                                        fill={theme.icon}
                                        width={variables.iconSizeNormal}
                                        height={variables.iconSizeNormal}
                                    />
                                </PressableWithFeedback>
                            </View>
                            <View style={styles.flatNavigationBarCreateButtonContainer}>
                                <FlatNavCreateButton />
                            </View>
                            <Hoverable onHoverIn={startPeek}>
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
                                    {shouldShowAskConciergeNavItem && (
                                        <FlatNavItem
                                            isCollapsed={isVisuallyCollapsed}
                                            label="Concierge"
                                            icon={icons.Concierge}
                                            isSelected={selectedTab === NAVIGATION_TABS.ASK_CONCIERGE}
                                            statusIndicatorColor={hasUnreadConciergeMessage ? theme.iconSuccessFill : undefined}
                                            sentryLabel={CONST.SENTRY_LABEL.NAVIGATION_TAB_BAR.HOME}
                                            onPress={navigateToAskConcierge}
                                        />
                                    )}
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
                                    {shouldShowExtraNavItems &&
                                        PLACEHOLDER_DESTINATIONS.map(({label, iconName}) => (
                                            <FlatNavItem
                                                isCollapsed={isVisuallyCollapsed}
                                                key={label}
                                                label={label}
                                                icon={icons[iconName]}
                                                isSelected={false}
                                                sentryLabel={CONST.SENTRY_LABEL.NAVIGATION_TAB_BAR.HOME}
                                                onPress={() => {}}
                                            />
                                        ))}
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
                            </Hoverable>
                            <View style={styles.pb3}>
                                <View style={[styles.flexRow, styles.ph3]}>
                                    <SupportalSwitcherButton isSidebarHovered={isBarHovered} />
                                </View>
                                <FlatNavDivider />
                                <FlatNavItem
                                    isCollapsed={isVisuallyCollapsed}
                                    label={accountLabel}
                                    renderLeftElement={({backgroundColor}) => (
                                        <AccountNavigationAvatar
                                            isSelected={isAccountSelected}
                                            badgeBorderColor={backgroundColor}
                                            shouldShowStatus={false}
                                        />
                                    )}
                                    rightElement={<FlatNavAccountStatus />}
                                    isSelected={isAccountSelected}
                                    isTall
                                    accessibilityLabel={getTabAccessibilityLabel(`${accountLabel}, ${translate('sidebarScreen.buttonMySettings')}`, !!accountStatus, translate)}
                                    sentryLabel={CONST.SENTRY_LABEL.NAVIGATION_TAB_BAR.ACCOUNT}
                                    onPress={navigateToAccount}
                                />
                            </View>
                        </Animated.View>
                    )}
                </Hoverable>
            </Animated.View>
        </>
    );
}

export default FlatNavigationBar;
