import {useNavigationState} from '@react-navigation/native';
import React, {useEffect, useMemo, useState} from 'react';
import ActiveWorkspaceContext from '@components/ActiveWorkspace/ActiveWorkspaceContext';
import * as SearchQueryUtils from '@libs/SearchQueryUtils';
import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';
import type ChildrenProps from '@src/types/utils/ChildrenProps';

function ActiveWorkspaceContextProvider({children}: ChildrenProps) {
    const [activeWorkspaceID, setActiveWorkspaceID] = useState<string | undefined>(undefined);

    const lastPolicyRoute = useNavigationState((state) =>
        state?.routes?.findLast((route) => route.name === NAVIGATORS.REPORTS_SPLIT_NAVIGATOR || route.name === SCREENS.SEARCH.CENTRAL_PANE),
    );

    const policyIDFromRouteParam = lastPolicyRoute?.params && 'policyID' in lastPolicyRoute.params ? (lastPolicyRoute?.params?.policyID as string) : '';
    const queryFromRouteParam = lastPolicyRoute?.params && 'q' in lastPolicyRoute.params ? (lastPolicyRoute.params.q as string) : '';

    useEffect(() => {
        if (policyIDFromRouteParam) {
            setActiveWorkspaceID(policyIDFromRouteParam);
            return;
        }

        if (!queryFromRouteParam) {
            setActiveWorkspaceID(undefined);
            return;
        }

        const queryJSON = SearchQueryUtils.buildSearchQueryJSON(queryFromRouteParam);

        if (!queryJSON) {
            setActiveWorkspaceID(undefined);
            return;
        }

        setActiveWorkspaceID(SearchQueryUtils.getPolicyIDFromSearchQuery(queryJSON));
    }, [policyIDFromRouteParam, queryFromRouteParam, setActiveWorkspaceID]);

    const value = useMemo(
        () => ({
            activeWorkspaceID,
            setActiveWorkspaceID,
        }),
        [activeWorkspaceID, setActiveWorkspaceID],
    );

    return <ActiveWorkspaceContext.Provider value={value}>{children}</ActiveWorkspaceContext.Provider>;
}

export default ActiveWorkspaceContextProvider;
export {};
