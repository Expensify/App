import {useSyncExternalStore} from 'react';

import {getSnapshot, subscribe} from './windowSizeChangeStore';

/**
 * Reports whether the window is being resized or the device has just changed orientation. A screen deprioritized
 * with React <Activity> has no mounted effects, so its layout goes stale when the window size changes. Reading this
 * flag lets it become visible for the duration of the change and lay itself out again while it is still covered,
 * instead of catching up in front of the user on reveal.
 *
 * The hook lives apart from windowSizeChangeStore because the store's function bodies compile differently under the
 * two React Compiler toolchains, which the compliance check reads as a memoization divergence.
 */
function useIsWindowSizeChanging() {
    return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export default useIsWindowSizeChanging;
