import {useSyncExternalStore} from 'react';

import {getSnapshot, subscribe} from './windowSizeChangeStore';

/**
 * Reports whether the window width is changing, on both platforms. A screen hidden by
 * <Activity> has no mounted effects, so it reads this flag to become visible for the duration of the change and
 * lay itself out while still covered. The existing useIsResizing does not fit here, because it is web only and
 * also counts the height changes the soft keyboard causes. The hook lives apart from windowSizeChangeStore because
 * the store compiles differently under the two React Compiler toolchains, which the compliance check reads as a
 * memoization divergence.
 */
function useIsWindowSizeChanging() {
    return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export default useIsWindowSizeChanging;
