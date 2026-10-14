import SidebarLeftIcon from '@assets/images/sidebar-left.svg';
import SidebarRightIcon from '@assets/images/sidebar-right.svg';

import Hoverable from '@components/Hoverable';
import Icon from '@components/Icon';
import DebugTabView from '@components/Navigation/DebugTabView';
import NAVIGATION_TABS from '@components/Navigation/NavigationTabBar/NAVIGATION_TABS';
import useWideInboxNavigation from '@components/Navigation/NavigationTabBar/useWideInboxNavigation';
import {
    getCollapseFadeStyle,
    getFlatNavigationBarAccountAvatarStyle,
    getFlatNavigationBarLayoutWidth,
    getFlatNavigationBarPeekShadowStyle,
    getFlatNavigationBarVisualWidthStyle,
    layoutTransitionStyle,
    useSearchSidebarCollapse,
} from '@components/Navigation/SearchSidebarCollapseStore';
import {PressableWithFeedback} from '@components/Pressable';
import ScrollView from '@components/ScrollView';

import useAccountTabIndicatorStatus from '@hooks/useAccountTabIndicatorStatus';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useInboxTabIndicatorStatus from '@hooks/useInboxTabIndicatorStatus';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {usePersonalDetailsByIDs} from '@hooks/usePersonalDetails';
import useRestoreWorkspacesTabOnNavigate from '@hooks/useRestoreWorkspacesTabOnNavigate';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWorkspacesTabIndicatorStatus from '@hooks/useWorkspacesTabIndicatorStatus';

import {navigateToConciergeChat} from '@libs/actions/Report';
import clearSelectedText from '@libs/clearSelectedText/clearSelectedText';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import Navigation from '@libs/Navigation/Navigation';

import NavigationTabBarFloatingActionButton from '@pages/inbox/sidebar/NavigationTabBarFloatingActionButton';
import ProfileAvatarWithIndicator from '@pages/inbox/sidebar/ProfileAvatarWithIndicator';
import SupportalSwitcherButton from '@pages/inbox/sidebar/SupportalSwitcherButton';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import {hasSeenTourSelector} from '@src/selectors/Onboarding';

import type {ValueOf} from 'type-fest';

import React from 'react';
import {View} from 'react-native';
import Animated from 'react-native-reanimated';

import FlatNavDivider from './FlatNavDivider';
import FlatNavItem from './FlatNavItem';
import FlatNavLogo from './FlatNavLogo';
import FlatNavSpendSection, {FlatNavSpendSectionWithTodoCounts} from './FlatNavSpendSection';

const FAB_ANCHOR_ALIGNMENT = {
    horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
    vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
} as const;

// Puts the create menu 8px below the Create button and flush with its left edge. The button is the first row under
// the header, so both edges follow from the header's height.
const FAB_ANCHOR_POSITION = {
    horizontal: 12,
    vertical: variables.flatNavigationBarHeaderHeight + variables.flatNavigationBarCreateButtonHeight + 8,
};

type FlatNavigationBarProps = {
    selectedTab: ValueOf<typeof NAVIGATION_TABS>;
};

/**
 * Wide-layout left navigation. It lists every top-level destination as a full-width row, reveals a group's searches
 * as child rows while that group is the active destination, and collapses into an icon rail.
 */
