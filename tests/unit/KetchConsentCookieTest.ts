import parseKetchConsentCookie from '@libs/AdvertisingConsent/parseKetchConsentCookie';

const COOKIE_NAME = '_ketch_consent_v1_';
const TARGETED_ADVERTISING = 'targeted_advertising';

function encodeConsent(value: unknown): string {
    return btoa(JSON.stringify(value));
}

describe('parseKetchConsentCookie', () => {
    test('returns true when targeted advertising is granted', () => {
        const cookie = `${COOKIE_NAME}=${encodeConsent({[TARGETED_ADVERTISING]: {status: 'granted'}})}`;

        expect(parseKetchConsentCookie(cookie)).toBe(true);
    });

    test('returns false when targeted advertising is denied', () => {
        const cookie = `${COOKIE_NAME}=${encodeConsent({[TARGETED_ADVERTISING]: {status: 'denied'}})}`;

        expect(parseKetchConsentCookie(cookie)).toBe(false);
    });

    test('finds the Ketch cookie among other cookies', () => {
        const cookie = `foo=bar; ${COOKIE_NAME}=${encodeConsent({[TARGETED_ADVERTISING]: {status: 'granted'}})}; baz=qux`;

        expect(parseKetchConsentCookie(cookie)).toBe(true);
    });

    test('decodes a URL-encoded cookie value', () => {
        const encoded = encodeURIComponent(encodeConsent({[TARGETED_ADVERTISING]: {status: 'granted'}}));
        const cookie = `${COOKIE_NAME}=${encoded}`;

        expect(parseKetchConsentCookie(cookie)).toBe(true);
    });

    test('returns undefined when the cookie is missing', () => {
        expect(parseKetchConsentCookie('foo=bar; other=value')).toBeUndefined();
        expect(parseKetchConsentCookie('')).toBeUndefined();
    });

    test('returns undefined when the targeted advertising purpose is missing', () => {
        const cookie = `${COOKIE_NAME}=${encodeConsent({analytics: {status: 'granted'}})}`;

        expect(parseKetchConsentCookie(cookie)).toBeUndefined();
    });

    test('returns undefined when the cookie value is not valid base64 JSON', () => {
        expect(parseKetchConsentCookie(`${COOKIE_NAME}=not-base64-json!!`)).toBeUndefined();
        expect(parseKetchConsentCookie(`${COOKIE_NAME}=${btoa('not json')}`)).toBeUndefined();
    });
});
