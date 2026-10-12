import {PressableWithFeedback} from '@components/Pressable';
import {useSearchQueryContext, useSearchSelectionActions} from '@components/Search/SearchContext';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import useRestoreWorkspacesTabOnNavigate from '@hooks/useRestoreWorkspacesTabOnNavigate';
import useThemeStyles from '@hooks/useThemeStyles';
import useWorkspacesTabIndicatorStatus from '@hooks/useWorkspacesTabIndicatorStatus';

import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import {clearLastVisitedMoreDestination, getLastVisitedMoreDestination, MORE_DESTINATIONS} from '@libs/MoreDestinationHistory';
import {openLastInsightsDashboard, reopenLastVisitedSearch} from '@libs/MoreNavigationUtils';
import Navigation from '@libs/Navigation/Navigation';
import {searchKeyToSavedSearchID} from '@libs/SearchKeyUtils';
import {ACCOUNTING_GROUP_ID, ACCOUNTING_KEYS, INSIGHTS_GROUP_ID, INSIGHTS_KEYS, SAVED_SEARCHES_GROUP_ID} from '@libs/SpendNavigationGroups';

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
    const {clearSelectedTransactions} = useSearchSelectionActions();
    const {isBetaEnabled} = usePermissions();
    const [savedSearches] = useOnyx(ONYXKEYS.SAVED_SEARCHES);
    const {indicatorColor: workspacesIndicatorColor, status: workspacesIndicatorStatus} = useWorkspacesTabIndicatorStatus();
    const navigateToWorkspaces = useRestoreWorkspacesTabOnNavigate();

    const isOnMorePage = selectedTab === NAVIGATION_TABS.MORE;
    // The tab stands for everything behind it, so it stays lit while the user is inside one of its destinations.
    const isInMoreDestination =
        (selectedTab === NAVIGATION_TABS.SEARCH && ([...ACCOUNTING_KEYS, ...INSIGHTS_KEYS].some((key) => key === currentSearchKey) || !!searchKeyToSavedSearchID(currentSearchKey))) ||
        selectedTab === NAVIGATION_TABS.INSIGHTS ||
        selectedTab === NAVIGATION_TABS.WORKSPACES;
    const isSelected = isOnMorePage || isInMoreDestination;

    // The destination is resolved on press. The history is plain module state, so values read during render would be
    // memoized on the first render and never see later visits.
    const openLastMoreDestination = (): boolean => {
        switch (getLastVisitedMoreDestination()) {
            case MORE_DESTINATIONS.ACCOUNTING:
                return reopenLastVisitedSearch(ACCOUNTING_GROUP_ID, savedSearches, clearSelectedTransactions);
            case MORE_DESTINATIONS.SAVED_SEARCHES:
                return reopenLastVisitedSearch(SAVED_SEARCHES_GROUP_ID, savedSearches, clearSelectedTransactions);
            case MORE_DESTINATIONS.INSIGHTS:
                if (!isBetaEnabled(CONST.BETAS.INSIGHTS_PAGE)) {
                    return reopenLastVisitedSearch(INSIGHTS_GROUP_ID, savedSearches, clearSelectedTransactions);
                }
                openLastInsightsDashboard();
                return true;
            case MORE_DESTINATIONS.WORKSPACES:
                navigateToWorkspaces();
                return true;
            default:
                return false;
        }
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
        if (openLastMoreDestination()) {
            return;
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
