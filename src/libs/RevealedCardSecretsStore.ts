import type {ExpensifyCardDetails} from '@src/types/onyx/Card';

import {useSyncExternalStore} from 'react';

/**
 * In-memory stores for revealed card secrets.
 *
 * Card secrets (PINs, PAN/expiration/CVV) must NOT be persisted to disk for PCI
 * compliance, so we use module-level stores with useSyncExternalStore for React
 * integration instead of Onyx.
 *
 * Two secret stores live here:
 *   - Physical card PIN — surfaced by the reveal-PIN flow on physical cards.
 *   - Virtual card details (PAN/expiration/CVV) — surfaced when revealing a
 *     virtual card, either through the SCA reveal flow (UK/EU cards, where the
 *     MFA scenario callback runs outside React) or the magic-code reveal flow
 *     (US cards). Both drop the details here for the card page to pick up.
 *
 * A third store tracks the virtual-card reveal loading flag. It is not a secret,
 * but it is colocated here because the magic-code reveal request runs on a
 * separate screen (the confirm-magic-code RHP) from the card page that renders
 * the loading state, so both screens need a shared, non-persisted place for it.
 *
 * Each store keeps only one entry at a time so at most one card's secret is in
 * memory. The stores are independent: revealing a PIN does not clear the
 * virtual-card details and vice versa.
 */

type Listener = () => void;

function createRevealedSecretStore<T>() {
    const listeners = new Set<Listener>();
    let store: Record<string, T> = {};

    function subscribe(listener: Listener) {
        listeners.add(listener);
        return () => listeners.delete(listener);
    }

    function notifyListeners() {
        for (const listener of listeners) {
            listener();
        }
    }

    function set(cardID: string, value: T) {
        store = {[cardID]: value};
        notifyListeners();
    }

    function clear() {
        store = {};
        notifyListeners();
    }

    function getSnapshot() {
        return store;
    }

    function useValue(cardID: string): T | undefined {
        const all = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
        return cardID ? all[cardID] : undefined;
    }

    function useAll(): Record<string, T> {
        return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
    }

    return {set, clear, useValue, useAll};
}

const physicalCardPinStore = createRevealedSecretStore<string>();
const virtualCardDetailsStore = createRevealedSecretStore<ExpensifyCardDetails>();
const virtualCardDetailsLoadingStore = createRevealedSecretStore<boolean>();

const setRevealedPhysicalCardPin = physicalCardPinStore.set;
const clearRevealedPhysicalCardPin = physicalCardPinStore.clear;
const useRevealedPhysicalCardPin = physicalCardPinStore.useValue;

const setRevealedVirtualCardDetails = virtualCardDetailsStore.set;
const clearRevealedVirtualCardDetails = virtualCardDetailsStore.clear;
const useRevealedVirtualCardDetails = virtualCardDetailsStore.useValue;
/**
 * Returns the entire revealed-virtual-card-details map. Use when you need to
 * look up by a cardID inside a render callback (e.g. inside a `.map()` over
 * virtual cards) where calling {@link useRevealedVirtualCardDetails} would
 * violate the Rules of Hooks.
 */
const useAllRevealedVirtualCardDetails = virtualCardDetailsStore.useAll;

const setVirtualCardDetailsLoading = virtualCardDetailsLoadingStore.set;
const clearVirtualCardDetailsLoading = virtualCardDetailsLoadingStore.clear;
/**
 * Returns the entire virtual-card reveal-loading map, keyed by cardID. Read inside a
 * `.map()` over virtual cards, where calling a per-card hook would violate the Rules of Hooks.
 */
const useAllVirtualCardDetailsLoading = virtualCardDetailsLoadingStore.useAll;

export {
    setRevealedPhysicalCardPin,
    clearRevealedPhysicalCardPin,
    useRevealedPhysicalCardPin,
    setRevealedVirtualCardDetails,
    clearRevealedVirtualCardDetails,
    useRevealedVirtualCardDetails,
    useAllRevealedVirtualCardDetails,
    setVirtualCardDetailsLoading,
    clearVirtualCardDetailsLoading,
    useAllVirtualCardDetailsLoading,
};
