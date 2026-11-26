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
import {useSearchQueryContext, useSearchSelectionActions} from '@components/Search/SearchContext';

import useAccountTabIndicatorStatus from '@hooks/useAccountTabIndicatorStatus';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useInboxTabIndicatorStatus from '@hooks/useInboxTabIndicatorStatus';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useRestoreWorkspacesTabOnNavigate from '@hooks/useRestoreWorkspacesTabOnNavigate';
import useSingleExecution from '@hooks/useSingleExecution';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useTodoCounts from '@hooks/useTodoCounts';
import useWorkspacesTabIndicatorStatus from '@hooks/useWorkspacesTabIndicatorStatus';

import {setSearchContext} from '@libs/actions/Search';
import clearSelectedText from '@libs/clearSelectedText/clearSelectedText';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import isHTMLElement from '@libs/isHTMLElement';
import {setIsSearchTabHovered} from '@libs/Navigation/helpers/searchTabPreloadStore';
import Navigation from '@libs/Navigation/Navigation';
import {savedSearchIDToSearchKey} from '@libs/SearchKeyUtils';
import navigateToCannedSpendSearch from '@libs/SearchNavigationUtils';
import {getValidLastQuery} from '@libs/SearchQueryUtils';
import type {SearchTypeMenuItem} from '@libs/SearchUIUtils';
import {formatBadgeText, getItemBadgeText, getLastSearchQuery, getSearchTypeMenuItemSentryLabel} from '@libs/SearchUIUtils';
import {ACCOUNTING_KEYS, EXPENSES_KEYS, getGroupedSearchTranslationPath, REPORTS_KEYS} from '@libs/SpendNavigationGroups';

import {requestNewConciergeQuestion} from '@pages/AskConcierge/NewQuestionStore';
import useCreateMenuVisibility from '@pages/inbox/sidebar/FABPopoverContent/useCreateMenuVisibility';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Report} from '@src/types/onyx';

import type {ComponentRef} from 'react';
import type {NativeSyntheticEvent, TargetedEvent} from 'react-native';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
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
import FlatNavSavedSearches from './FlatNavSavedSearches';
import FlatNavSubItemList from './FlatNavSubItemList';
import FlatNavSupportalItem from './FlatNavSupportalItem';
import useFlatNavSpendItems from './useFlatNavSpendItems';

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

// Only keyboard focus counts: an item clicked with the mouse keeps focus too, and must not hold anything open after the pointer leaves.
function hasKeyboardFocusIn(element: unknown) {
    return isHTMLElement(element) && !!element.querySelector(':focus-visible');
}

// On web the native event is a DOM FocusEvent, whose relatedTarget is the element receiving focus.
function isFocusMovingWithin(event: NativeSyntheticEvent<TargetedEvent>) {
    const currentTarget = event.currentTarget;
    const relatedTarget = 'relatedTarget' in event.nativeEvent ? event.nativeEvent.relatedTarget : null;
    return isHTMLElement(currentTarget) && isHTMLElement(relatedTarget) && currentTarget.contains(relatedTarget);
}

