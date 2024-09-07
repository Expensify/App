import {useContext} from 'react';
import ActiveWorkspaceContext from '@components/ActiveWorkspace/ActiveWorkspaceContext';

function useActiveWorkspace(): string {
    return useContext(ActiveWorkspaceContext);
}

export default useActiveWorkspace;
