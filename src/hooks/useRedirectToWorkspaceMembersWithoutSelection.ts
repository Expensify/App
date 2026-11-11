/**
 * Returns to the workspace members list when a bulk-edit page has no members selected. The selection only lives in
 * memory, so a page opened from a link or after a refresh has nothing to act on.
 */
import Navigation from '@libs/Navigation/Navigation';

import ROUTES from '@src/ROUTES';

import {useEffect} from 'react';

type UseRedirectToWorkspaceMembersWithoutSelectionParams = {
    policyID: string;
    /** Number of members selected on this workspace's member list. */
    selectedMemberCount: number;
};

function useRedirectToWorkspaceMembersWithoutSelection({policyID, selectedMemberCount}: UseRedirectToWorkspaceMembersWithoutSelectionParams): void {
    useEffect(() => {
        if (selectedMemberCount > 0) {
            return;
        }

        // After a refresh this runs before the navigation container is ready, when goBack() would be dropped, so it waits for it
        let isCancelled = false;
        Navigation.isNavigationReady().then(() => {
            if (isCancelled) {
                return;
            }
            Navigation.goBack(ROUTES.WORKSPACE_MEMBERS.getRoute(policyID));
        });

        return () => {
            isCancelled = true;
        };
    }, [selectedMemberCount, policyID]);
}

export default useRedirectToWorkspaceMembersWithoutSelection;
