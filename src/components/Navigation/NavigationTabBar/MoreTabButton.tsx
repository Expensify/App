import useFlatNavSpendItems from '@components/Navigation/FlatNavigationBar/useFlatNavSpendItems';
import {PressableWithFeedback} from '@components/Pressable';
import {useSearchQueryContext, useSearchSelectionActions} from '@components/Search/SearchContext';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useRestoreWorkspacesTabOnNavigate from '@hooks/useRestoreWorkspacesTabOnNavigate';
import useThemeStyles from '@hooks/useThemeStyles';
import useWorkspacesTabIndicatorStatus from '@hooks/useWorkspacesTabIndicatorStatus';

import {setSearchContext} from '@libs/actions/Search';
import clearSelectedText from '@libs/clearSelectedText/clearSelectedText';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import {clearLastVisitedMoreDestination, getLastVisitedInsightsDashboard, getLastVisitedMoreDestination, getLastVisitedSearchKey, MORE_DESTINATIONS} from '@libs/MoreDestinationHistory';
import Navigation from '@libs/Navigation/Navigation';
import {savedSearchIDToSearchKey, searchKeyToSavedSearchID} from '@libs/SearchKeyUtils';
import type {SearchKey} from '@libs/SearchKeyUtils';
import navigateToCannedSpendSearch from '@libs/SearchNavigationUtils';
import {getValidLastQuery} from '@libs/SearchQueryUtils';
import {getLastSearchQuery} from '@libs/SearchUIUtils';
import {ACCOUNTING_GROUP_ID, ACCOUNTING_KEYS, SAVED_SEARCHES_GROUP_ID} from '@libs/SpendNavigationGroups';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

import type {ValueOf} from 'type-fest';

import React from 'react';

import NAVIGATION_TABS from './NAVIGATION_TABS';
import TabBarItem from './TabBarItem';

type MoreTabButtonProps = {
    selectedTab: ValueOf<typeof NAVIGATION_TABS>;
};

/**
 * Bottom-bar tab for the destinations that don't fit across five slots. It opens the More page, unless the user has
 * already been into one of its destinations this session - then it drops them back where they left off.
 */
function MoreTabButton({selectedTab}: MoreTabButtonProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['ThreeDots']);

    const {currentSearchKey} = useSearchQueryContext();
    const {accounting} = useFlatNavSpendItems();
    const {clearSelectedTransactions} = useSearchSelectionActions();
    const [searchFilters] = useOnyx(ONYXKEYS.SEARCH_FILTERS);
    const [savedSearches] = useOnyx(ONYXKEYS.SAVED_SEARCHES);
    const {indicatorColor: workspacesIndicatorColor, status: workspacesIndicatorStatus} = useWorkspacesTabIndicatorStatus();
    const navigateToWorkspaces = useRestoreWorkspacesTabOnNavigate();

    const isOnMorePage = selectedTab === NAVIGATION_TABS.MORE;
    // The tab stands for everything behind it, so it stays lit while the user is inside one of its destinations.
    const isInMoreDestination =
        (selectedTab === NAVIGATION_TABS.SEARCH && (ACCOUNTING_KEYS.some((key) => key === currentSearchKey) || !!searchKeyToSavedSearchID(currentSearchKey))) ||
        selectedTab === NAVIGATION_TABS.INSIGHTS ||
        selectedTab === NAVIGATION_TABS.WORKSPACES;
    const isSelected = isOnMorePage || isInMoreDestination;

    // Everything below is resolved on press. The history is plain module state, so values read during render would be
    // memoized on the first render and never see later visits.
    const openLastAccountingSearch = () => {
        const lastKey = getLastVisitedSearchKey(ACCOUNTING_GROUP_ID);
        const item = accounting.find((search) => search.key === lastKey) ?? accounting.at(0);
        if (!item) {
            return false;
        }
        clearSelectedText();
        interceptAnonymousUser(() => {
            navigateToCannedSpendSearch(item.key, item.searchQuery, getLastSearchQuery(searchFilters, item.key), clearSelectedTransactions);
        });
        return true;
    };

    const openLastSavedSearch = () => {
        const entries = Object.entries(savedSearches ?? {});
        const lastKey = getLastVisitedSearchKey(SAVED_SEARCHES_GROUP_ID);
        const entry = entries.find(([id]) => savedSearchIDToSearchKey(id) === lastKey) ?? entries.at(0);
        if (!entry) {
            return false;
        }
        const [savedSearchID, savedSearch] = entry;
        const searchKey: SearchKey = savedSearchIDToSearchKey(savedSearchID);
        const query = getValidLastQuery(getLastSearchQuery(searchFilters, searchKey), savedSearch.query);
        clearSelectedText();
        interceptAnonymousUser(() => {
            setSearchContext(false);
            Navigation.navigate(ROUTES.SEARCH_ROOT.getRoute({query, name: savedSearch.name, searchKey}));
        });
        return true;
    };

    const openLastInsightsDashboard = () => {
        clearSelectedText();
        interceptAnonymousUser(() => {
            Navigation.navigate(ROUTES.INSIGHTS.getRoute(getLastVisitedInsightsDashboard() ?? CONST.INSIGHTS.DASHBOARD.SPEND));
        });
        return true;
    };

    const navigateToMore = () => {
        // Tapping the tab while already inside More climbs back to its top level.
        if (isInMoreDestination) {
            clearLastVisitedMoreDestination();
            interceptAnonymousUser(() => {
                Navigation.navigate(ROUTES.MORE);
            });
            return;
        }

        if (isOnMorePage) {
            return;
        }

        // Fall through to the More page whenever the remembered destination can no longer be opened, for example
        // after its last saved search was deleted.
        switch (getLastVisitedMoreDestination()) {
            case MORE_DESTINATIONS.ACCOUNTING:
                if (openLastAccountingSearch()) {
                    return;
                }
                break;
            case MORE_DESTINATIONS.SAVED_SEARCHES:
                if (openLastSavedSearch()) {
                    return;
                }
                break;
            case MORE_DESTINATIONS.INSIGHTS:
                openLastInsightsDashboard();
                return;
            case MORE_DESTINATIONS.WORKSPACES:
                navigateToWorkspaces();
                return;
            default:
                break;
        }

        interceptAnonymousUser(() => {
            Navigation.navigate(ROUTES.MORE);
        });
    };

    return (
        <PressableWithFeedback
            onPress={navigateToMore}
            role={CONST.ROLE.TAB}
            accessibilityLabel={translate('common.more')}
            accessibilityState={{selected: isSelected}}
            sentryLabel={CONST.SENTRY_LABEL.NAVIGATION_TAB_BAR.MORE}
            wrapperStyle={styles.flex1}
            style={styles.navigationTabBarItem}
        >
            <TabBarItem
                icon={icons.ThreeDots}
                label={translate('common.more')}
                isSelected={isSelected}
                // Workspaces lives behind this tab, so its attention dot has to surface here.
                statusIndicatorColor={workspacesIndicatorStatus ? workspacesIndicatorColor : undefined}
                numberOfLines={1}
            />
        </PressableWithFeedback>
    );
}

export default MoreTabButton;
