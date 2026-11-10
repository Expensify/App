import {mergePolicyRecentlyUsedCurrencies} from '@libs/actions/IOU/MoneyRequestBuilder';

describe('mergePolicyRecentlyUsedCurrencies', () => {
    it('prepends the new currency and deduplicates the stored list', () => {
        expect(mergePolicyRecentlyUsedCurrencies('EUR', ['USD', 'EUR'])).toEqual(['EUR', 'USD']);
    });

    it('returns the stored list untouched when no currency is given', () => {
        expect(mergePolicyRecentlyUsedCurrencies(undefined, ['USD', 'EUR'])).toEqual(['USD', 'EUR']);
    });

    it('handles a missing stored list', () => {
        expect(mergePolicyRecentlyUsedCurrencies('EUR', undefined)).toEqual(['EUR']);
        expect(mergePolicyRecentlyUsedCurrencies(undefined, undefined)).toEqual([]);
    });

    // The server can write this NVP as an object rather than an array, which used to throw "n is not iterable" on the
    // spread and "mergedCurrencies.slice is not a function" on the no-currency branch.
    it('does not throw when the stored value is an object instead of an array', () => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- reproduces the malformed Onyx value the server can write, which the declared `string[]` type cannot express
        const malformedValue = JSON.parse('{"0":"USD","2":"EUR"}') as string[];

        expect(mergePolicyRecentlyUsedCurrencies('EUR', malformedValue)).toEqual(['EUR']);
        expect(mergePolicyRecentlyUsedCurrencies(undefined, malformedValue)).toEqual([]);
    });
});
