import SidebarLeftIcon from '@assets/images/sidebar-left.svg';
import SidebarRightIcon from '@assets/images/sidebar-right.svg';

import Hoverable from '@components/Hoverable';
import Icon from '@components/Icon';
import DebugTabView from '@components/Navigation/DebugTabView';
import getSearchTabRoute from '@components/Navigation/NavigationTabBar/getSearchTabRoute';
import NAVIGATION_TABS from '@components/Navigation/NavigationTabBar/NAVIGATION_TABS';
import useWideInboxNavigation from '@components/Navigation/NavigationTabBar/useWideInboxNavigation';
import {
    useFlatNavigationBarAccountAvatarStyle,
    useFlatNavigationBarLayoutWidthStyle,
    useFlatNavigationBarVisualWidthStyle,
    useSearchSidebarCollapse,
} from '@components/Navigation/SearchSidebarCollapseStore';
import {PressableWithFeedback} from '@components/Pressable';
import ScrollView from '@components/ScrollView';
import {useSearchQueryContext, useSearchSelectionActions} from '@components/Search/SearchContext';

import useAccountTabIndicatorStatus from '@hooks/useAccountTabIndicatorStatus';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import useRestoreWorkspacesTabOnNavigate from '@hooks/useRestoreWorkspacesTabOnNavigate';
import {useSidebarOrderedReportsState} from '@hooks/useSidebarOrderedReports';
import useSingleExecution from '@hooks/useSingleExecution';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useTodoCounts from '@hooks/useTodoCounts';
import useWorkspacesTabIndicatorStatus from '@hooks/useWorkspacesTabIndicatorStatus';

import {setSearchContext} from '@libs/actions/Search';
import clearSelectedText from '@libs/clearSelectedText/clearSelectedText';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import Navigation from '@libs/Navigation/Navigation';
import navigationRef from '@libs/Navigation/navigationRef';
import {savedSearchIDToSearchKey} from '@libs/SearchKeyUtils';
import navigateToCannedSpendSearch from '@libs/SearchNavigationUtils';
import {getValidLastQuery} from '@libs/SearchQueryUtils';
import type {SearchTypeMenuItem} from '@libs/SearchUIUtils';
import {formatBadgeText, getItemBadgeText, getLastSearchQuery, SEARCH_TYPE_MENU_ICON_NAMES} from '@libs/SearchUIUtils';
import {ACCOUNTING_KEYS, getGroupedSearchTranslationPath, REPORTS_KEYS} from '@libs/SpendNavigationGroups';

import NavigationTabBarFloatingActionButton from '@pages/inbox/sidebar/NavigationTabBarFloatingActionButton';
import ProfileAvatarWithIndicator from '@pages/inbox/sidebar/ProfileAvatarWithIndicator';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import {lastExpensesSearchQuerySelector} from '@src/selectors/SearchFilters';

import type {ValueOf} from 'type-fest';

import React from 'react';
import {View} from 'react-native';
import Animated from 'react-native-reanimated';

import FlatNavDivider from './FlatNavDivider';
import FlatNavItem from './FlatNavItem';
import FlatNavLogo from './FlatNavLogo';
import FlatNavSavedSearches from './FlatNavSavedSearches';
import useFlatNavSpendItems from './useFlatNavSpendItems';

// TODO: placeholder destinations shown for design review only. They render as rows but go nowhere.
const PLACEHOLDER_DESTINATIONS = [
    {label: 'Bills', iconName: 'Coins'},
    {label: 'Invoices', iconName: 'InvoiceGeneric'},
    {label: 'Travel', iconName: 'LuggageWithLines'},
] as const;

const FAB_ANCHOR_ALIGNMENT = {
    horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
    vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
} as const;

// Puts the create menu 8px below the Create button and flush with its left edge. The button is the first row under
// the header, so both edges follow from the header's height and the margin the row sits at.
const FAB_ANCHOR_POSITION = {
    horizontal: 12,
    vertical: variables.flatNavigationBarHeaderHeight + variables.flatNavigationBarHeaderMarginBottom + variables.flatNavigationBarCreateButtonHeight + 8,
};

type FlatNavigationBarProps = {
    selectedTab: ValueOf<typeof NAVIGATION_TABS>;
};

/**
 * Wide-layout left navigation. It lists every top-level destination as a full-width row, and reveals the
 * Reports and Accounting searches as child rows once their parent is the active destination.
 */
