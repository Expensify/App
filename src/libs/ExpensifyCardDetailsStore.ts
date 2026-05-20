import {useSyncExternalStore} from 'react';
import type {ExpensifyCardDetails} from '@src/types/onyx/Card';

/**
 * In-memory store for revealed Expensify Card details (PAN, expiration, CVV).
 * Card details must NOT be persisted to disk (PCI compliance), so we use a
 * module-level store with useSyncExternalStore for React integration instead of Onyx.
 *
 * Used by the SCA (Strong Customer Authentication) reveal flow, where the MFA
 * scenario callback runs outside React and needs a place to drop the details
 * for the card page to pick up.
 */

type Listener = () => void;

const listeners = new Set<Listener>();
let revealedCardDetails: Record<string, ExpensifyCardDetails> = {};

function subscribe(listener: Listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

function notifyListeners() {
    for (const listener of listeners) {
        listener();
    }
}

/** Intentionally replaces the entire map so only one card's details are stored in memory at a time. */
function setRevealedCardDetails(cardID: string, details: ExpensifyCardDetails) {
    revealedCardDetails = {[cardID]: details};
    notifyListeners();
}

function clearRevealedCardDetails() {
    revealedCardDetails = {};
    notifyListeners();
}

function getSnapshot() {
    return revealedCardDetails;
}

function useRevealedCardDetails(cardID: string): ExpensifyCardDetails | undefined {
    const all = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
    return cardID ? all[cardID] : undefined;
}

/**
 * Returns the entire revealed-card-details map. Use when you need to look up by
 * a cardID inside a render callback (e.g. inside a `.map()` over virtual cards)
 * where calling {@link useRevealedCardDetails} would violate the Rules of Hooks.
 */
function useAllRevealedCardDetails(): Record<string, ExpensifyCardDetails> {
    return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export {setRevealedCardDetails, clearRevealedCardDetails, useRevealedCardDetails, useAllRevealedCardDetails};
