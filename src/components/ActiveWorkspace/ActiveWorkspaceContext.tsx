import {createContext} from 'react';

const ActiveWorkspaceContext = createContext<string | undefined>(undefined);

export default ActiveWorkspaceContext;