function FlatNavigationBar({selectedTab}: FlatNavigationBarProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const [isDebugModeEnabled] = useOnyx(ONYXKEYS.IS_DEBUG_MODE_ENABLED);

    const navIcons = useMemoizedLazyExpensifyIcons(['Home', 'Concierge', 'Inbox', 'Buildings']);

    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [isSelfTourViewed] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {selector: hasSeenTourSelector});
    const [conciergePersonalDetails] = usePersonalDetailsByIDs([CONST.ACCOUNT_ID.CONCIERGE]);

    const {status: chatTabBrickRoad, indicatorColor: inboxStatusIndicatorColor} = useInboxTabIndicatorStatus();
    const {indicatorColor: workspacesTabIndicatorColor, status: workspacesTabIndicatorStatus} = useWorkspacesTabIndicatorStatus();
    const {status: accountTabIndicatorStatus} = useAccountTabIndicatorStatus();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();

    const {isCollapsed, isPeeking, isVisuallyCollapsed, toggleSidebar, startPeek, endPeek} = useSearchSidebarCollapse();

    const {navigateToInbox, lastReportRouteReportID: lastInboxReportID} = useWideInboxNavigation(selectedTab === NAVIGATION_TABS.INBOX);
    const navigateToWorkspaces = useRestoreWorkspacesTabOnNavigate();

    // The Concierge chat lives in the Inbox, so its row takes the selection away from the Inbox row while it is open.
    const isConciergeSelected = selectedTab === NAVIGATION_TABS.INBOX && !!conciergeReportID && lastInboxReportID === conciergeReportID;
    const isInboxSelected = selectedTab === NAVIGATION_TABS.INBOX && !isConciergeSelected;
    const isSpendTabSelected = selectedTab === NAVIGATION_TABS.SEARCH;
    const isAccountSelected = selectedTab === NAVIGATION_TABS.SETTINGS;

    const navigateToHome = () => {
        if (selectedTab === NAVIGATION_TABS.HOME) {
            return;
        }
        Navigation.navigate(ROUTES.HOME);
    };

    const navigateToConcierge = () => {
        if (isConciergeSelected) {
            return;
        }
        clearSelectedText();
        interceptAnonymousUser(() => {
            navigateToConciergeChat({
                conciergeReportID,
                introSelected,
                currentUserAccountID: currentUserPersonalDetails.accountID,
                isSelfTourViewed,
                conciergePersonalDetails,
            });
        });
    };

    // With Concierge open, the Inbox's last report is Concierge itself, so reopening it would change nothing.
    const navigateToInboxRow = () => {
        if (!isConciergeSelected) {
            navigateToInbox();
            return;
        }
        clearSelectedText();
        Navigation.navigate(ROUTES.INBOX);
    };

    const navigateToSettings = () => {
        if (selectedTab === NAVIGATION_TABS.SETTINGS) {
            return;
        }
        interceptAnonymousUser(() => {
            Navigation.navigate(ROUTES.SETTINGS);
        });
    };

    const accountAccessibilityLabel = [
        `${translate('initialSettingsPage.account')}, ${translate('sidebarScreen.buttonMySettings')}`,
        accountTabIndicatorStatus ? translate('common.yourReviewIsRequired') : undefined,
    ]
        .filter(Boolean)
        .join('. ');

    return (
        <>
            {!!isDebugModeEnabled && <DebugTabView selectedTab={selectedTab} />}
            <Animated.View style={[layoutTransitionStyle, styles.h100, {width: getFlatNavigationBarLayoutWidth(isCollapsed)}]}>
                <Hoverable onHoverOut={endPeek}>
                    <Animated.View
                        style={[styles.flatNavigationBarContainer, styles.stickToLeft, styles.zIndex1, getFlatNavigationBarVisualWidthStyle(isVisuallyCollapsed)]}
                        testID="FlatNavigationBar"
                    >
                        <Animated.View
                            style={[styles.flatNavigationBarPeekShadow, getFlatNavigationBarPeekShadowStyle(isPeeking)]}
                            pointerEvents="none"
                        />
                        <View style={[styles.flatNavigationBarHeader, isVisuallyCollapsed && styles.flatNavigationBarHeaderCollapsed]}>
                            <Animated.View style={[styles.flatNavigationBarLogoContainer, getCollapseFadeStyle(isVisuallyCollapsed)]}>
                                <FlatNavLogo />
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

                        <Hoverable onHoverIn={startPeek}>
                            <ScrollView
                                style={styles.flex1}
                                showsVerticalScrollIndicator={false}
                            >
                                <NavigationTabBarFloatingActionButton
                                    containerStyle={[styles.flexGrow0, styles.pv0, styles.flatNavigationBarCreateRow]}
                                    shouldShowReceiptButton={false}
                                    shouldUseSmallSuccessButton
                                    label={isVisuallyCollapsed ? undefined : translate('common.create')}
                                    anchorPosition={FAB_ANCHOR_POSITION}
                                    anchorAlignment={FAB_ANCHOR_ALIGNMENT}
                                />

                                <FlatNavItem
                                    isCollapsed={isVisuallyCollapsed}
                                    label={translate('common.home')}
                                    icon={navIcons.Home}
                                    isSelected={selectedTab === NAVIGATION_TABS.HOME}
                                    sentryLabel={CONST.SENTRY_LABEL.NAVIGATION_TAB_BAR.HOME}
                                    onPress={navigateToHome}
                                />
                                <FlatNavItem
                                    isCollapsed={isVisuallyCollapsed}
                                    label={CONST.CONCIERGE_DISPLAY_NAME}
                                    icon={navIcons.Concierge}
                                    isSelected={isConciergeSelected}
                                    sentryLabel={CONST.SENTRY_LABEL.NAVIGATION_TAB_BAR.CONCIERGE}
                                    onPress={navigateToConcierge}
                                />
                                <FlatNavItem
                                    isCollapsed={isVisuallyCollapsed}
                                    label={translate('common.inbox')}
                                    icon={navIcons.Inbox}
                                    isSelected={isInboxSelected}
                                    statusIndicatorColor={inboxStatusIndicatorColor}
                                    accessibilityLabel={chatTabBrickRoad ? `${translate('common.inbox')}. ${translate('common.yourReviewIsRequired')}` : translate('common.inbox')}
                                    sentryLabel={CONST.SENTRY_LABEL.NAVIGATION_TAB_BAR.INBOX}
                                    onPress={navigateToInboxRow}
                                />

                                <FlatNavDivider />

                                {isSpendTabSelected ? (
                                    <FlatNavSpendSectionWithTodoCounts
                                        selectedTab={selectedTab}
                                        isCollapsed={isVisuallyCollapsed}
                                    />
                                ) : (
                                    <FlatNavSpendSection
                                        selectedTab={selectedTab}
                                        isCollapsed={isVisuallyCollapsed}
                                    />
                                )}

                                <FlatNavDivider />

                                <FlatNavItem
                                    isCollapsed={isVisuallyCollapsed}
                                    label={translate('common.workspacesTabTitle')}
                                    icon={navIcons.Buildings}
                                    isSelected={selectedTab === NAVIGATION_TABS.WORKSPACES}
                                    statusIndicatorColor={workspacesTabIndicatorStatus ? workspacesTabIndicatorColor : undefined}
                                    accessibilityLabel={
                                        workspacesTabIndicatorStatus
                                            ? `${translate('common.workspacesTabTitle')}. ${translate('common.yourReviewIsRequired')}`
                                            : translate('common.workspacesTabTitle')
                                    }
                                    sentryLabel={CONST.SENTRY_LABEL.NAVIGATION_TAB_BAR.WORKSPACES}
                                    onPress={navigateToWorkspaces}
                                />
                            </ScrollView>
                        </Hoverable>

                        <View style={styles.flatNavigationBarFooter}>
                            <Hoverable shouldUseNativeHoverEvents>
                                {(isFooterHovered) => (
                                    <View style={[styles.flexRow, styles.ph3]}>
                                        <SupportalSwitcherButton isSidebarHovered={isFooterHovered && !isVisuallyCollapsed} />
                                    </View>
                                )}
                            </Hoverable>
                            <FlatNavDivider />
                            <FlatNavItem
                                isCollapsed={isVisuallyCollapsed}
                                label={currentUserPersonalDetails.displayName ?? translate('initialSettingsPage.account')}
                                leftElement={
                                    <Animated.View style={[styles.flatNavigationBarAccountAvatar, getFlatNavigationBarAccountAvatarStyle(isVisuallyCollapsed)]}>
                                        <ProfileAvatarWithIndicator isSelected={isAccountSelected} />
                                    </Animated.View>
                                }
                                isSelected={isAccountSelected}
                                accessibilityLabel={accountAccessibilityLabel}
                                additionalStyle={styles.flatNavigationBarAccountItem}
                                sentryLabel={CONST.SENTRY_LABEL.NAVIGATION_TAB_BAR.ACCOUNT}
                                onPress={navigateToSettings}
                            />
                        </View>
                    </Animated.View>
                </Hoverable>
            </Animated.View>
        </>
    );
}

export default FlatNavigationBar;
