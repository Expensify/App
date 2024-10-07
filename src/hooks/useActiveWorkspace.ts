import {useContext} from 'react';
import ActiveWorkspaceContext from '@components/ActiveWorkspace/ActiveWorkspaceContext';

function useActiveWorkspace(): {activeWorkspaceID: string | undefined; setActiveWorkspaceID: (workspaceID: string | undefined) => void} {
    return useContext(ActiveWorkspaceContext);
}

export default useActiveWorkspace;
