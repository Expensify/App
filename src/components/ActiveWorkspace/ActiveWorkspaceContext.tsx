import {createContext} from 'react';

type ActiveWorkspaceContextType = {
    activeWorkspaceID?: string;
    setActiveWorkspaceID: (activeWorkspaceID?: string) => void;
};

const ActiveWorkspaceContext = createContext<ActiveWorkspaceContextType | null>(null);

export default ActiveWorkspaceContext;
export {type ActiveWorkspaceContextType};
