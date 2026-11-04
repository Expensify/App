/** Returns to Members when an open member page loses its member after an invite syncs. */
import Navigation from '@libs/Navigation/Navigation';

import ROUTES from '@src/ROUTES';

import {useIsFocused} from '@react-navigation/native';
import {useEffect, useState} from 'react';

/**
 * A secondary login can disappear without a mapping to the primary login. Remember which route resolved successfully
 * so that case returns to Members, while a direct link to an unknown member still shows not found.
 */
function useRedirectOnWorkspaceMemberRemoval(policyID: string, routeAccountID: number, isMemberResolved: boolean): boolean {
    const memberRoute = ROUTES.WORKSPACE_MEMBER_DETAILS.getRoute(policyID, routeAccountID);
    const [memberHistory, setMemberHistory] = useState({memberRoute, hasResolved: isMemberResolved});
    const isFocused = useIsFocused();
    if (memberHistory.memberRoute !== memberRoute) {
        setMemberHistory({memberRoute, hasResolved: isMemberResolved});
    } else if (isMemberResolved && !memberHistory.hasResolved) {
        setMemberHistory({memberRoute, hasResolved: true});
    }
    const shouldRedirect = memberHistory.memberRoute === memberRoute && memberHistory.hasResolved && !isMemberResolved;

    useEffect(() => {
        if (!shouldRedirect || !isFocused) {
            return;
        }
        Navigation.goBack(ROUTES.WORKSPACE_MEMBERS.getRoute(policyID));
    }, [isFocused, policyID, shouldRedirect]);

    return shouldRedirect;
}

export default useRedirectOnWorkspaceMemberRemoval;
