import React, {useCallback, useMemo, useState} from 'react';
import * as Policy from '@libs/actions/Policy';
import type ChildrenProps from '@src/types/utils/ChildrenProps';
import ActiveWorkspaceContext from './ActiveWorkspaceContext';

function ActiveWorkspaceContextProvider({children}: ChildrenProps) {
    const [activeWorkspaceID, updateActiveWorkspaceID] = useState<string | undefined>(undefined);

    const setActiveWorkspaceID = useCallback(
        (workspaceID: string | undefined) => {
            Policy.setActiveWorkspaceID(workspaceID);
            updateActiveWorkspaceID(workspaceID);
        },
        [updateActiveWorkspaceID],
    );

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
