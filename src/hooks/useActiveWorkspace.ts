import {useContext} from 'react';
import ActiveWorkspaceContext from '@components/ActiveWorkspace/ActiveWorkspaceContext';
import type {ActiveWorkspaceContextType} from '@components/ActiveWorkspace/ActiveWorkspaceContext';

function useActiveWorkspace(): ActiveWorkspaceContextType {
    return useContext(ActiveWorkspaceContext);
}

export default useActiveWorkspace;
