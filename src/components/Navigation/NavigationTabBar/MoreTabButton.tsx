import useFlatNavSpendItems from '@components/Navigation/FlatNavigationBar/useFlatNavSpendItems';
import type {PopoverMenuItem} from '@components/PopoverMenu';
import PopoverMenu from '@components/PopoverMenu';
import {PressableWithFeedback} from '@components/Pressable';
import {useSearchQueryContext, useSearchSelectionActions} from '@components/Search/SearchContext';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import usePopoverPosition from '@hooks/usePopoverPosition';
import useRestoreWorkspacesTabOnNavigate from '@hooks/useRestoreWorkspacesTabOnNavigate';
import useThemeStyles from '@hooks/useThemeStyles';
import useWorkspacesTabIndicatorStatus from '@hooks/useWorkspacesTabIndicatorStatus';

import {setSearchContext} from '@libs/actions/Search';
import clearSelectedText from '@libs/clearSelectedText/clearSelectedText';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import {getLastVisitedInsightsDashboard, getLastVisitedSearchKey} from '@libs/MoreDestinationHistory';
import Navigation from '@libs/Navigation/Navigation';
import {savedSearchIDToSearchKey, searchKeyToSavedSearchID} from '@libs/SearchKeyUtils';
import type {SearchKey} from '@libs/SearchKeyUtils';
import navigateToCannedSpendSearch from '@libs/SearchNavigationUtils';
import {getValidLastQuery} from '@libs/SearchQueryUtils';
import type {SearchTypeMenuItem} from '@libs/SearchUIUtils';
import {getLastSearchQuery} from '@libs/SearchUIUtils';
import {ACCOUNTING_KEYS, getSpendGroupTranslationPath, SAVED_SEARCHES_GROUP_ID} from '@libs/SpendNavigationGroups';

import type {AnchorPosition} from '@styles/index';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

import type {View} from 'react-native';
import type {ValueOf} from 'type-fest';

import React, {useRef, useState} from 'react';

import NAVIGATION_TABS from './NAVIGATION_TABS';
import TabBarItem from './TabBarItem';

const ANCHOR_ALIGNMENT = {
    horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT,
    vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM,
};

const ACCOUNTING_GROUP_ID = getSpendGroupTranslationPath(CONST.SEARCH.SEARCH_KEYS.EXPORT);

type MoreTabButtonProps = {
    selectedTab: ValueOf<typeof NAVIGATION_TABS>;
};

/**
 * Bottom-bar tab holding the destinations that don't fit across five slots. Tapping it opens a menu, which
 * PopoverMenu docks to the bottom of the screen on small screens. Each row returns the user to where they last
 * were inside that destination rather than to its first page.
 */
