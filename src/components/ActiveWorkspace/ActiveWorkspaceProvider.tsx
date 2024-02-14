import React, {useMemo, useState} from 'react';
import type ChildrenProps from '@src/types/utils/ChildrenProps';
import ActiveWorkspaceContext from './ActiveWorkspaceContext';

function ActiveWorkspaceContextProvider({children}: ChildrenProps) {
    const [activeWorkspaceID, setActiveWorkspaceID] = useState<string | undefined>(undefined);

    const value = useMemo(
        () => ({
            activeWorkspaceID,
            setActiveWorkspaceID,
        }),
        [activeWorkspaceID],
    );

    return <ActiveWorkspaceContext.Provider value={value}>{children}</ActiveWorkspaceContext.Provider>;
}

export default ActiveWorkspaceContextProvider;
