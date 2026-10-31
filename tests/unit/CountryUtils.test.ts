import {getCountryCode, normalizeCountryCode, resolveStateCode} from '@libs/CountryUtils';
import {getMicroSecondOnyxErrorWithMessage} from '@libs/ErrorUtils';

import type {Country} from '@src/CONST';
import type {PersonalDetailsForm} from '@src/types/form';
import type {Address} from '@src/types/onyx/PrivatePersonalDetails';

import createMock from '../utils/createMock';

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
            const data = {street: '123 Main St', city: 'New York', state: 'NY', country: 'United States'};
            // @ts-expect-error - Legacy addresses can contain country names before normalization.
            const result = normalizeCountryCode(data);
            expect(result).toEqual({street: '123 Main St', city: 'New York', state: 'NY', country: 'US'});
        });

        it('should preserve country code if already a valid code', () => {
            const data: Address = {street: '456 Oak Ave', city: 'Toronto', state: 'ON', country: 'CA'};
            const result = normalizeCountryCode(data);
            expect(result).toEqual({street: '456 Oak Ave', city: 'Toronto', state: 'ON', country: 'CA'});
        });

        it('should handle multiple country name conversions', () => {
            // Given legacy country names with known current codes.
            const testCases = [
                {input: 'United States', expected: 'US'},
                {input: 'Canada', expected: 'CA'},
                {input: 'United Kingdom', expected: 'GB'},
                {input: 'Germany', expected: 'DE'},
                {input: 'France', expected: 'FR'},
                {input: 'Japan', expected: 'JP'},
                {input: 'Australia', expected: 'AU'},
            ];

            // When each legacy value reaches the real normalizer.
            for (const {input, expected} of testCases) {
                const data = {street: '789 Test St', city: 'Test City', country: input};
                // @ts-expect-error - Legacy addresses can contain country names before normalization.
                const result = normalizeCountryCode(data);
                // Then the actual returned object must contain the corresponding country code.
                expect(result).toHaveProperty('country', expected);
            }
        });

        it('should preserve invalid country values', () => {
            const data = {street: '789 Test St', city: 'Test City', country: 'Invalid Country'};
            // @ts-expect-error - This deliberately exercises an invalid country value.
            const result = normalizeCountryCode(data);
            expect(result).toEqual({street: '789 Test St', city: 'Test City', country: 'Invalid Country'});
        });

        it('should handle special characters in country names', () => {
            const data = {street: '123 Main St', city: 'Sarajevo', country: 'Bosnia & Herzegovina'};
            // @ts-expect-error - Legacy addresses can contain country names before normalization.
            const result = normalizeCountryCode(data);
            expect(result).toEqual({street: '123 Main St', city: 'Sarajevo', country: 'BA'});
        });

        it('should be case sensitive when normalizing country names', () => {
            const dataLowerCase = {street: '789 Test St', city: 'Test City', country: 'united states'};
            const dataUpperCase = {street: '789 Test St', city: 'Test City', country: 'UNITED STATES'};
            const dataProperCase = {street: '789 Test St', city: 'Test City', country: 'United States'};

            // @ts-expect-error - Legacy addresses can contain country names before normalization.
            expect(normalizeCountryCode(dataLowerCase)).toEqual({street: '789 Test St', city: 'Test City', country: 'united states'});
            // @ts-expect-error - Legacy addresses can contain country names before normalization.
            expect(normalizeCountryCode(dataUpperCase)).toEqual({street: '789 Test St', city: 'Test City', country: 'UNITED STATES'});
            // @ts-expect-error - Legacy addresses can contain country names before normalization.
            expect(normalizeCountryCode(dataProperCase)).toEqual({street: '789 Test St', city: 'Test City', country: 'US'});
        });

        it('should preserve all other fields in the data object', () => {
            const data = {
                street: '123 Main St',
                city: 'Los Angeles',
                state: 'CA',
                zipCode: '90001',
                country: 'United States',
            };
            // @ts-expect-error - Legacy addresses can contain country names before normalization.
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
            const data = {street: '789 Test St', city: 'Test City', country: 'MISSING TRANSLATION'};
            // @ts-expect-error - This deliberately exercises a missing translation value.
            const result = normalizeCountryCode(data);
            expect(result).toEqual({street: '789 Test St', city: 'Test City', country: 'MISSING TRANSLATION'});
        });
    });

    it('preserves empty, absent, general-string and own-key lookup categories', () => {
        // Given finite model values and arbitrary persisted strings, including inherited object names.
        const finiteCountry: Country | '' = 'US';
        const optionalFiniteCountry: Country | '' | undefined = undefined;
        const rawCountry = 'constructor';
        const optionalRawCountry: string | undefined = undefined;

        // When the real lookup is used, these assignments check each public overload's return category.
        const finiteResult: Country | '' = getCountryCode(finiteCountry);
        const optionalFiniteResult: Country | '' | undefined = getCountryCode(optionalFiniteCountry);
        const rawResult: string = getCountryCode(rawCountry);
        const optionalRawResult: string | undefined = getCountryCode(optionalRawCountry);

        // Then only own country-name entries are translated and every other input keeps its value.
        expect(finiteResult).toBe('US');
        expect(optionalFiniteResult).toBeUndefined();
        expect(rawResult).toBe('constructor');
        expect(optionalRawResult).toBeUndefined();
        expect(getCountryCode('toString')).toBe('toString');
        expect(getCountryCode('')).toBe('');
        expect(getCountryCode('us')).toBe('us');
    });

    it('keeps the reference and country property presence of falsy address inputs', () => {
        // Given the distinct supported absence and empty-string shapes in Address.
        const missing: Address = {street: '123 Main St'};
        const explicitUndefined: Address = {street: '123 Main St', country: undefined};
        const empty: Address = {street: '123 Main St', country: ''};

        // When normalization sees no truthy country.
        // Then it returns the exact original objects.
        expect(normalizeCountryCode(missing)).toBe(missing);
        expect(normalizeCountryCode(explicitUndefined)).toBe(explicitUndefined);
        expect(normalizeCountryCode(empty)).toBe(empty);
        expect(Object.hasOwn(normalizeCountryCode(missing), 'country')).toBe(false);
        expect(Object.hasOwn(normalizeCountryCode(explicitUndefined), 'country')).toBe(true);
        expect(normalizeCountryCode(empty).country).toBe('');
    });

    it('characterizes deliberately invalid nested null without claiming a supported country producer', () => {
        // Given malformed historical data, outside the finite Address model and the live COUNTRY hook contract.
        const data = {street: '123 Main St', country: null};

        // When this exact invalid expression reaches the existing falsy guard.
        // @ts-expect-error - Nested null is deliberately invalid Address data, not a supported UI input.
        const result = normalizeCountryCode(data);

        // Then the guard retains both reference and explicit property presence.
        expect(result).toBe(data);
        expect(Object.hasOwn(result, 'country')).toBe(true);
        expect(result).toHaveProperty('country', null);
    });

    it('preserves complete form fields, metadata and nested references in a shallow copy', () => {
        // Given a form from the finite form owner with server metadata and an extension value.
        const errors = getMicroSecondOnyxErrorWithMessage('Server error', 123);
        const extension = {source: 'profile'};
        const data = {
            ...createMock<PersonalDetailsForm>({country: 'CA', legalFirstName: 'Alex', phoneNumber: '123', isLoading: true, errors}),
            extension,
        };

        // When a truthy country is normalized, the Form overload preserves its complete category.
        const result: PersonalDetailsForm = normalizeCountryCode(data);

        // Then values and nested references survive while the containing object is copied.
        expect(result).not.toBe(data);
        expect(result).toEqual(data);
        expect(result.errors).toBe(errors);
        expect(result.isLoading).toBe(true);
        expect(result.legalFirstName).toBe('Alex');
        expect(result.phoneNumber).toBe('123');
        expect(result).toHaveProperty('extension', extension);
        expect('extension' in result && result.extension).toBe(extension);
    });

    it('retains required and optional Form and Address return categories', () => {
        // Given both production object categories, with absence represented separately.
        const form = createMock<PersonalDetailsForm>({country: 'US', city: 'New York'});
        const address: Address = {street: '123 Main St', country: 'US'};
        const optionalForm: PersonalDetailsForm | undefined = form;
        const optionalAddress: Address | undefined = address;
        const requiredUnion: PersonalDetailsForm | Address = [form, address].find((value) => 'street' in value) ?? form;
        const optionalUnion: PersonalDetailsForm | Address | undefined = [requiredUnion].at(0);

        // When the declared categories are checked, no caller-selected generic result is promised.
        const formResult: PersonalDetailsForm = normalizeCountryCode(form);
        const addressResult: Address = normalizeCountryCode(address);
        const absentResult: undefined = normalizeCountryCode(undefined);
        const optionalFormResult: PersonalDetailsForm | undefined = normalizeCountryCode(optionalForm);
        const optionalAddressResult: Address | undefined = normalizeCountryCode(optionalAddress);
        const unionResult: PersonalDetailsForm | Address = normalizeCountryCode(requiredUnion);
        const optionalUnionResult: PersonalDetailsForm | Address | undefined = normalizeCountryCode(optionalUnion);

        // Then runtime values also retain their full original shapes and absence.
        expect(formResult).toEqual(form);
        expect(addressResult).toEqual(address);
        expect(absentResult).toBeUndefined();
        expect(optionalFormResult).toEqual(optionalForm);
        expect(optionalAddressResult).toEqual(optionalAddress);
        expect(unionResult).toEqual(requiredUnion);
        expect(optionalUnionResult).toEqual(optionalUnion);
    });

    describe('resolveStateCode', () => {
        it('turns a full US state name into its code, whatever the case', () => {
            // Given a stored address that names its state in full
            // When the state is resolved for the state picker
            // Then the picker gets the 2-letter code it lists states by
            expect(resolveStateCode('California')).toBe('CA');
            expect(resolveStateCode('new york')).toBe('NY');
        });

        it('keeps a code, an empty value and a name it does not know as they are', () => {
            // Given states that are already codes, missing, or unknown
            // When they are resolved
            // Then they come back unchanged, so the caller decides what to do with an unknown name
            expect(resolveStateCode('TX')).toBe('TX');
            expect(resolveStateCode('')).toBe('');
            expect(resolveStateCode('Ontario')).toBe('Ontario');
        });
    });
});
