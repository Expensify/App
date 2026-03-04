import {useSyncExternalStore} from 'react';

/**
 * In-memory store for revealed card PINs.
 * PINs must NOT be persisted to disk (PCI compliance), so we use a module-level store
 * with useSyncExternalStore for React integration instead of Onyx.
 */

type Listener = () => void;

const listeners = new Set<Listener>();
let revealedPINs: Record<string, string> = {};

function subscribe(listener: Listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

function notifyListeners() {
    for (const listener of listeners) {
        listener();
    }
}

function setRevealedPIN(cardID: string, pin: string) {
    revealedPINs = {[cardID]: pin};
    notifyListeners();
}

function clearRevealedPIN() {
    revealedPINs = {};
    notifyListeners();
}

function getSnapshot() {
    return revealedPINs;
}

function useRevealedPIN(cardID: string): string | undefined {
    const pins = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
    return pins[cardID];
}

export {setRevealedPIN, clearRevealedPIN, useRevealedPIN};
