import {getCountryCode} from '@libs/CountryUtils';

describe('CountryUtils', () => {
    describe('getCountryCode', () => {
        it('should return the same value if it is already a valid country code', () => {
            expect(getCountryCode('US')).toBe('US');
            expect(getCountryCode('CA')).toBe('CA');
            expect(getCountryCode('GB')).toBe('GB');
            expect(getCountryCode('EG')).toBe('EG');
        });

        it('should return the country code when given a country name', () => {
            expect(getCountryCode('United States')).toBe('US');
            expect(getCountryCode('Canada')).toBe('CA');
            expect(getCountryCode('United Kingdom')).toBe('GB');
            expect(getCountryCode('Egypt')).toBe('EG');
        });

        it('should return original value for invalid country names or codes', () => {
            expect(getCountryCode('Invalid Country')).toBe('Invalid Country');
            expect(getCountryCode('XX')).toBe('XX');
            expect(getCountryCode('123')).toBe('123');
            expect(getCountryCode('MISSING TRANSLATION')).toBe('MISSING TRANSLATION');
        });

        it('should handle edge cases with special characters', () => {
            expect(getCountryCode('Bosnia & Herzegovina')).toBe('BA');
        });

        it('should be case sensitive for country names', () => {
            expect(getCountryCode('united states')).toBe('united states');
            expect(getCountryCode('UNITED STATES')).toBe('UNITED STATES');
            expect(getCountryCode('United States')).toBe('US');
        });

        it('should convert common country names to codes', () => {
            expect(getCountryCode('United States')).toBe('US');
        });

        it('should handle multiple country formats correctly', () => {
            const testCases = [
                {name: 'Afghanistan', code: 'AF'},
                {name: 'Australia', code: 'AU'},
                {name: 'Brazil', code: 'BR'},
                {name: 'China', code: 'CN'},
                {name: 'France', code: 'FR'},
                {name: 'Germany', code: 'DE'},
                {name: 'India', code: 'IN'},
                {name: 'Japan', code: 'JP'},
                {name: 'Mexico', code: 'MX'},
                {name: 'Russia', code: 'RU'},
            ];

            testCases.forEach(({name, code}) => {
                expect(getCountryCode(name)).toBe(code);
                expect(getCountryCode(code)).toBe(code);
            });
        });
    });
});
