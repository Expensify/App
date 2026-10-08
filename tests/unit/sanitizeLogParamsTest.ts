import sanitizeLogParams, {sanitizeUrlForLogging} from '@libs/sanitizeLogParams';

describe('sanitizeLogParams', () => {
    it('redacts known sensitive keys', () => {
        const result = sanitizeLogParams({authToken: 'secret', password: 'hunter2', token: 'abc'});
        expect(result).toEqual({authToken: '<redacted>', password: '<redacted>', token: '<redacted>'});
    });

    it('redacts card number and CVV so payment card details never reach the logs', () => {
        const result = sanitizeLogParams({
            command: 'AddPaymentCard',
            data: {
                cardNumber: '4111111111111111',
                cardCVV: '123',
                cardMonth: '04',
                cardYear: '2030',
                addressZip: '94105',
            },
        });

        expect(result).toEqual({
            command: 'AddPaymentCard',
            data: {
                cardNumber: '<redacted>',
                cardCVV: '<redacted>',
                cardMonth: '04',
                cardYear: '2030',
                addressZip: '94105',
            },
        });
    });

    it('leaves non-sensitive keys untouched', () => {
        const result = sanitizeLogParams({policyID: '1', currency: 'USD'});
        expect(result).toEqual({policyID: '1', currency: 'USD'});
    });

    it('redacts sensitive keys nested inside arrays', () => {
        const result = sanitizeLogParams({cards: [{cardNumber: '4111111111111111'}, {cardNumber: '5500000000000004'}]});
        expect(result).toEqual({cards: [{cardNumber: '<redacted>'}, {cardNumber: '<redacted>'}]});
    });

    it('stops recursing past the max depth', () => {
        const deep = {a: {b: {c: {d: {e: {f: {cardNumber: '4111111111111111'}}}}}}};
        const result = sanitizeLogParams(deep);

        // Beyond depth 5 the sanitizer returns the object as-is, so the deeply-nested value is not redacted.
        expect(result.a.b.c.d.e.f.cardNumber).toBe('4111111111111111');
    });

    it('returns primitives unchanged', () => {
        expect(sanitizeLogParams('plain string')).toBe('plain string');
        expect(sanitizeLogParams(42)).toBe(42);
        expect(sanitizeLogParams(null)).toBeNull();
    });
});

describe('sanitizeUrlForLogging', () => {
    it('redacts the validate code in /v/:accountID/:validateCode paths', () => {
        expect(sanitizeUrlForLogging('/v/12345/abcdef')).toBe('/v/12345/<redacted>');
    });

    it('redacts the validate code in /u/:accountID/:validateCode paths', () => {
        expect(sanitizeUrlForLogging('/u/12345/abcdef')).toBe('/u/12345/<redacted>');
    });

    it('strips the query string', () => {
        expect(sanitizeUrlForLogging('https://example.com/path?authToken=secret')).toBe('https://example.com/path?<redacted>');
    });
});
