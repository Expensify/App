import {createContext} from 'react';

type ActiveWorkspaceContextType = {
    activeWorkspaceID?: string;
    setActiveWorkspaceID: (activeWorkspaceID?: string) => void;
};

const ActiveWorkspaceContext = createContext<ActiveWorkspaceContextType>({activeWorkspaceID: undefined, setActiveWorkspaceID: () => undefined});

export default ActiveWorkspaceContext;
export {type ActiveWorkspaceContextType};
