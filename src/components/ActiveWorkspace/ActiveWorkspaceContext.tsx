import {createContext} from 'react';

const ActiveWorkspaceContext = createContext<{activeWorkspaceID: string | undefined; setActiveWorkspaceID: (workspaceID: string | undefined) => void}>({
    activeWorkspaceID: undefined,
    setActiveWorkspaceID: () => {},
});

export default ActiveWorkspaceContext;