function FlatNavigationBar({selectedTab}: FlatNavigationBarProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const {singleExecution} = useSingleExecution();
    const {isBetaEnabled} = usePermissions();
    const [isDebugModeEnabled] = useOnyx(ONYXKEYS.IS_DEBUG_MODE_ENABLED);

    const navIcons = useMemoizedLazyExpensifyIcons(['Home', 'Inbox', 'Receipt', 'Document', 'Connect', 'Bookmark', 'PieChart', 'Buildings', 'Coins', 'InvoiceGeneric', 'LuggageWithLines']);
    const searchIcons = useMemoizedLazyExpensifyIcons(SEARCH_TYPE_MENU_ICON_NAMES);

    const {currentSearchKey} = useSearchQueryContext();
    const {clearSelectedTransactions} = useSearchSelectionActions();
    const {counts: reportCounts} = useTodoCounts();
    const {expenses, reports, accounting} = useFlatNavSpendItems();

    const [searchFilters] = useOnyx(ONYXKEYS.SEARCH_FILTERS);
    const [savedSearches] = useOnyx(ONYXKEYS.SAVED_SEARCHES);
    const [lastSearchParams] = useOnyx(ONYXKEYS.REPORT_NAVIGATION_LAST_SEARCH_QUERY);
    const [lastExpensesSearchQuery] = useOnyx(ONYXKEYS.SEARCH_FILTERS, {selector: lastExpensesSearchQuerySelector});

    const {chatTabBrickRoad} = useSidebarOrderedReportsState();
    const {indicatorColor: workspacesTabIndicatorColor, status: workspacesTabIndicatorStatus} = useWorkspacesTabIndicatorStatus();
    const {status: accountTabIndicatorStatus} = useAccountTabIndicatorStatus();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();

    const {isCollapsed, isVisuallyCollapsed, toggleSidebar, startPeek, endPeek} = useSearchSidebarCollapse();
    const layoutWidthStyle = useFlatNavigationBarLayoutWidthStyle();
    const visualWidthStyle = useFlatNavigationBarVisualWidthStyle();
    const accountAvatarStyle = useFlatNavigationBarAccountAvatarStyle();

    const navigateToInbox = useWideInboxNavigation(selectedTab === NAVIGATION_TABS.INBOX);
    const navigateToWorkspaces = useRestoreWorkspacesTabOnNavigate();

    const isSpendTabSelected = selectedTab === NAVIGATION_TABS.SEARCH;
    const isReportsGroupSelected = isSpendTabSelected && REPORTS_KEYS.some((key) => key === currentSearchKey);
    const isAccountingGroupSelected = isSpendTabSelected && ACCOUNTING_KEYS.some((key) => key === currentSearchKey);
    const isAccountSelected = selectedTab === NAVIGATION_TABS.SETTINGS;
    const isSavedGroupSelected = isSpendTabSelected && !!currentSearchKey?.startsWith(CONST.SEARCH.SAVED_SEARCH_PREFIX);
    // A saved search pending deletion still shows until the server confirms, matching the Spend page's own list.
    const hasSavedSearches = Object.keys(savedSearches ?? {}).length > 0;

    let inboxStatusIndicatorColor: string | undefined;
    if (chatTabBrickRoad === CONST.BRICK_ROAD_INDICATOR_STATUS.INFO) {
        inboxStatusIndicatorColor = theme.iconSuccessFill;
    } else if (chatTabBrickRoad) {
        inboxStatusIndicatorColor = theme.danger;
    }

    const navigateToSearchItem = singleExecution((item: SearchTypeMenuItem) => {
        clearSelectedText();
        interceptAnonymousUser(() => {
            navigateToCannedSpendSearch(item.key, item.searchQuery, getLastSearchQuery(searchFilters, item.key), clearSelectedTransactions);
        });
    });

    // A collapsed group carries its children's combined count. Once it expands, each child shows its own count, so
    // repeating the total on the parent would double-report it. formatBadgeText returns '' for zero, which renders nothing.
    // TodoCounts only declares the four keys it tracks; widening it lets a group sum over any of its children.
    const countsBySearchKey: Record<string, number> = reportCounts;
    const getGroupBadgeText = (items: SearchTypeMenuItem[], isExpanded: boolean) =>
        isExpanded ? undefined : formatBadgeText(items.reduce((total, item) => total + (countsBySearchKey[item.key] ?? 0), 0));

    const getSearchItemLabel = (item: SearchTypeMenuItem, isSubItem: boolean) =>
        translate(isSubItem ? getGroupedSearchTranslationPath(item.key, item.translationPath) : item.translationPath);

    const renderSearchItem = (item: SearchTypeMenuItem, isSubItem: boolean) => (
        <FlatNavItem
            key={item.key}
            isCollapsed={isVisuallyCollapsed}
            label={getSearchItemLabel(item, isSubItem)}
            icon={isSubItem ? undefined : searchIcons[item.icon]}
            isSelected={isSpendTabSelected && currentSearchKey === item.key}
            isSubItem={isSubItem}
            badgeText={getItemBadgeText(item.key, reportCounts)}
            sentryLabel={CONST.SENTRY_LABEL.SEARCH.TYPE_MENU_ITEM}
            onPress={() => navigateToSearchItem(item)}
        />
    );

    const navigateToHome = () => {
        if (selectedTab === NAVIGATION_TABS.HOME) {
            return;
        }
        Navigation.navigate(ROUTES.HOME);
    };

    const navigateToSpendRoot = () => {
        clearSelectedText();
        interceptAnonymousUser(() => {
            Navigation.navigate(getSearchTabRoute(navigationRef.getRootState(), lastSearchParams, lastExpensesSearchQuery));
        });
    };

    const navigateToInsights = () => {
        if (selectedTab === NAVIGATION_TABS.INSIGHTS) {
            return;
        }
        clearSelectedText();
        interceptAnonymousUser(() => {
            Navigation.navigate(ROUTES.INSIGHTS.getRoute(CONST.INSIGHTS.DASHBOARD.SPEND));
        });
    };

    // Opening the group navigates to a saved search so its children can render; the first one by key order is
    // the cheapest choice here, since ordering the list by title needs the Onyx data FlatNavSavedSearches loads.
    const navigateToFirstSavedSearch = () => {
        const [savedSearchID, savedSearch] = Object.entries(savedSearches ?? {}).at(0) ?? [];
        if (!savedSearchID || !savedSearch) {
            return;
        }
        const searchKey = savedSearchIDToSearchKey(savedSearchID);
        const query = getValidLastQuery(getLastSearchQuery(searchFilters, searchKey), savedSearch.query);
        clearSelectedText();
        interceptAnonymousUser(() => {
            setSearchContext(false);
            Navigation.navigate(ROUTES.SEARCH_ROOT.getRoute({query, name: savedSearch.name, searchKey}));
        });
    };

    const navigateToSettings = () => {
        if (selectedTab === NAVIGATION_TABS.SETTINGS) {
            return;
        }
        interceptAnonymousUser(() => {
            Navigation.navigate(ROUTES.SETTINGS);
        });
    };

    return (
        <>
            {!!isDebugModeEnabled && <DebugTabView selectedTab={selectedTab} />}
            <Animated.View style={layoutWidthStyle}>
                <Hoverable onHoverOut={endPeek}>
                    <Animated.View
                        style={[styles.flatNavigationBarContainer, styles.stickToLeft, styles.zIndex1, visualWidthStyle]}
                        testID="FlatNavigationBar"
                    >
                        <View style={[styles.flatNavigationBarHeader, isVisuallyCollapsed && styles.flatNavigationBarHeaderCollapsed]}>
                            {!isVisuallyCollapsed && <FlatNavLogo />}
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
                                    label={translate('common.inbox')}
                                    icon={navIcons.Inbox}
                                    isSelected={selectedTab === NAVIGATION_TABS.INBOX}
                                    statusIndicatorColor={inboxStatusIndicatorColor}
                                    accessibilityLabel={chatTabBrickRoad ? `${translate('common.inbox')}. ${translate('common.yourReviewIsRequired')}` : translate('common.inbox')}
                                    sentryLabel={CONST.SENTRY_LABEL.NAVIGATION_TAB_BAR.INBOX}
                                    onPress={navigateToInbox}
                                />

                                <FlatNavDivider />

                                {!!expenses && renderSearchItem(expenses, false)}

                                {reports.length > 0 && (
                                    <>
                                        <FlatNavItem
                                            isCollapsed={isVisuallyCollapsed}
                                            label={translate('common.reports')}
                                            icon={navIcons.Document}
                                            isSelected={isReportsGroupSelected}
                                            badgeText={getGroupBadgeText(reports, isReportsGroupSelected)}
                                            sentryLabel={CONST.SENTRY_LABEL.NAVIGATION_TAB_BAR.REPORTS}
                                            onPress={() => {
                                                const firstReport = reports.at(0);
                                                if (!firstReport) {
                                                    navigateToSpendRoot();
                                                    return;
                                                }
                                                navigateToSearchItem(firstReport);
                                            }}
                                        />
                                        {isReportsGroupSelected && !isVisuallyCollapsed && reports.map((item) => renderSearchItem(item, true))}
                                    </>
                                )}

                                {accounting.length > 0 && (
                                    <>
                                        <FlatNavItem
                                            isCollapsed={isVisuallyCollapsed}
                                            label={translate('search.tabs.accounting')}
                                            icon={navIcons.Connect}
                                            isSelected={isAccountingGroupSelected}
                                            badgeText={getGroupBadgeText(accounting, isAccountingGroupSelected)}
                                            onPress={() => {
                                                const firstAccounting = accounting.at(0);
                                                if (!firstAccounting) {
                                                    navigateToSpendRoot();
                                                    return;
                                                }
                                                navigateToSearchItem(firstAccounting);
                                            }}
                                        />
                                        {isAccountingGroupSelected && !isVisuallyCollapsed && accounting.map((item) => renderSearchItem(item, true))}
                                    </>
                                )}

                                {/* TODO: placeholders for design review - these rows have no destination yet. */}
                                {PLACEHOLDER_DESTINATIONS.map(({label, iconName}) => (
                                    <FlatNavItem
                                        key={label}
                                        isCollapsed={isVisuallyCollapsed}
                                        label={label}
                                        icon={navIcons[iconName]}
                                        isSelected={false}
                                        onPress={() => {}}
                                    />
                                ))}

                                {isBetaEnabled(CONST.BETAS.INSIGHTS_PAGE) && (
                                    <FlatNavItem
                                        isCollapsed={isVisuallyCollapsed}
                                        label={translate('common.insights')}
                                        icon={navIcons.PieChart}
                                        isSelected={selectedTab === NAVIGATION_TABS.INSIGHTS}
                                        sentryLabel={CONST.SENTRY_LABEL.NAVIGATION_TAB_BAR.INSIGHTS}
                                        onPress={navigateToInsights}
                                    />
                                )}

                                {hasSavedSearches && (
                                    <>
                                        <FlatNavItem
                                            isCollapsed={isVisuallyCollapsed}
                                            label={translate('search.savedSearchesMenuItemTitle')}
                                            icon={navIcons.Bookmark}
                                            isSelected={isSavedGroupSelected}
                                            onPress={navigateToFirstSavedSearch}
                                        />
                                        {isSavedGroupSelected && !isVisuallyCollapsed && <FlatNavSavedSearches />}
                                        <FlatNavDivider />
                                    </>
                                )}

                                <FlatNavItem
                                    isCollapsed={isVisuallyCollapsed}
                                    label={translate('common.workspacesTabTitle')}
                                    icon={navIcons.Buildings}
                                    isSelected={selectedTab === NAVIGATION_TABS.WORKSPACES}
                                    statusIndicatorColor={workspacesTabIndicatorStatus ? workspacesTabIndicatorColor : undefined}
                                    accessibilityLabel={`${translate('common.workspacesTabTitle')}${workspacesTabIndicatorStatus ? `. ${translate('common.yourReviewIsRequired')}` : ''}`}
                                    sentryLabel={CONST.SENTRY_LABEL.NAVIGATION_TAB_BAR.WORKSPACES}
                                    onPress={navigateToWorkspaces}
                                />
                            </ScrollView>
                        </Hoverable>

                        <View style={styles.flatNavigationBarFooter}>
                            <FlatNavDivider />
                            <FlatNavItem
                                isCollapsed={isVisuallyCollapsed}
                                label={currentUserPersonalDetails.displayName ?? translate('initialSettingsPage.account')}
                                leftElement={
                                    <Animated.View style={[styles.flatNavigationBarAccountAvatar, accountAvatarStyle]}>
                                        <ProfileAvatarWithIndicator isSelected={isAccountSelected} />
                                    </Animated.View>
                                }
                                isSelected={isAccountSelected}
                                accessibilityLabel={`${translate('initialSettingsPage.account')}, ${translate('sidebarScreen.buttonMySettings')}. ${
                                    accountTabIndicatorStatus ? `${translate('common.yourReviewIsRequired')}.` : ''
                                }`}
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
