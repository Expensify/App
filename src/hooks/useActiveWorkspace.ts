import {useContext} from 'react';
import type {ActiveWorkspaceContextType} from '@components/ActiveWorkspace/ActiveWorkspaceContext';
import ActiveWorkspaceContext from '@components/ActiveWorkspace/ActiveWorkspaceContext';

function useActiveWorkspace(): ActiveWorkspaceContextType {
    return useContext(ActiveWorkspaceContext);
}

export default useActiveWorkspace;
