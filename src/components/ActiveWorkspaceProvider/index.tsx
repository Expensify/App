import {useNavigationState} from '@react-navigation/native';
import React from 'react';
import ActiveWorkspaceContext from '@components/ActiveWorkspace/ActiveWorkspaceContext';
import getPolicyIDFromState from '@libs/Navigation/getPolicyIDFromState';
import type ChildrenProps from '@src/types/utils/ChildrenProps';

function ActiveWorkspaceContextProvider({children}: ChildrenProps) {
    const activeWorkspaceID = useNavigationState(getPolicyIDFromState);

    // @TODO Remember to handle saving activeWorkspaceID in the session storage

    // const setActiveWorkspaceID = useCallback((workspaceID: string | undefined) => {
    //     updateActiveWorkspaceID(workspaceID);
    //     if (workspaceID && sessionStorage) {
    //         sessionStorage?.setItem(CONST.SESSION_STORAGE_KEYS.ACTIVE_WORKSPACE_ID, workspaceID);
    //     } else {
    //         sessionStorage?.removeItem(CONST.SESSION_STORAGE_KEYS.ACTIVE_WORKSPACE_ID);
    //     }
    // }, []);

    return <ActiveWorkspaceContext.Provider value={activeWorkspaceID}>{children}</ActiveWorkspaceContext.Provider>;
}

export default ActiveWorkspaceContextProvider;
