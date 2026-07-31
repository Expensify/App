import {useSyncExternalStore} from 'react';

import {getSnapshot, subscribe} from './windowSizeChangeStore';

/**
 * Reports whether the window is being resized or the device has just changed orientation. Screens deprioritized with
 * React <Activity> render at background priority and have no mounted effects, so their layout goes stale when the
 * window size changes. Reading this flag lets them become visible for the duration of the change and lay themselves
 * out again while they are still covered, instead of catching up in front of the user on reveal.
 *
 * The hook lives apart from windowSizeChangeStore because the store's function bodies compile differently under the
 * two React Compiler toolchains, which the compliance check reads as a memoization divergence.
 */
function useIsWindowSizeChanging() {
    return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export default useIsWindowSizeChanging;
