import {useSearchSelectionActions} from '@components/Search/SearchContext';

import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import useRestoreWorkspacesTabOnNavigate from '@hooks/useRestoreWorkspacesTabOnNavigate';

import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import {clearLastVisitedMoreDestination, getLastVisitedMoreDestination, MORE_DESTINATIONS} from '@libs/MoreDestinationHistory';
import {openLastInsightsDashboard, reopenLastVisitedSearch} from '@libs/MoreNavigationUtils';
import Navigation from '@libs/Navigation/Navigation';
import {ACCOUNTING_GROUP_ID, INSIGHTS_GROUP_ID, SAVED_SEARCHES_GROUP_ID} from '@libs/SpendNavigationGroups';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

type OpenMoreTabParams = {
    /** Whether the user is inside one of the destinations behind More, rather than on More itself */
    isInMoreDestination: boolean;
    isOnMorePage: boolean;
};

/**
 * What a tap on the More tab does, shared by the JS tab bar and the native one. It opens the More page, unless the user
 * has already been into one of its destinations this session - then it drops them back where they left off. Tapping it
 * from inside a destination climbs back to the More page.
 */
function useOpenMoreTab() {
    const {clearSelectedTransactions} = useSearchSelectionActions();
    const {isBetaEnabled} = usePermissions();
    const [savedSearches] = useOnyx(ONYXKEYS.SAVED_SEARCHES);
    const navigateToWorkspaces = useRestoreWorkspacesTabOnNavigate();

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

    return ({isInMoreDestination, isOnMorePage}: OpenMoreTabParams) => {
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
}

export default useOpenMoreTab;
