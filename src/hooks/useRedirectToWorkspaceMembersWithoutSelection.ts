import Navigation from '@libs/Navigation/Navigation';

import ROUTES from '@src/ROUTES';

import {useEffect} from 'react';

type UseRedirectToWorkspaceMembersWithoutSelectionParams = {
    policyID: string;
    /** When true, the redirect waits because the selection has not been read yet. */
    isSelectionLoading: boolean;
    /** Number of members selected on this workspace's member list. */
    selectedMemberCount: number;
};

/**
 * Returns to the workspace members list when a bulk-edit page has no members selected. The selection only lives in
 * memory, so a page opened from a link or after a refresh has nothing to act on.
 */
function useRedirectToWorkspaceMembersWithoutSelection({policyID, isSelectionLoading, selectedMemberCount}: UseRedirectToWorkspaceMembersWithoutSelectionParams): void {
    useEffect(() => {
        if (isSelectionLoading || selectedMemberCount > 0) {
            return;
        }
        Navigation.navigate(ROUTES.WORKSPACE_MEMBERS.getRoute(policyID));
    }, [isSelectionLoading, selectedMemberCount, policyID]);
}

export default useRedirectToWorkspaceMembersWithoutSelection;
