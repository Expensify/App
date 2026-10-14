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
import useHasTabBeenShown from '@hooks/useHasTabBeenShown';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import useRestoreWorkspacesTabOnNavigate from '@hooks/useRestoreWorkspacesTabOnNavigate';
import useThemeStyles from '@hooks/useThemeStyles';
import useWorkspacesTabIndicatorStatus from '@hooks/useWorkspacesTabIndicatorStatus';

import {MORE_DESTINATIONS, setLastVisitedMoreDestination} from '@libs/MoreDestinationHistory';
import type {MoreDestination} from '@libs/MoreDestinationHistory';
import {openFirstSavedSearch, openLastInsightsDashboard, openSearchMenuItem, reopenLastVisitedSearch} from '@libs/MoreNavigationUtils';
import {ACCOUNTING_GROUP_ID, INSIGHTS_GROUP_ID, SAVED_SEARCHES_GROUP_ID} from '@libs/SpendNavigationGroups';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';

import {useIsFocused} from '@react-navigation/native';
import React from 'react';
import {View} from 'react-native';

/**
 * The More page's rows. Each row records itself, and resolves where inside that destination the user last was, when it
 * is pressed. The history is plain module state, so a value read during render would be memoized on the first render
 * and never see later visits.
 */
function MoreMenu() {
    const styles = useThemeStyles();
    const {translate, localeCompare} = useLocalize();
    const {isBetaEnabled} = usePermissions();
    const illustrations = useMemoizedLazyIllustrations(['Accounting', 'MagnifyingGlassReceipt', 'Chart', 'Building']);

    // Native tabs stay mounted in the background, so the approval watch behind the item list only runs while this is shown.
    const isFocused = useIsFocused();
    const {accounting, insights} = useFlatNavSpendItems(isFocused);
    const isInsightsPageEnabled = isBetaEnabled(CONST.BETAS.INSIGHTS_PAGE);
    const {clearSelectedTransactions} = useSearchSelectionActions();
    const [searchFilters] = useOnyx(ONYXKEYS.SEARCH_FILTERS);
    const [savedSearches] = useOnyx(ONYXKEYS.SAVED_SEARCHES);
    const {status: workspacesIndicatorStatus, isError: isWorkspacesIndicatorError} = useWorkspacesTabIndicatorStatus();
    const navigateToWorkspaces = useRestoreWorkspacesTabOnNavigate();

    // The hook reports a broader set of statuses than a menu row can show, so the row only carries their severity.
    let workspacesBrickRoadIndicator;
    if (workspacesIndicatorStatus) {
        workspacesBrickRoadIndicator = isWorkspacesIndicatorError ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : CONST.BRICK_ROAD_INDICATOR_STATUS.INFO;
    }

    // The rows read as a set of choices rather than a sidebar, so they take the card treatment the workspace "New rule"
    // flow uses: a filled card, a full-color illustration, and a chevron.
    const cardProps = {
        shouldShowRightIcon: true,
        displayInDefaultIconColor: true,
        iconWidth: variables.iconSizeExtraLarge,
        iconHeight: variables.iconSizeExtraLarge,
    };

    const openDestination = (destination: MoreDestination, groupID: string, openFirst: () => void) => {
        setLastVisitedMoreDestination(destination);
        if (!reopenLastVisitedSearch(groupID, savedSearches, clearSelectedTransactions)) {
            openFirst();
        }
    };

    const menuItems: MenuItemWithLink[] = [
        {
            key: 'workspaces',
            ...cardProps,
            title: translate('common.workspacesTabTitle'),
            description: translate('morePage.workspacesDescription'),
            icon: illustrations.Building,
            brickRoadIndicator: workspacesBrickRoadIndicator,
            onPress: () => {
                setLastVisitedMoreDestination(MORE_DESTINATIONS.WORKSPACES);
                // This hook already restores the last workspace or domain the user had open.
                navigateToWorkspaces();
            },
        },
    ];

    if (accounting.length > 0) {
        menuItems.push({
            key: 'accounting',
            ...cardProps,
            title: translate('search.tabs.accounting'),
            description: translate('morePage.accountingDescription'),
            icon: illustrations.Accounting,
            onPress: () => openDestination(MORE_DESTINATIONS.ACCOUNTING, ACCOUNTING_GROUP_ID, () => openSearchMenuItem(accounting.at(0), searchFilters, clearSelectedTransactions)),
        });
    }

    if (Object.keys(savedSearches ?? {}).length > 0) {
        menuItems.push({
            key: 'savedSearches',
            ...cardProps,
            title: translate('search.savedSearchesMenuItemTitle'),
            description: translate('morePage.savedSearchesDescription'),
            icon: illustrations.MagnifyingGlassReceipt,
            onPress: () => openDestination(MORE_DESTINATIONS.SAVED_SEARCHES, SAVED_SEARCHES_GROUP_ID, () => openFirstSavedSearch(savedSearches, searchFilters, localeCompare)),
        });
    }

    // Without the Insights page, its charts are still reachable as searches, so the row opens those instead.
    if (isInsightsPageEnabled || insights.length > 0) {
        menuItems.push({
            key: 'insights',
            ...cardProps,
            title: translate('common.insights'),
            description: translate('morePage.insightsDescription'),
            icon: illustrations.Chart,
            onPress: () => {
                if (isInsightsPageEnabled) {
                    setLastVisitedMoreDestination(MORE_DESTINATIONS.INSIGHTS);
                    openLastInsightsDashboard();
                    return;
                }
                openDestination(MORE_DESTINATIONS.INSIGHTS, INSIGHTS_GROUP_ID, () => openSearchMenuItem(insights.at(0), searchFilters, clearSelectedTransactions));
            },
        });
    }

    return (
        <MenuItemList
            menuItems={menuItems}
            wrapperStyle={styles.moreMenuCard}
            shouldUseSingleExecution
        />
    );
}

/**
 * Destinations that don't fit across the narrow tab bar's five slots. Rendered as a page rather than a menu so the
 * rows match the left navigation's rows on wide layouts.
 */
function MorePage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    // Native tabs mount at startup. The menu works out which destinations a user has from policies and reports, so it
    // waits until the tab is first opened, while the page around it is already there for the native bar to show.
    const hasMoreBeenShown = useHasTabBeenShown(SCREENS.MORE);

    useDocumentTitle(translate('common.more'));

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
                <View style={[styles.mh3, styles.mt3, styles.pb4]}>{hasMoreBeenShown && <MoreMenu />}</View>
            </ScrollView>
        </ScreenWrapper>
    );
}

export default MorePage;
