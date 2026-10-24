import type * as KetchModule from '@libs/Ketch/types';

import CONST from '@src/CONST';

type KetchLib = {
    getTargetedAdvertisingConsent: KetchModule.GetTargetedAdvertisingConsent;
    subscribeToTargetedAdvertisingConsent: KetchModule.SubscribeToTargetedAdvertisingConsent;
};

type ConsentCallback = (consent: {purposes?: Record<string, boolean>}) => void;

function isConsentCallback(value: unknown): value is ConsentCallback {
    return typeof value === 'function';
}

/** Loads a fresh copy of the web implementation (jest resolves `@libs/Ketch` to the native stub) */
function loadWebKetch(): KetchLib {
    let lib: KetchLib | undefined;
    jest.isolateModules(() => {
        lib = jest.requireActual<KetchLib>('@libs/Ketch/index.ts');
    });
    if (!lib) {
        throw new Error('Could not load @libs/Ketch/index.ts');
    }
    return lib;
}

/** Installs a fake `window.ketch` that records the callbacks passed to getConsent and the consent event */
function installKetch() {
    const getConsentCallbacks: ConsentCallback[] = [];
    const consentEventCallbacks: ConsentCallback[] = [];
    const ketch = jest.fn((command: string, ...args: unknown[]) => {
        const [eventOrCallback, callback] = args;
        if (command === 'getConsent' && isConsentCallback(eventOrCallback)) {
            getConsentCallbacks.push(eventOrCallback);
        }
        if (command === 'on' && eventOrCallback === 'consent' && isConsentCallback(callback)) {
            consentEventCallbacks.push(callback);
        }
    });
    window.ketch = ketch;
    return {ketch, getConsentCallbacks, consentEventCallbacks};
}

const purpose = CONST.KETCH.TARGETED_ADVERTISING_PURPOSE;

describe('Ketch (web)', () => {
    afterEach(() => {
        delete window.ketch;
    });

    it('returns undefined and does nothing when Ketch is not loaded', () => {
        const {getTargetedAdvertisingConsent, subscribeToTargetedAdvertisingConsent} = loadWebKetch();
        const callback = jest.fn();

        expect(getTargetedAdvertisingConsent()).toBeUndefined();
        expect(() => subscribeToTargetedAdvertisingConsent(callback)()).not.toThrow();
        expect(callback).not.toHaveBeenCalled();
    });

    it('asks Ketch for the consent and subscribes to changes once', () => {
        const {ketch} = installKetch();
        const {getTargetedAdvertisingConsent, subscribeToTargetedAdvertisingConsent} = loadWebKetch();

        getTargetedAdvertisingConsent();
        subscribeToTargetedAdvertisingConsent(jest.fn());
        subscribeToTargetedAdvertisingConsent(jest.fn());

        expect(ketch).toHaveBeenCalledTimes(2);
        expect(ketch).toHaveBeenCalledWith('getConsent', expect.any(Function));
        expect(ketch).toHaveBeenCalledWith('on', 'consent', expect.any(Function));
    });

    it('maps the targeted advertising purpose to granted or denied', () => {
        const {getConsentCallbacks, consentEventCallbacks} = installKetch();
        const {getTargetedAdvertisingConsent} = loadWebKetch();

        expect(getTargetedAdvertisingConsent()).toBeUndefined();

        getConsentCallbacks.at(0)?.({
            purposes: {[purpose]: true, analytics: false},
        });
        expect(getTargetedAdvertisingConsent()).toBe(CONST.TARGETED_ADVERTISING_CONSENT.GRANTED);

        consentEventCallbacks.at(0)?.({
            purposes: {[purpose]: false, analytics: true},
        });
        expect(getTargetedAdvertisingConsent()).toBe(CONST.TARGETED_ADVERTISING_CONSENT.DENIED);
    });

    it('keeps the last known consent when Ketch sends one without the purpose', () => {
        const {consentEventCallbacks} = installKetch();
        const {getTargetedAdvertisingConsent} = loadWebKetch();
        getTargetedAdvertisingConsent();

        consentEventCallbacks.at(0)?.({purposes: {[purpose]: true}});
        consentEventCallbacks.at(0)?.({purposes: {analytics: true}});
        consentEventCallbacks.at(0)?.({});

        expect(getTargetedAdvertisingConsent()).toBe(CONST.TARGETED_ADVERTISING_CONSENT.GRANTED);
    });

    it('notifies subscribers only when the consent changes, until they unsubscribe', () => {
        const {getConsentCallbacks, consentEventCallbacks} = installKetch();
        const {subscribeToTargetedAdvertisingConsent} = loadWebKetch();
        const callback = jest.fn();
        const unsubscribe = subscribeToTargetedAdvertisingConsent(callback);

        getConsentCallbacks.at(0)?.({purposes: {[purpose]: true}});
        consentEventCallbacks.at(0)?.({purposes: {[purpose]: true}});
        consentEventCallbacks.at(0)?.({purposes: {[purpose]: false}});
        unsubscribe();
        consentEventCallbacks.at(0)?.({purposes: {[purpose]: true}});

        expect(callback.mock.calls).toEqual([[CONST.TARGETED_ADVERTISING_CONSENT.GRANTED], [CONST.TARGETED_ADVERTISING_CONSENT.DENIED]]);
    });
});

describe('Ketch (native)', () => {
    it('never knows the consent', () => {
        const {ketch} = installKetch();
        const nativeKetch = jest.requireActual<KetchLib>('@libs/Ketch/index.native.ts');
        const callback = jest.fn();

        expect(nativeKetch.getTargetedAdvertisingConsent()).toBeUndefined();
        nativeKetch.subscribeToTargetedAdvertisingConsent(callback)();
        expect(ketch).not.toHaveBeenCalled();
        expect(callback).not.toHaveBeenCalled();
        delete window.ketch;
    });
});
