import CONST from '@src/CONST';

import type {GetTargetedAdvertisingConsent, SubscribeToTargetedAdvertisingConsent, TargetedAdvertisingConsent, TargetedAdvertisingConsentCallback} from './types';

/** The consent object Ketch passes to `getConsent` and `consent` event callbacks: purpose codes mapped to whether the user allows them */
type KetchConsent = {
    purposes?: Record<string, boolean | undefined>;
};

let currentConsent: TargetedAdvertisingConsent | undefined;
let isListening = false;
const callbacks = new Set<TargetedAdvertisingConsentCallback>();

function getKetch() {
    if (typeof window === 'undefined' || typeof window.ketch !== 'function') {
        return undefined;
    }
    return window.ketch;
}

function toTargetedAdvertisingConsent(consent: KetchConsent | undefined): TargetedAdvertisingConsent | undefined {
    const isAllowed = consent?.purposes?.[CONST.KETCH.TARGETED_ADVERTISING_PURPOSE];
    if (typeof isAllowed !== 'boolean') {
        return undefined;
    }
    return isAllowed ? CONST.TARGETED_ADVERTISING_CONSENT.GRANTED : CONST.TARGETED_ADVERTISING_CONSENT.DENIED;
}

function handleConsent(consent: KetchConsent | undefined) {
    const newConsent = toTargetedAdvertisingConsent(consent);
    if (!newConsent || newConsent === currentConsent) {
        return;
    }
    currentConsent = newConsent;
    for (const callback of callbacks) {
        callback(newConsent);
    }
}

/**
 * Starts reading the consent from Ketch, once. `getConsent` resolves with the consent once Ketch has resolved it (from its
 * cookie, its server or the banner), and the `consent` event fires every time it is resolved or changed afterwards.
 * Ketch isn't loaded when third party scripts are off (e.g. local dev), so the consent stays unknown there.
 */
function startListening() {
    if (isListening) {
        return;
    }
    const ketch = getKetch();
    if (!ketch) {
        return;
    }
    isListening = true;
    ketch('getConsent', handleConsent);
    ketch('on', 'consent', handleConsent);
}

/** Returns the user's last known targeted advertising consent, or undefined when Ketch hasn't resolved it (or isn't loaded) */
const getTargetedAdvertisingConsent: GetTargetedAdvertisingConsent = () => {
    startListening();
    return currentConsent;
};

/** Calls the callback every time the targeted advertising consent changes. Returns a function that unsubscribes. */
const subscribeToTargetedAdvertisingConsent: SubscribeToTargetedAdvertisingConsent = (callback) => {
    startListening();
    callbacks.add(callback);
    return () => {
        callbacks.delete(callback);
    };
};

export {getTargetedAdvertisingConsent, subscribeToTargetedAdvertisingConsent};
