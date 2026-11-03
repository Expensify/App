import {useSyncExternalStore} from 'react';

const STORAGE_KEY = 'readOnlyFieldBorderReviewToggle';

function readStoredValue(): boolean {
    try {
        return typeof localStorage !== 'undefined' && localStorage.getItem(STORAGE_KEY) === 'true';
    } catch {
        return false;
    }
}

let isBorderShown = readStoredValue();
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

/** Flips read-only expense fields between a visible border and their borderless default, and remembers the choice */
function toggleReadOnlyFieldBorder() {
    isBorderShown = !isBorderShown;
    try {
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem(STORAGE_KEY, String(isBorderShown));
        }
    } catch {
        // Without storage the choice still applies until the app reloads
    }
    for (const listener of listeners) {
        listener();
    }
}

/**
 * Temporary review aid, switched from the testing preferences, that shows read-only expense fields with a border so
 * both looks can be compared. On web the choice survives a reload.
 */
function useReadOnlyFieldBorderToggle(): boolean {
    return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export default useReadOnlyFieldBorderToggle;
export {toggleReadOnlyFieldBorder};
