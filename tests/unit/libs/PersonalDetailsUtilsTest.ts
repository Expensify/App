import Onyx from 'react-native-onyx';
import {createDisplayName} from '@libs/PersonalDetailsUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetails} from '@src/types/onyx';
import {formatPhoneNumber} from '../../utils/TestHelper';

type PersonalDetailsForDisplayName = Pick<PersonalDetails, 'firstName' | 'lastName'> & {
    firstName?: string | null;
    lastName?: string | null;
};

describe('PersonalDetailsUtils - createDisplayName', () => {
    beforeAll(() => {
        Onyx.merge(ONYXKEYS.COUNTRY_CODE, 1);
    });

    // Test Group 1: Scenarios where `passedPersonalDetails` is null or undefined
    describe('when passedPersonalDetails is null or undefined', () => {
        test('should return formatted email login when passedPersonalDetails is null', () => {
            const login = 'test@example.com';
            const result = createDisplayName(login, null, formatPhoneNumber);
            // Expect email to remain unchanged by formatPhoneNumber
            expect(result).toBe(login);
        });

        test('should return formatted US phone login when passedPersonalDetails is undefined', () => {
            const login = '+15551234567';
            const result = createDisplayName(login, undefined, formatPhoneNumber);
            // Expect US phone number to be formatted based on country code
            expect(result).toBe('+1 555-123-4567');
        });

        test('should return formatted international phone login when passedPersonalDetails is undefined', () => {
            const login = '+442079460000'; // UK number
            const result = createDisplayName(login, undefined, formatPhoneNumber);
            expect(result).toBe('+44 20 7946 0000');
        });

        test('should return formatted SMS login (stripped of suffix) when passedPersonalDetails is null', () => {
            const login = '+18005550000@expensify.sms';
            const result = createDisplayName(login, null, formatPhoneNumber);
            // This test assumes `formatPhoneNumber` correctly strips the `@expensify.sms` suffix
            // and formats the remaining phone number, as implied by the function's internal comment.
            expect(result).toBe('(800) 555-0000');
        });
    });

    // Test Group 2: Scenarios where `passedPersonalDetails` is provided
    describe('when passedPersonalDetails is provided', () => {
        // Scenario 2.1: Both firstName and lastName are present
        test('should return full name when firstName and lastName are both non-empty', () => {
            const login = 'test@example.com';
            const personalDetails: PersonalDetailsForDisplayName = {firstName: 'John', lastName: 'Doe'};
            const result = createDisplayName(login, personalDetails, formatPhoneNumber);
            expect(result).toBe('John Doe');
        });

        // Scenario 2.2: Only firstName is present
        test('should return firstName when only firstName is present (lastName is empty string)', () => {
            const login = 'test@example.com';
            const personalDetails: PersonalDetailsForDisplayName = {firstName: 'Jane', lastName: ''};
            const result = createDisplayName(login, personalDetails, formatPhoneNumber);
            expect(result).toBe('Jane');
        });

        test('should return firstName when only firstName is present (lastName is undefined)', () => {
            const login = 'test@example.com';
            const personalDetails: PersonalDetailsForDisplayName = {firstName: 'Jane', lastName: undefined};
            const result = createDisplayName(login, personalDetails, formatPhoneNumber);
            expect(result).toBe('Jane');
        });

        test('should return firstName when only firstName is present (lastName is null)', () => {
            const login = 'test@example.com';
            const personalDetails: PersonalDetailsForDisplayName = {firstName: 'Jane', lastName: undefined};
            const result = createDisplayName(login, personalDetails, formatPhoneNumber);
            expect(result).toBe('Jane');
        });

        // Scenario 2.3: Only lastName is present
        test('should return lastName when only lastName is present (firstName is empty string)', () => {
            const login = 'test@example.com';
            const personalDetails: PersonalDetailsForDisplayName = {firstName: '', lastName: 'Smith'};
            const result = createDisplayName(login, personalDetails, formatPhoneNumber);
            expect(result).toBe('Smith');
        });

        test('should return lastName when only lastName is present (firstName is undefined)', () => {
            const login = 'test@example.com';
            const personalDetails: PersonalDetailsForDisplayName = {firstName: undefined, lastName: 'Smith'};
            const result = createDisplayName(login, personalDetails, formatPhoneNumber);
            expect(result).toBe('Smith');
        });

        test('should return lastName when only lastName is present (firstName is null)', () => {
            const login = 'test@example.com';
            const personalDetails: PersonalDetailsForDisplayName = {firstName: undefined, lastName: 'Smith'};
            const result = createDisplayName(login, personalDetails, formatPhoneNumber);
            expect(result).toBe('Smith');
        });

        // Scenario 2.4: Neither firstName nor lastName is present (empty, null, or undefined)
        test('should fall back to formatted login when firstName and lastName are empty strings', () => {
            const login = 'user@example.com';
            const personalDetails: PersonalDetailsForDisplayName = {firstName: '', lastName: ''};
            const result = createDisplayName(login, personalDetails, formatPhoneNumber);
            expect(result).toBe(login);
        });

        test('should fall back to formatted login when firstName and lastName are null', () => {
            const login = 'another@example.com';
            const personalDetails: PersonalDetailsForDisplayName = {firstName: undefined, lastName: undefined};
            const result = createDisplayName(login, personalDetails, formatPhoneNumber);
            expect(result).toBe(login);
        });

        test('should fall back to formatted login when firstName and lastName are undefined', () => {
            const login = '+442079460000'; // Use an international number to verify formatting fallback
            const personalDetails: PersonalDetailsForDisplayName = {firstName: undefined, lastName: undefined};
            const result = createDisplayName(login, personalDetails, formatPhoneNumber);
            expect(result).toBe('+44 20 7946 0000'); // Expect international phone number to be formatted
        });

        test('should fall back to formatted SMS login when firstName and lastName are empty', () => {
            const login = '+18005550000@expensify.sms';
            const personalDetails: PersonalDetailsForDisplayName = {firstName: '', lastName: ''};
            const result = createDisplayName(login, personalDetails, formatPhoneNumber);
            expect(result).toBe('(800) 555-0000');
        });

        test('should trim leading/trailing spaces from a single name component', () => {
            const login = 'test@example.com';
            const personalDetails: PersonalDetailsForDisplayName = {firstName: '  SingleName  ', lastName: ''};
            const result = createDisplayName(login, personalDetails, formatPhoneNumber);
            expect(result).toBe('SingleName');
        });

        test('should correctly handle spaces when one name component is empty', () => {
            const login = 'test@example.com';
            const personalDetails: PersonalDetailsForDisplayName = {firstName: '', lastName: '  Last  '};
            const result = createDisplayName(login, personalDetails, formatPhoneNumber);
            expect(result).toBe('Last');
        });
    });
});
