import {useSyncExternalStore} from 'react';

import {getSnapshot, subscribe} from './windowSizeChangeStore';

/**
 * Reports whether the window is being resized or the device has just changed orientation. The flag turns on with
 * the first dimension change and turns off shortly after the last one, so a whole drag or rotation reads as one
 * continuous change rather than a burst of separate ones.
 *
 * Only the layout width counts, which covers an orientation change as well because rotating a device always
 * changes the width. The soft keyboard changes the window height on Android and on mobile web, and a scale only
 * change keeps the same size in density independent units, so neither of them marks the window as changing.
 *
 * useIsResizing answers a similar question for tooltips, but it listens to the web resize event only, reports
 * nothing on native and counts every height change.
 *
 * The hook lives apart from windowSizeChangeStore because the store's function bodies compile differently under the
 * two React Compiler toolchains, which the compliance check reads as a memoization divergence.
 */
function useIsWindowSizeChanging() {
    return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export default useIsWindowSizeChanging;
