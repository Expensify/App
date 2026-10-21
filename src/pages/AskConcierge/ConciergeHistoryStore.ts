import {useSyncExternalStore} from 'react';

/**
 * Whether the Concierge thread list is showing over the Concierge chat.
 *
 * The button that opens it lives in the chat's header while the list itself covers the chat body, so the two sit
 * in different trees and share this instead of a prop.
 */
let isOpen = false;
const listeners = new Set<() => void>();

function notify() {
    for (const listener of listeners) {listener();}
}

function openConciergeHistory() {
    if (isOpen) {
        return;
    }
    isOpen = true;
    notify();
}

function closeConciergeHistory() {
    if (!isOpen) {
        return;
    }
    isOpen = false;
    notify();
}

function subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
}

function getSnapshot() {
    return isOpen;
}

function useIsConciergeHistoryOpen(): boolean {
    return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export {openConciergeHistory, closeConciergeHistory, useIsConciergeHistoryOpen};
