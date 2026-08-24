import HttpsError from '@libs/Errors/HttpsError';
import isNonAuthoritativeFailure from '@libs/Errors/isNonAuthoritativeFailure';

import CONST from '@src/CONST';

describe('isNonAuthoritativeFailure', () => {
    describe('no response ever arrived', () => {
        // All of these came off real give-up lines in production. None equals CONST.ERROR.FAILED_TO_FETCH, which is
        // why checking the message matched ~1% of real failures.
        it.each([
            // iOS nitro-fetch loses the real message and reports this instead.
            ['Unknown St13runtime_error error.'],
            // The host suffix is what breaks `=== CONST.ERROR.FAILED_TO_FETCH`.
            ['Failed to fetch (www.expensify.com)'],
            ['Load failed (www.expensify.com)'],
            ['Network request failed'],
            ['Failed to reauthenticate'],
            ['Unable to reauthenticate because we are offline'],
        ])('treats the plain Error %p as non-authoritative', (message) => {
            expect(isNonAuthoritativeFailure(new Error(message))).toBe(true);
        });

        it('treats an HttpsError with no status as non-authoritative', () => {
            // What HttpUtils throws in forced-offline test mode, where nothing leaves the device.
            expect(isNonAuthoritativeFailure(new HttpsError({message: CONST.ERROR.FAILED_TO_FETCH}))).toBe(true);
        });

        it('treats a non-Error rejection as non-authoritative', () => {
            expect(isNonAuthoritativeFailure(undefined)).toBe(true);
            expect(isNonAuthoritativeFailure(null)).toBe(true);
        });
    });

    describe('the server answered but the write never committed', () => {
        it.each([
            ['500'],
            ['502'],
            ['504'],
            ['520'],
            // Auth down or timed out — HttpUtils re-throws it as 666.
            ['666'],
        ])('treats EXPENSIFY_SERVICE_INTERRUPTED with status %p as non-authoritative', (status) => {
            expect(isNonAuthoritativeFailure(new HttpsError({message: CONST.ERROR.EXPENSIFY_SERVICE_INTERRUPTED, status}))).toBe(true);
        });

        it('treats a 429 throttle as non-authoritative because Auth never saw it', () => {
            expect(isNonAuthoritativeFailure(new HttpsError({message: CONST.ERROR.THROTTLED, status: '429'}))).toBe(true);
        });
    });

    describe('the server issued a verdict', () => {
        it.each([['400'], ['403'], ['404'], ['413']])('treats an HTTP %p as authoritative', (status) => {
            expect(isNonAuthoritativeFailure(new HttpsError({message: 'Bad Request', status}))).toBe(false);
        });

        it('treats a duplicate record as authoritative', () => {
            expect(isNonAuthoritativeFailure(new HttpsError({message: CONST.ERROR.DUPLICATE_RECORD, status: '400', title: CONST.ERROR_TITLE.DUPLICATE_RECORD}))).toBe(false);
        });

        it('treats an already-created resource as authoritative', () => {
            expect(isNonAuthoritativeFailure(new HttpsError({message: CONST.ERROR.ALREADY_CREATED, status: '666'}))).toBe(false);
        });
    });
});
