import useEnvironment from '@hooks/useEnvironment';

import {useSyncExternalStore} from 'react';

const TOGGLE_KEY = 'b';

let isBorderShown = false;
const listeners = new Set<() => void>();

function isTypingTarget(target: EventTarget | null): boolean {
    if (!(target instanceof HTMLElement)) {
        return false;
    }
    return target.isContentEditable || target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT';
}

function handleKeyDown(event: KeyboardEvent) {
    if (event.key.toLowerCase() !== TOGGLE_KEY || event.metaKey || event.ctrlKey || event.altKey || isTypingTarget(event.target)) {
        return;
    }
    isBorderShown = !isBorderShown;
    for (const listener of listeners) {
        listener();
    }
}

function subscribe(listener: () => void) {
    if (typeof document === 'undefined') {
        return () => {};
    }
    if (listeners.size === 0) {
        document.addEventListener('keydown', handleKeyDown);
    }
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
        if (listeners.size === 0) {
            document.removeEventListener('keydown', handleKeyDown);
        }
    };
}

function getSnapshot() {
    return isBorderShown;
}

/**
 * Review aid: pressing "b" outside a text field flips read-only expense fields between a visible border and their
 * borderless default, so both looks can be compared side by side. Off in production, where the key does nothing.
 */
function useReadOnlyFieldBorderToggle(): boolean {
    const {isProduction} = useEnvironment();
    const isShown = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
    return !isProduction && isShown;
}

export default useReadOnlyFieldBorderToggle;
