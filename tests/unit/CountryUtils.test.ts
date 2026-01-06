import {getCountryCode, normalizeCountryCode} from '@libs/CountryUtils';
import type {Address} from '@src/types/onyx/PrivatePersonalDetails';

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

            for (const {name, code} of testCases) {
                expect(getCountryCode(name)).toBe(code);
                expect(getCountryCode(code)).toBe(code);
            }
        });
    });

    describe('normalizeCountryCode', () => {
        it('should return undefined when data is undefined', () => {
            expect(normalizeCountryCode(undefined)).toBeUndefined();
        });

        it('should return data unchanged when country field is missing', () => {
            const data = {street: '123 Main St', city: 'New York', state: 'NY'};
            expect(normalizeCountryCode(data)).toEqual(data);
        });

        it('should return data unchanged when country is undefined', () => {
            const data = {street: '123 Main St', city: 'New York', state: 'NY', country: undefined};
            expect(normalizeCountryCode(data)).toEqual(data);
        });

        it('should convert country name to country code', () => {
            const data = {street: '123 Main St', city: 'New York', state: 'NY', country: 'United States'} as unknown as Address;
            const result = normalizeCountryCode(data);
            expect(result).toEqual({street: '123 Main St', city: 'New York', state: 'NY', country: 'US'});
        });

        it('should preserve country code if already a valid code', () => {
            const data: Address = {street: '456 Oak Ave', city: 'Toronto', state: 'ON', country: 'CA'};
            const result = normalizeCountryCode(data);
            expect(result).toEqual({street: '456 Oak Ave', city: 'Toronto', state: 'ON', country: 'CA'});
        });

        it('should handle multiple country name conversions', () => {
            const testCases = [
                {input: 'United States', expected: 'US'},
                {input: 'Canada', expected: 'CA'},
                {input: 'United Kingdom', expected: 'GB'},
                {input: 'Germany', expected: 'DE'},
                {input: 'France', expected: 'FR'},
                {input: 'Japan', expected: 'JP'},
                {input: 'Australia', expected: 'AU'},
            ];

            for (const {input, expected} of testCases) {
                const data = {street: '789 Test St', city: 'Test City', country: input} as unknown as Address;
                const result = normalizeCountryCode(data);
                expect(result?.country).toBe(expected);
            }
        });

        it('should preserve invalid country values', () => {
            const data = {street: '789 Test St', city: 'Test City', country: 'Invalid Country'} as unknown as Address;
            const result = normalizeCountryCode(data);
            expect(result).toEqual({street: '789 Test St', city: 'Test City', country: 'Invalid Country'});
        });

        it('should handle special characters in country names', () => {
            const data = {street: '123 Main St', city: 'Sarajevo', country: 'Bosnia & Herzegovina'} as unknown as Address;
            const result = normalizeCountryCode(data);
            expect(result).toEqual({street: '123 Main St', city: 'Sarajevo', country: 'BA'});
        });

        it('should be case sensitive when normalizing country names', () => {
            const dataLowerCase = {street: '789 Test St', city: 'Test City', country: 'united states'} as unknown as Address;
            const dataUpperCase = {street: '789 Test St', city: 'Test City', country: 'UNITED STATES'} as unknown as Address;
            const dataProperCase = {street: '789 Test St', city: 'Test City', country: 'United States'} as unknown as Address;

            expect(normalizeCountryCode(dataLowerCase)).toEqual({street: '789 Test St', city: 'Test City', country: 'united states'});
            expect(normalizeCountryCode(dataUpperCase)).toEqual({street: '789 Test St', city: 'Test City', country: 'UNITED STATES'});
            expect(normalizeCountryCode(dataProperCase)).toEqual({street: '789 Test St', city: 'Test City', country: 'US'});
        });

        it('should preserve all other fields in the data object', () => {
            const data = {
                street: '123 Main St',
                city: 'Los Angeles',
                state: 'CA',
                zipCode: '90001',
                country: 'United States',
            } as unknown as Address;
            const result = normalizeCountryCode(data);
            expect(result).toEqual({
                street: '123 Main St',
                city: 'Los Angeles',
                state: 'CA',
                zipCode: '90001',
                country: 'US',
            });
        });

        it('should handle MISSING TRANSLATION value', () => {
            const data = {street: '789 Test St', city: 'Test City', country: 'MISSING TRANSLATION'} as unknown as Address;
            const result = normalizeCountryCode(data);
            expect(result).toEqual({street: '789 Test St', city: 'Test City', country: 'MISSING TRANSLATION'});
        });
    });
});
