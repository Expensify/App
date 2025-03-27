import {createContext} from 'react';

type ActiveWorkspaceContextType = {
    activeWorkspaceID: string | undefined;
    setActiveWorkspaceID: (workspaceID: string | undefined) => void;
};

const ActiveWorkspaceContext = createContext<ActiveWorkspaceContextType>({
    activeWorkspaceID: undefined,
    setActiveWorkspaceID: () => {},
});

export default ActiveWorkspaceContext;
export type {ActiveWorkspaceContextType};
