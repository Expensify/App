import React, {useCallback, useMemo, useState} from 'react';
import CONST from '@src/CONST';
import type ChildrenProps from '@src/types/utils/ChildrenProps';
import ActiveWorkspaceContext from './ActiveWorkspaceContext';

function ActiveWorkspaceContextProvider({children}: ChildrenProps) {
    const [activeWorkspaceID, updateActiveWorkspaceID] = useState<string | undefined>(undefined);

    const setActiveWorkspaceID = useCallback((workspaceID: string | undefined) => {
        updateActiveWorkspaceID(workspaceID);
        if (workspaceID && sessionStorage) {
            sessionStorage?.setItem(CONST.SESSION_STORAGE_KEYS.ACTIVE_WORKSPACE_ID, workspaceID);
        } else {
            sessionStorage?.removeItem(CONST.SESSION_STORAGE_KEYS.ACTIVE_WORKSPACE_ID);
        }
    }, []);

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
