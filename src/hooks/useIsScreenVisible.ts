import {useSyncExternalStore} from 'react';

import useScreenVisibilityStore from './useScreenVisibilityStore';

/** Whether the user can see this component's screen. Re-renders when that changes. */
export default function useIsScreenVisible(): boolean {
    const visibility = useScreenVisibilityStore();
    return useSyncExternalStore(visibility.subscribe, visibility.getIsVisible);
}