function MoreTabButton({selectedTab}: MoreTabButtonProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {isBetaEnabled} = usePermissions();
    const icons = useMemoizedLazyExpensifyIcons(['ThreeDots', 'Connect', 'Bookmark', 'PieChart', 'Buildings']);

    const anchorRef = useRef<View>(null);
    const [isMenuVisible, setIsMenuVisible] = useState(false);
    // PopoverMenu docks to the bottom on small screens but still requires an anchor, so measure the tab before opening.
    const [popoverPosition, setPopoverPosition] = useState<AnchorPosition>();
    const {calculatePopoverPosition} = usePopoverPosition();

    const {currentSearchKey} = useSearchQueryContext();
    const {clearSelectedTransactions} = useSearchSelectionActions();
    const {accounting} = useFlatNavSpendItems();
    const [searchFilters] = useOnyx(ONYXKEYS.SEARCH_FILTERS);
    const [savedSearches] = useOnyx(ONYXKEYS.SAVED_SEARCHES);
    const {indicatorColor: workspacesIndicatorColor, status: workspacesIndicatorStatus} = useWorkspacesTabIndicatorStatus();
    const navigateToWorkspaces = useRestoreWorkspacesTabOnNavigate();

    const isAccountingSelected = selectedTab === NAVIGATION_TABS.SEARCH && ACCOUNTING_KEYS.some((key) => key === currentSearchKey);
    const isSavedSelected = selectedTab === NAVIGATION_TABS.SEARCH && !!searchKeyToSavedSearchID(currentSearchKey);
    const isSelected = isAccountingSelected || isSavedSelected || selectedTab === NAVIGATION_TABS.INSIGHTS || selectedTab === NAVIGATION_TABS.WORKSPACES;

    const openSpendSearch = (item: SearchTypeMenuItem) => {
        clearSelectedText();
        interceptAnonymousUser(() => {
            navigateToCannedSpendSearch(item.key, item.searchQuery, getLastSearchQuery(searchFilters, item.key), clearSelectedTransactions);
        });
    };

    const menuItems: PopoverMenuItem[] = [];
    const savedSearchEntries = Object.entries(savedSearches ?? {});

    if (accounting.length > 0) {
        menuItems.push({
            text: translate('search.tabs.accounting'),
            icon: icons.Connect,
            onSelected: () => {
                // Resolved on press: the history is plain module state, so a value read during render would be
                // memoized on first render and never see later visits.
                const lastKey = ACCOUNTING_GROUP_ID ? getLastVisitedSearchKey(ACCOUNTING_GROUP_ID) : undefined;
                const item = accounting.find((search) => search.key === lastKey) ?? accounting.at(0);
                if (!item) {
                    return;
                }
                openSpendSearch(item);
            },
        });
    }

    if (savedSearchEntries.length > 0) {
        menuItems.push({
            text: translate('search.savedSearchesMenuItemTitle'),
            icon: icons.Bookmark,
            onSelected: () => {
                const lastKey = getLastVisitedSearchKey(SAVED_SEARCHES_GROUP_ID);
                const entry = savedSearchEntries.find(([id]) => savedSearchIDToSearchKey(id) === lastKey) ?? savedSearchEntries.at(0);
                if (!entry) {
                    return;
                }
                const [savedSearchID, savedSearch] = entry;
                const searchKey: SearchKey = savedSearchIDToSearchKey(savedSearchID);
                const query = getValidLastQuery(getLastSearchQuery(searchFilters, searchKey), savedSearch.query);
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
            text: translate('common.insights'),
            icon: icons.PieChart,
            onSelected: () => {
                clearSelectedText();
                interceptAnonymousUser(() => {
                    Navigation.navigate(ROUTES.INSIGHTS.getRoute(getLastVisitedInsightsDashboard() ?? CONST.INSIGHTS.DASHBOARD.SPEND));
                });
            },
        });
    }

    menuItems.push({
        text: translate('common.workspacesTabTitle'),
        icon: icons.Buildings,
        // This hook already restores the last workspace or domain the user had open.
        onSelected: navigateToWorkspaces,
    });

    return (
        <>
            <PressableWithFeedback
                ref={anchorRef}
                onPress={() => {
                    calculatePopoverPosition(anchorRef, ANCHOR_ALIGNMENT).then((position) => {
                        setPopoverPosition(position);
                        setIsMenuVisible(true);
                    });
                }}
                role={CONST.ROLE.BUTTON}
                accessibilityLabel={translate('common.more')}
                accessibilityState={{expanded: isMenuVisible}}
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
            <PopoverMenu
                isVisible={isMenuVisible}
                onClose={() => setIsMenuVisible(false)}
                onItemSelected={() => setIsMenuVisible(false)}
                anchorRef={anchorRef}
                anchorPosition={popoverPosition ?? {horizontal: 0, vertical: 0}}
                anchorAlignment={ANCHOR_ALIGNMENT}
                menuItems={menuItems}
                headerText={translate('common.more')}
                headerStyles={styles.pt1}
                shouldUseScrollView
                enableEdgeToEdgeBottomSafeAreaPadding
            />
        </>
    );
}

export default MoreTabButton;
