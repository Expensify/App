import getAvailableEuCountries from '@pages/ReimbursementAccount/utils/getAvailableEuCountries';

const localeCompare = (a: string, b: string) => a.localeCompare(b);

describe('getAvailableEuCountries', () => {
    it('sorts supported countries by localized name, not by country code', () => {
        // LT/LU/LV are alphabetical by code but Latvia/Lithuania/Luxembourg by name
        const result = getAvailableEuCountries({EUR: ['LV', 'LT', 'LU', 'BE']}, 'EUR', localeCompare);
        expect(Object.values(result)).toEqual(['Belgium', 'Latvia', 'Lithuania', 'Luxembourg']);
    });

    it('falls back to the hard-coded supported countries (sorted by name) when the backend list is unavailable', () => {
        const result = getAvailableEuCountries(undefined, 'EUR', localeCompare);
        expect(Object.values(result)).toEqual(['Belgium', 'Denmark', 'Finland', 'Ireland', 'Latvia', 'Lithuania', 'Luxembourg', 'Netherlands', 'Poland', 'Spain', 'Sweden']);
    });

    it('returns no countries for an unsupported settlement currency', () => {
        expect(getAvailableEuCountries({EUR: ['BE']}, 'USD', localeCompare)).toEqual({});
    });
});