/** Wide-layout left navigation that lists every top-level destination as a full-width row, with Account at the bottom. */
function FlatNavigationBar({selectedTab}: FlatNavigationBarProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [isDebugModeEnabled] = useOnyx(ONYXKEYS.IS_DEBUG_MODE_ENABLED);
    const icons = useMemoizedLazyExpensifyIcons([
        'Home',
        'Inbox',
        'Receipt',
        'Document',
        'Connect',
        'Bookmark',
        'PieChart',
        'Buildings',
        'Concierge',
        'Coins',
        'InvoiceGeneric',
        'LuggageWithLines',
    ]);
    const theme = useTheme();
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const [shouldShowExtraNavItems = false] = useOnyx(ONYXKEYS.SHOULD_SHOW_EXTRA_NAV_ITEMS);
    const [shouldShowAskConciergeNavItem = true] = useOnyx(ONYXKEYS.SHOULD_SHOW_ASK_CONCIERGE_NAV_ITEM);
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const [searchFilters] = useOnyx(ONYXKEYS.SEARCH_FILTERS);
    const [savedSearches] = useOnyx(ONYXKEYS.SAVED_SEARCHES);
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const {isCollapsed, isPeeking, isVisuallyCollapsed, toggleSidebar, startPeek, endPeek} = useSearchSidebarCollapse(COLLAPSE_SURFACE.NAVIGATION_BAR);

    const {status: inboxStatus, indicatorColor: inboxIndicatorColor} = useInboxTabIndicatorStatus();
    const {status: workspacesStatus, indicatorColor: workspacesIndicatorColor} = useWorkspacesTabIndicatorStatus();
    const {status: accountStatus} = useAccountTabIndicatorStatus();

    const hasUnreadConciergeMessageSelector = makeHasUnreadConciergeMessageSelector(currentUserPersonalDetails.accountID, conciergeReportID);
    const [hasUnreadConciergeMessage = false] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {selector: hasUnreadConciergeMessageSelector});

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

    // Spend is listed as its groups rather than as one row: Expenses, Reports, Accounting and Saved, each opening
    // into its own searches.
    const {singleExecution} = useSingleExecution();
    const {currentSearchKey} = useSearchQueryContext();
    const {clearSelectedTransactions} = useSearchSelectionActions();
    const {counts: reportCounts} = useTodoCounts();
    const {expenses, reports, accounting} = useFlatNavSpendItems();

    // Read once, outside the conditional rows, so the route stays cached between renders.
    const spendLinkRoute = getSignedInLinkRoute(storedSearchTabRoute);

    const isSpendTabSelected = selectedTab === NAVIGATION_TABS.SEARCH;
    const isExpensesGroupSelected = isSpendTabSelected && EXPENSES_KEYS.some((key) => key === currentSearchKey);
    const isReportsGroupSelected = isSpendTabSelected && REPORTS_KEYS.some((key) => key === currentSearchKey);
    const isAccountingGroupSelected = isSpendTabSelected && ACCOUNTING_KEYS.some((key) => key === currentSearchKey);
    const isSavedGroupSelected = isSpendTabSelected && !!currentSearchKey?.startsWith(CONST.SEARCH.SAVED_SEARCH_PREFIX);

    // The parent row of Expenses and Reports is the group's broadest search, so it leads nowhere new as a child.
    // What is left under it are the narrower searches, and a user who only ever sees their own has none of them.
    const expensesRoot = expenses.find((item) => item.key === CONST.SEARCH.SEARCH_KEYS.EXPENSES);
    const expensesChildren = expenses.filter((item) => item.key !== CONST.SEARCH.SEARCH_KEYS.EXPENSES);
    const reportsRoot = reports.find((item) => item.key === CONST.SEARCH.SEARCH_KEYS.REPORTS);
    const reportsChildren = reports.filter((item) => item.key !== CONST.SEARCH.SEARCH_KEYS.REPORTS);

    // A collapsed bar hides every group's children, so a selected group is only expanded while the bar is open.
    const isExpensesGroupExpanded = isExpensesGroupSelected && !isVisuallyCollapsed && expensesChildren.length > 0;
    const isReportsGroupExpanded = isReportsGroupSelected && !isVisuallyCollapsed && reportsChildren.length > 0;
    const isAccountingGroupExpanded = isAccountingGroupSelected && !isVisuallyCollapsed;
    const isSavedGroupExpanded = isSavedGroupSelected && !isVisuallyCollapsed;
    const hasSavedSearches = Object.keys(savedSearches ?? {}).length > 0;

    const navigateToSearchItem = singleExecution((item: SearchTypeMenuItem) => {
        clearSelectedText();
        interceptAnonymousUser(() => {
            navigateToCannedSpendSearch(item.key, item.searchQuery, getLastSearchQuery(searchFilters, item.key), clearSelectedTransactions);
        }, session);
    });

    // A group row stands in for its children while they are hidden, so it carries their combined count. Once they
    // show their own counts, repeating the total on the parent would double-report it.
    const countsBySearchKey: Record<string, number> = reportCounts;
    const getGroupBadgeText = (items: SearchTypeMenuItem[], isExpanded: boolean) =>
        isExpanded ? undefined : formatBadgeText(items.reduce((total, item) => total + (countsBySearchKey[item.key] ?? 0), 0));

    // A parent row that is a search in its own right keeps only its own count once its children are showing theirs.
    const getParentBadgeText = (items: SearchTypeMenuItem[], rootItem: SearchTypeMenuItem | undefined, isExpanded: boolean) =>
        isExpanded && rootItem ? getItemBadgeText(rootItem.key, reportCounts) : getGroupBadgeText(items, isExpanded && !rootItem);

    const hasGroupBadge = (items: SearchTypeMenuItem[]) => !!getGroupBadgeText(items, false);

    const renderSearchItem = (item: SearchTypeMenuItem, index: number, total: number) => (
        <FlatNavItem
            key={item.key}
            isCollapsed={isVisuallyCollapsed}
            label={translate(getGroupedSearchTranslationPath(item.key, item.translationPath))}
            isSelected={isSpendTabSelected && currentSearchKey === item.key}
            isSubItem
            isFirstSubItem={index === 0}
            isLastSubItem={index === total - 1}
            badgeText={getItemBadgeText(item.key, reportCounts)}
            sentryLabel={getSearchTypeMenuItemSentryLabel(item.key)}
            onPress={() => navigateToSearchItem(item)}
        />
    );

    // Opening the group navigates to a saved search so its children can render; the first one by key order is the
    // cheapest choice here, since ordering the list by title needs the Onyx data FlatNavSavedSearches loads.
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
        }, session);
    };

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

    // The Spend row gets no hover out when the bar goes away while hovered, on a switch to the narrow layout or an unmount.
    useEffect(() => () => setIsSearchTabHovered(false), []);

    // A peek has no hover out to end it when the bar goes away while hovered, on a switch to the narrow layout or an unmount.
    useEffect(() => endPeek, [endPeek]);

    const {isCreateMenuActive, isCreateMenuVisible, showCreateMenu, hideCreateMenu} = useCreateMenuVisibility();
    const {isSupportAgent, isSwitcherVisible: isSupportalSwitcherVisible, showSwitcher: showSupportalSwitcher, hideSwitcher: hideSupportalSwitcher} = useSupportalSwitcherVisibility();
    // A popover the bar opened holds the peek: its overlay ends the hover without the pointer ever leaving the bar.
    const isBarPopoverVisible = isCreateMenuVisible || isSupportalSwitcherVisible;
    const barContainerRef = useRef<ComponentRef<typeof View>>(null);

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
        if (isBarPopoverVisible || isHovered || hasKeyboardFocusInside()) {
            return;
        }
        endPeek();
    };

    const endPeekIfIdle = () => {
        if (isBarPopoverVisible || hasKeyboardFocusInside()) {
            return;
        }
        endPeek();
    };

    const endPeekUnlessStaying = (event: NativeSyntheticEvent<TargetedEvent>) => {
        if (isBarPopoverVisible) {
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
                                            linkRoute={ROUTES.INBOX}
                                        />
                                        <FlatNavDivider />
                                        {expenses.length > 0 && (
                                            <>
                                                <FlatNavItem
                                                    isCollapsed={isVisuallyCollapsed}
                                                    label={translate('search.tabs.expenses')}
                                                    icon={icons.Receipt}
                                                    isSelected={isSpendTabSelected && currentSearchKey === CONST.SEARCH.SEARCH_KEYS.EXPENSES}
                                                    badgeText={getParentBadgeText(expenses, expensesRoot, isExpensesGroupExpanded)}
                                                    hasCollapsedStatusIndicator={hasGroupBadge(expenses)}
                                                    sentryLabel={CONST.SENTRY_LABEL.NAVIGATION_TAB_BAR.EXPENSES}
                                                    onPress={() => (expensesRoot ? navigateToSearchItem(expensesRoot) : navigateToSearch())}
                                                    linkRoute={spendLinkRoute}
                                                    onHoverIn={() => setIsSearchTabHovered(true)}
                                                    onHoverOut={() => setIsSearchTabHovered(false)}
                                                />
                                                {isExpensesGroupSelected && expensesChildren.length > 0 && (
                                                    <FlatNavSubItemList
                                                        isExpanded={isExpensesGroupExpanded}
                                                        selectedIndex={expensesChildren.findIndex((item) => item.key === currentSearchKey)}
                                                    >
                                                        {expensesChildren.map((item, index) => renderSearchItem(item, index, expensesChildren.length))}
                                                    </FlatNavSubItemList>
                                                )}
                                            </>
                                        )}
                                        {reports.length > 0 && (
                                            <>
                                                <FlatNavItem
                                                    isCollapsed={isVisuallyCollapsed}
                                                    label={translate('common.reports')}
                                                    icon={icons.Document}
                                                    isSelected={isSpendTabSelected && currentSearchKey === CONST.SEARCH.SEARCH_KEYS.REPORTS}
                                                    badgeText={getParentBadgeText(reports, reportsRoot, isReportsGroupExpanded)}
                                                    hasCollapsedStatusIndicator={hasGroupBadge(reports)}
                                                    sentryLabel={CONST.SENTRY_LABEL.NAVIGATION_TAB_BAR.REPORTS}
                                                    onPress={() => (reportsRoot ? navigateToSearchItem(reportsRoot) : navigateToSearch())}
                                                />
                                                {isReportsGroupSelected && reportsChildren.length > 0 && (
                                                    <FlatNavSubItemList
                                                        isExpanded={isReportsGroupExpanded}
                                                        selectedIndex={reportsChildren.findIndex((item) => item.key === currentSearchKey)}
                                                    >
                                                        {reportsChildren.map((item, index) => renderSearchItem(item, index, reportsChildren.length))}
                                                    </FlatNavSubItemList>
                                                )}
                                            </>
                                        )}
                                        {accounting.length > 0 && (
                                            <>
                                                <FlatNavItem
                                                    isCollapsed={isVisuallyCollapsed}
                                                    label={translate('search.tabs.accounting')}
                                                    icon={icons.Connect}
                                                    isSelected={isAccountingGroupSelected}
                                                    badgeText={getGroupBadgeText(accounting, isAccountingGroupExpanded)}
                                                    hasCollapsedStatusIndicator={hasGroupBadge(accounting)}
                                                    sentryLabel={CONST.SENTRY_LABEL.NAVIGATION_TAB_BAR.MORE_MENU.ACCOUNTING}
                                                    onPress={() => {
                                                        const firstAccounting = accounting.at(0);
                                                        if (!firstAccounting) {
                                                            navigateToSearch();
                                                            return;
                                                        }
                                                        navigateToSearchItem(firstAccounting);
                                                    }}
                                                />
                                                {isAccountingGroupSelected && (
                                                    <FlatNavSubItemList
                                                        isExpanded={isAccountingGroupExpanded}
                                                        selectedIndex={accounting.findIndex((item) => item.key === currentSearchKey)}
                                                    >
                                                        {accounting.map((item, index) => renderSearchItem(item, index, accounting.length))}
                                                    </FlatNavSubItemList>
                                                )}
                                            </>
                                        )}
                                        <FlatNavItem
                                            isCollapsed={isVisuallyCollapsed}
                                            label={translate('common.insights')}
                                            icon={icons.PieChart}
                                            isSelected={selectedTab === NAVIGATION_TABS.INSIGHTS}
                                            sentryLabel={CONST.SENTRY_LABEL.NAVIGATION_TAB_BAR.INSIGHTS}
                                            onPress={navigateToInsights}
                                            linkRoute={getSignedInLinkRoute(DEFAULT_INSIGHTS_TAB_ROUTE)}
                                        />
                                        {hasSavedSearches && (
                                            <>
                                                <FlatNavItem
                                                    isCollapsed={isVisuallyCollapsed}
                                                    label={translate('search.savedSearchesMenuItemTitle')}
                                                    icon={icons.Bookmark}
                                                    isSelected={isSavedGroupSelected}
                                                    sentryLabel={CONST.SENTRY_LABEL.NAVIGATION_TAB_BAR.MORE_MENU.SAVED}
                                                    onPress={navigateToFirstSavedSearch}
                                                />
                                                {isSavedGroupSelected && <FlatNavSavedSearches isExpanded={isSavedGroupExpanded} />}
                                            </>
                                        )}
                                        {shouldShowExtraNavItems &&
                                            PLACEHOLDER_DESTINATIONS.map(({label, iconName}) => (
                                                <FlatNavItem
                                                    key={label}
                                                    isCollapsed={isVisuallyCollapsed}
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
        </>
    );
}

export default FlatNavigationBar;
