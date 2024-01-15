import React, {useMemo, useState} from 'react';
import ActiveWorkspaceContext from './ActiveWorkspaceContext';

function ActiveWorkspaceContextProvider({children}: React.PropsWithChildren) {
    const [activeWorkspaceID, setActiveWorkspaceID] = useState<string | undefined>(undefined);

    const value = useMemo(
        () => ({
            activeWorkspaceID,
            setActiveWorkspaceID,
        }), [activeWorkspaceID]
    )

    return <ActiveWorkspaceContext.Provider value={value}>{children}</ActiveWorkspaceContext.Provider>;
}

export default ActiveWorkspaceContextProvider;