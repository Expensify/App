/** Whether a wide or super wide RHP is on screen, including one under a single RHP stacked on it. */
import {expandedRHPProgress} from '@components/WideRHPContextProvider';

import {useSyncExternalStore} from 'react';

// The wide RHP state lives in a provider below the side panel's, so this reads the progress value that provider sets on every RHP change.
let isWideRHPDisplayed = false;
const listeners = new Set<() => void>();

expandedRHPProgress.addListener(({value}) => {
    const isDisplayed = value > 0;
    if (isDisplayed === isWideRHPDisplayed) {
        return;
    }
    isWideRHPDisplayed = isDisplayed;
    for (const listener of listeners) {
        listener();
    }
});

function subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
}

function getSnapshot() {
    return isWideRHPDisplayed;
}

function useIsWideRHPDisplayed(): boolean {
    return useSyncExternalStore(subscribe, getSnapshot);
}

export default useIsWideRHPDisplayed;
