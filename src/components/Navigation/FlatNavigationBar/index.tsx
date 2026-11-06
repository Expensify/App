import AccountNavigationAvatar from '@components/Avatar/AccountNavigationAvatar';
import Hoverable from '@components/Hoverable';
import DebugTabView from '@components/Navigation/DebugTabView';
import getTabAccessibilityLabel from '@components/Navigation/NavigationTabBar/getTabAccessibilityLabel';
import NAVIGATION_TABS from '@components/Navigation/NavigationTabBar/NAVIGATION_TABS';
import useAccountTabNavigation from '@components/Navigation/NavigationTabBar/useAccountTabNavigation';
import useHomeTabNavigation from '@components/Navigation/NavigationTabBar/useHomeTabNavigation';
import useInsightsTabNavigation from '@components/Navigation/NavigationTabBar/useInsightsTabNavigation';
import useSearchTabNavigation from '@components/Navigation/NavigationTabBar/useSearchTabNavigation';
import useWideInboxNavigation from '@components/Navigation/NavigationTabBar/useWideInboxNavigation';
import ScrollView from '@components/ScrollView';

import useAccountTabIndicatorStatus from '@hooks/useAccountTabIndicatorStatus';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useInboxTabIndicatorStatus from '@hooks/useInboxTabIndicatorStatus';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useRestoreWorkspacesTabOnNavigate from '@hooks/useRestoreWorkspacesTabOnNavigate';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import useWorkspacesTabIndicatorStatus from '@hooks/useWorkspacesTabIndicatorStatus';

import SupportalSwitcherButton from '@pages/inbox/sidebar/SupportalSwitcherButton';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import type {ValueOf} from 'type-fest';

import React from 'react';
import {View} from 'react-native';

import FlatNavAccountStatus from './FlatNavAccountStatus';
import FlatNavCreateMenuButtons from './FlatNavCreateMenuButtons';
import FlatNavDivider from './FlatNavDivider';
import FlatNavItem from './FlatNavItem';
import FlatNavLogo from './FlatNavLogo';

type FlatNavigationBarProps = {
    selectedTab: ValueOf<typeof NAVIGATION_TABS>;
};

/** Wide-layout left navigation that lists every top-level destination as a full-width row, with Account at the bottom. */
function FlatNavigationBar({selectedTab}: FlatNavigationBarProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();
    const [isDebugModeEnabled] = useOnyx(ONYXKEYS.IS_DEBUG_MODE_ENABLED);
    const icons = useMemoizedLazyExpensifyIcons(['Home', 'Inbox', 'ReceiptMultiple', 'PieChart', 'Buildings']);
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();

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

    const accountLabel = currentUserPersonalDetails.displayName ? currentUserPersonalDetails.displayName : translate('initialSettingsPage.account');

    return (
        <>
            {!!isDebugModeEnabled && <DebugTabView selectedTab={selectedTab} />}
            <Hoverable shouldUseNativeHoverEvents>
                {(isBarHovered) => (
                    <View
                        style={[styles.flatNavigationBarContainer, StyleUtils.getWidthStyle(variables.flatNavigationBarWidth)]}
                        testID="FlatNavigationBar"
                    >
                        <View style={styles.flatNavigationBarHeader}>
                            <FlatNavLogo onPress={navigateToHome} />
                            <FlatNavCreateMenuButtons />
                        </View>
                        <ScrollView
                            style={styles.flex1}
                            showsVerticalScrollIndicator={false}
                        >
                            <FlatNavItem
                                label={translate('common.home')}
                                icon={icons.Home}
                                isSelected={isHomeSelected}
                                sentryLabel={CONST.SENTRY_LABEL.NAVIGATION_TAB_BAR.HOME}
                                onPress={navigateToHome}
                            />
                            <FlatNavItem
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
                                label={translate('common.spend')}
                                icon={icons.ReceiptMultiple}
                                isSelected={selectedTab === NAVIGATION_TABS.SEARCH}
                                sentryLabel={CONST.SENTRY_LABEL.NAVIGATION_TAB_BAR.REPORTS}
                                onPress={navigateToSearch}
                            />
                            <FlatNavItem
                                label={translate('common.insights')}
                                icon={icons.PieChart}
                                isSelected={selectedTab === NAVIGATION_TABS.INSIGHTS}
                                sentryLabel={CONST.SENTRY_LABEL.NAVIGATION_TAB_BAR.INSIGHTS}
                                onPress={navigateToInsights}
                            />
                            <FlatNavDivider />
                            <FlatNavItem
                                label={translate('common.workspacesTabTitle')}
                                icon={icons.Buildings}
                                isSelected={selectedTab === NAVIGATION_TABS.WORKSPACES}
                                statusIndicatorColor={workspacesStatus ? workspacesIndicatorColor : undefined}
                                accessibilityLabel={getTabAccessibilityLabel(translate('common.workspacesTabTitle'), !!workspacesStatus, translate)}
                                sentryLabel={CONST.SENTRY_LABEL.NAVIGATION_TAB_BAR.WORKSPACES}
                                onPress={navigateToWorkspaces}
                            />
                        </ScrollView>
                        <View style={styles.pb3}>
                            <View style={[styles.flexRow, styles.ph3]}>
                                <SupportalSwitcherButton isSidebarHovered={isBarHovered} />
                            </View>
                            <FlatNavDivider />
                            <FlatNavItem
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
                    </View>
                )}
            </Hoverable>
        </>
    );
}

export default FlatNavigationBar;
