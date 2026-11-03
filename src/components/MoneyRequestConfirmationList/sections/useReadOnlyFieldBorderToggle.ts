import useEnvironment from '@hooks/useEnvironment';

import {useSyncExternalStore} from 'react';

let isBorderShown = false;
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
}

function getSnapshot() {
    return isBorderShown;
}

/** Flips read-only expense fields between a visible border and their borderless default */
function toggleReadOnlyFieldBorder() {
    isBorderShown = !isBorderShown;
    for (const listener of listeners) {
        listener();
    }
}

/**
 * Temporary review aid, switched from the testing preferences, that shows read-only expense fields with a border so
 * both looks can be compared. It lasts until the app reloads, and is off in production.
 */
function useReadOnlyFieldBorderToggle(): boolean {
    const {isProduction} = useEnvironment();
    const isShown = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
    return !isProduction && isShown;
}

export default useReadOnlyFieldBorderToggle;
export {toggleReadOnlyFieldBorder};
