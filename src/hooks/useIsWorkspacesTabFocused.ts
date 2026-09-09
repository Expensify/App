import NAVIGATORS from '@src/NAVIGATORS';

import useIsTabFocused from './useIsTabFocused';

/** Returns true when the Workspaces tab is the active tab in the top-most TAB_NAVIGATOR. See `useIsTabFocused`. */
function useIsWorkspacesTabFocused(): boolean {
    return useIsTabFocused(NAVIGATORS.WORKSPACE_NAVIGATOR);
}

export default useIsWorkspacesTabFocused;
