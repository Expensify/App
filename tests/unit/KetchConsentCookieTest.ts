import parseKetchConsentCookie from '@libs/AdvertisingConsent/parseKetchConsentCookie';

const COOKIE_NAME = '_ketch_consent_v1_';
const TARGETED_ADVERTISING = 'targeted_advertising';

function encodeConsent(value: unknown): string {
    return btoa(JSON.stringify(value));
}

describe('parseKetchConsentCookie', () => {
    test('returns true when targeted advertising is granted', () => {
        // Given a visitor who granted targeted advertising consent in the Ketch banner
        const cookie = `${COOKIE_NAME}=${encodeConsent({[TARGETED_ADVERTISING]: {status: 'granted'}})}`;

        // When the cookie is parsed
        // Then the parser returns true so the grant is forwarded as consent
        expect(parseKetchConsentCookie(cookie)).toBe(true);
    });

    test('returns false when targeted advertising is denied', () => {
        // Given a visitor who denied targeted advertising consent in the Ketch banner
        const cookie = `${COOKIE_NAME}=${encodeConsent({[TARGETED_ADVERTISING]: {status: 'denied'}})}`;

        // When the cookie is parsed
        // Then the parser returns false so a refusal is never treated as consent
        expect(parseKetchConsentCookie(cookie)).toBe(false);
    });

    test('finds the Ketch cookie among other cookies', () => {
        // Given the Ketch cookie is one of several cookies set on the same domain
        const cookie = `foo=bar; ${COOKIE_NAME}=${encodeConsent({[TARGETED_ADVERTISING]: {status: 'granted'}})}; baz=qux`;

        // When the full cookie header is parsed
        // Then the parser locates the Ketch cookie by name instead of assuming it comes first
        expect(parseKetchConsentCookie(cookie)).toBe(true);
    });

    test('decodes a URL-encoded cookie value', () => {
        // Given the browser stored the Ketch cookie value URL-encoded
        const encoded = encodeURIComponent(encodeConsent({[TARGETED_ADVERTISING]: {status: 'granted'}}));
        const cookie = `${COOKIE_NAME}=${encoded}`;

        // When the cookie is parsed
        // Then the parser decodes the value first so valid consent is not lost to percent-encoding
        expect(parseKetchConsentCookie(cookie)).toBe(true);
    });

    test('returns undefined when the cookie is missing', () => {
        // Given a cookie header that does not contain the Ketch cookie, or no cookies at all
        // When the header is parsed
        // Then the parser returns undefined so no consent state is inferred when the banner was never answered
        expect(parseKetchConsentCookie('foo=bar; other=value')).toBeUndefined();
        expect(parseKetchConsentCookie('')).toBeUndefined();
    });

    test('returns undefined when the targeted advertising purpose is missing', () => {
        // Given a Ketch cookie that only holds a decision for another purpose
        const cookie = `${COOKIE_NAME}=${encodeConsent({analytics: {status: 'granted'}})}`;

        // When the cookie is parsed
        // Then the parser returns undefined because a missing decision is not the same as a denial
        expect(parseKetchConsentCookie(cookie)).toBeUndefined();
    });

    test('returns undefined when the targeted advertising status is missing', () => {
        // Given a Ketch cookie whose targeted advertising purpose has no status field
        const cookie = `${COOKIE_NAME}=${encodeConsent({[TARGETED_ADVERTISING]: {}})}`;

        // When the cookie is parsed
        // Then the parser returns undefined so the signup request omits isAdvertisingConsentGranted instead of sending false
        expect(parseKetchConsentCookie(cookie)).toBeUndefined();
    });

    test('returns undefined when the targeted advertising status is unrecognized', () => {
        // Given a Ketch cookie whose targeted advertising status is a value the parser does not know
        const cookie = `${COOKIE_NAME}=${encodeConsent({[TARGETED_ADVERTISING]: {status: 'pending'}})}`;

        // When the cookie is parsed
        // Then the parser returns undefined so an unknown value is never recorded as an explicit denial
        expect(parseKetchConsentCookie(cookie)).toBeUndefined();
    });

    test('returns undefined when the cookie value is not valid base64 JSON', () => {
        // Given cookie values that cannot be decoded as base64 JSON
        // When the cookie is parsed
        // Then the parser returns undefined instead of throwing, so a corrupted cookie cannot break the sign-in flow
        expect(parseKetchConsentCookie(`${COOKIE_NAME}=not-base64-json!!`)).toBeUndefined();
        expect(parseKetchConsentCookie(`${COOKIE_NAME}=${btoa('not json')}`)).toBeUndefined();
    });
});
