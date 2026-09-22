import MenuItemList from '@components/MenuItemList';
import type {MenuItemWithLink} from '@components/MenuItemList';
import useFlatNavSpendItems from '@components/Navigation/FlatNavigationBar/useFlatNavSpendItems';
import NAVIGATION_TABS from '@components/Navigation/NavigationTabBar/NAVIGATION_TABS';
import TabBarBottomContent from '@components/Navigation/TabBarBottomContent';
import TopBar from '@components/Navigation/TopBar';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import {useSearchSelectionActions} from '@components/Search/SearchContext';

import useDocumentTitle from '@hooks/useDocumentTitle';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useRestoreWorkspacesTabOnNavigate from '@hooks/useRestoreWorkspacesTabOnNavigate';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWorkspacesTabIndicatorStatus from '@hooks/useWorkspacesTabIndicatorStatus';

import {setSearchContext} from '@libs/actions/Search';
import clearSelectedText from '@libs/clearSelectedText/clearSelectedText';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import {getLastVisitedInsightsDashboard, getLastVisitedSearchKey, MORE_DESTINATIONS, setLastVisitedMoreDestination} from '@libs/MoreDestinationHistory';
import Navigation from '@libs/Navigation/Navigation';
import {savedSearchIDToSearchKey} from '@libs/SearchKeyUtils';
import type {SearchKey} from '@libs/SearchKeyUtils';
import navigateToCannedSpendSearch from '@libs/SearchNavigationUtils';
import {getValidLastQuery} from '@libs/SearchQueryUtils';
import {getLastSearchQuery} from '@libs/SearchUIUtils';
import {ACCOUNTING_GROUP_ID, SAVED_SEARCHES_GROUP_ID} from '@libs/SpendNavigationGroups';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

import React from 'react';
import {View} from 'react-native';

/**
 * Destinations that don't fit across the narrow tab bar's five slots. Rendered as a page rather than a menu so the
 * rows match the left navigation's rows on wide layouts.
 *
 * Each row records itself, and resolves where inside that destination the user last was, when it is pressed. The
 * history is plain module state, so a value read during render would be memoized on the first render and never see
 * later visits.
 */
function MorePage() {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {isBetaEnabled} = usePermissions();
    const icons = useMemoizedLazyExpensifyIcons(['Connect', 'Bookmark', 'PieChart', 'Buildings']);

    useDocumentTitle(translate('common.more'));

    const {accounting} = useFlatNavSpendItems();
    const {clearSelectedTransactions} = useSearchSelectionActions();
    const [searchFilters] = useOnyx(ONYXKEYS.SEARCH_FILTERS);
    const [savedSearches] = useOnyx(ONYXKEYS.SAVED_SEARCHES);
    const {indicatorColor: workspacesIndicatorColor, status: workspacesIndicatorStatus} = useWorkspacesTabIndicatorStatus();
    const navigateToWorkspaces = useRestoreWorkspacesTabOnNavigate();

    // The hook reports a broader set of statuses than a menu row can show, and encodes severity in the color it picks.
    let workspacesBrickRoadIndicator;
    if (workspacesIndicatorStatus) {
        workspacesBrickRoadIndicator = workspacesIndicatorColor === theme.danger ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : CONST.BRICK_ROAD_INDICATOR_STATUS.INFO;
    }

    const savedSearchEntries = Object.entries(savedSearches ?? {});
    const menuItems: MenuItemWithLink[] = [];

    if (accounting.length > 0) {
        menuItems.push({
            key: 'accounting',
            shouldUseNavigationRowStyles: true,
            title: translate('search.tabs.accounting'),
            icon: icons.Connect,
            onPress: () => {
                const lastKey = getLastVisitedSearchKey(ACCOUNTING_GROUP_ID);
                const item = accounting.find((search) => search.key === lastKey) ?? accounting.at(0);
                if (!item) {
                    return;
                }
                setLastVisitedMoreDestination(MORE_DESTINATIONS.ACCOUNTING);
                clearSelectedText();
                interceptAnonymousUser(() => {
                    navigateToCannedSpendSearch(item.key, item.searchQuery, getLastSearchQuery(searchFilters, item.key), clearSelectedTransactions);
                });
            },
        });
    }

    if (savedSearchEntries.length > 0) {
        menuItems.push({
            key: 'savedSearches',
            shouldUseNavigationRowStyles: true,
            title: translate('search.savedSearchesMenuItemTitle'),
            icon: icons.Bookmark,
            onPress: () => {
                const lastKey = getLastVisitedSearchKey(SAVED_SEARCHES_GROUP_ID);
                const entry = savedSearchEntries.find(([id]) => savedSearchIDToSearchKey(id) === lastKey) ?? savedSearchEntries.at(0);
                if (!entry) {
                    return;
                }
                const [savedSearchID, savedSearch] = entry;
                const searchKey: SearchKey = savedSearchIDToSearchKey(savedSearchID);
                const query = getValidLastQuery(getLastSearchQuery(searchFilters, searchKey), savedSearch.query);
                setLastVisitedMoreDestination(MORE_DESTINATIONS.SAVED_SEARCHES);
                clearSelectedText();
                interceptAnonymousUser(() => {
                    setSearchContext(false);
                    Navigation.navigate(ROUTES.SEARCH_ROOT.getRoute({query, name: savedSearch.name, searchKey}));
                });
            },
        });
    }

    if (isBetaEnabled(CONST.BETAS.INSIGHTS_PAGE)) {
        menuItems.push({
            key: 'insights',
            shouldUseNavigationRowStyles: true,
            title: translate('common.insights'),
            icon: icons.PieChart,
            onPress: () => {
                setLastVisitedMoreDestination(MORE_DESTINATIONS.INSIGHTS);
                clearSelectedText();
                interceptAnonymousUser(() => {
                    Navigation.navigate(ROUTES.INSIGHTS.getRoute(getLastVisitedInsightsDashboard() ?? CONST.INSIGHTS.DASHBOARD.SPEND));
                });
            },
        });
    }

    menuItems.push({
        key: 'workspaces',
        shouldUseNavigationRowStyles: true,
        title: translate('common.workspacesTabTitle'),
        icon: icons.Buildings,
        brickRoadIndicator: workspacesBrickRoadIndicator,
        onPress: () => {
            setLastVisitedMoreDestination(MORE_DESTINATIONS.WORKSPACES);
            // This hook already restores the last workspace or domain the user had open.
            navigateToWorkspaces();
        },
    });

    return (
        <ScreenWrapper
            shouldShowOfflineIndicatorInWideScreen
            enableEdgeToEdgeBottomSafeAreaPadding={false}
            bottomContent={<TabBarBottomContent selectedTab={NAVIGATION_TABS.MORE} />}
            testID="MorePage"
        >
            <TopBar
                breadcrumbLabel={translate('common.more')}
                shouldDisplayHelpButton
            />
            <ScrollView addBottomSafeAreaPadding>
                {/* The horizontal inset belongs to the list, not the rows: on the row it shifts them right without
                    narrowing them, so they run past the screen edge. This matches the Workspace and Account menus. */}
                <View style={[styles.mh3, styles.mt3, styles.pb4]}>
                    <MenuItemList
                        menuItems={menuItems}
                        wrapperStyle={styles.sectionMenuItem(shouldUseNarrowLayout)}
                        shouldUseSingleExecution
                    />
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
}

export default MorePage;
