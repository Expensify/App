import Onyx from 'react-native-onyx';
import {createDisplayName, getEffectiveDisplayName, getPersonalDetailsOnyxDataForOptimisticUsers} from '@libs/PersonalDetailsUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetails} from '@src/types/onyx';
import {formatPhoneNumber} from '../../utils/TestHelper';

type PersonalDetailsForDisplayName = Pick<PersonalDetails, 'firstName' | 'lastName'> & {
    firstName?: string | null;
    lastName?: string | null;
};

describe('PersonalDetailsUtils', () => {
    describe('getEffectiveDisplayName', () => {
        test('should return undefined when personalDetail is undefined', () => {
            const result = getEffectiveDisplayName(formatPhoneNumber, undefined);
            expect(result).toBeUndefined();
        });

        test('should return undefined when personalDetail has neither login nor displayName', () => {
            const personalDetail: PersonalDetails = {accountID: 123};
            const result = getEffectiveDisplayName(formatPhoneNumber, personalDetail);
            expect(result).toBeUndefined();
        });

        test('should return displayName when login is empty or null but displayName exists', () => {
            const personalDetail1: PersonalDetails = {accountID: 123, displayName: 'John Doe', login: ''};
            const personalDetail2: PersonalDetails = {accountID: 456, displayName: 'Jane Smith', login: null as unknown as string}; // Simulate null login

            let result = getEffectiveDisplayName(formatPhoneNumber, personalDetail1);
            expect(result).toBe('John Doe');

            result = getEffectiveDisplayName(formatPhoneNumber, personalDetail2);
            expect(result).toBe('Jane Smith');
        });

        test('should return login (email) when only login exists (not a phone number)', () => {
            const personalDetail: PersonalDetails = {accountID: 123, login: 'john.doe@example.com'};
            const result = getEffectiveDisplayName(formatPhoneNumber, personalDetail);
            expect(result).toBe('john.doe@example.com');
        });

        test('should return national format for phone login if from the same region (US)', () => {
            const personalDetail: PersonalDetails = {accountID: 123, login: '+15551234567'};
            const result = getEffectiveDisplayName(formatPhoneNumber, personalDetail);
            expect(result).toBe('+1 555-123-4567');
        });

        test('should return international format for phone login if from a different region (GB)', () => {
            const personalDetail: PersonalDetails = {accountID: 123, login: '+442079460000'};
            const result = getEffectiveDisplayName(formatPhoneNumber, personalDetail);
            expect(result).toBe('+44 20 7946 0000');
        });

        test('should return formatted login (email) when both login and displayName exist (login takes precedence)', () => {
            const personalDetail: PersonalDetails = {
                accountID: 123,
                login: 'john.doe@example.com',
                displayName: 'John Doe Full Name',
            };
            const result = getEffectiveDisplayName(formatPhoneNumber, personalDetail);
            expect(result).toBe('john.doe@example.com');
        });

        test('should return formatted login (phone) when both login (same region) and displayName exist', () => {
            const personalDetail: PersonalDetails = {
                accountID: 123,
                login: '+15551234567',
                displayName: 'John Doe Full Name',
            };
            const result = getEffectiveDisplayName(formatPhoneNumber, personalDetail);
            expect(result).toBe('+1 555-123-4567');
        });

        test('should return formatted login (phone) when both login (different region) and displayName exist', () => {
            const personalDetail: PersonalDetails = {
                accountID: 123,
                login: '+442079460000',
                displayName: 'Jane Smith Full Name',
            };
            const result = getEffectiveDisplayName(formatPhoneNumber, personalDetail);
            expect(result).toBe('+44 20 7946 0000');
        });

        test('should correctly handle login with SMS domain', () => {
            const personalDetail: PersonalDetails = {
                accountID: 123,
                login: `+18005550000`,
                displayName: 'SMS User',
            };
            const result = getEffectiveDisplayName(formatPhoneNumber, personalDetail);
            expect(result).toBe('(800) 555-0000');
        });

        test('should fall back to displayName if formatted login is an empty string and displayName exists', () => {
            const personalDetail: PersonalDetails = {accountID: 123, login: '', displayName: 'Fallback Name'};
            const result = getEffectiveDisplayName(formatPhoneNumber, personalDetail);
            expect(result).toBe('Fallback Name');
        });
    });

    describe('getPersonalDetailsOnyxDataForOptimisticUsers', () => {
        test('should return correct optimistic and finally data', () => {
            const newLogins = ['3322076524', 'test2@test.com', '+14185438090'];
            const newAccountIDs = [1, 2, 3];
            const result = getPersonalDetailsOnyxDataForOptimisticUsers(newLogins, newAccountIDs, formatPhoneNumber);
            const expected = {
                optimisticData: [
                    {
                        key: ONYXKEYS.PERSONAL_DETAILS_LIST,
                        onyxMethod: 'merge',
                        value: {
                            // eslint-disable-next-line @typescript-eslint/naming-convention
                            '1': {
                                accountID: 1,
                                avatar: 'https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/default-avatar_15.png',
                                displayName: '3322076524',
                                isOptimisticPersonalDetail: true,
                                login: '3322076524',
                            },
                            // eslint-disable-next-line @typescript-eslint/naming-convention
                            '2': {
                                accountID: 2,
                                avatar: 'https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/default-avatar_18.png',
                                displayName: 'test2@test.com',
                                isOptimisticPersonalDetail: true,
                                login: 'test2@test.com',
                            },
                            // eslint-disable-next-line @typescript-eslint/naming-convention
                            '3': {
                                accountID: 3,
                                avatar: 'https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/default-avatar_6.png',
                                displayName: '(418) 543-8090',
                                isOptimisticPersonalDetail: true,
                                login: '+14185438090',
                            },
                        },
                    },
                ],
                finallyData: [
                    {
                        key: ONYXKEYS.PERSONAL_DETAILS_LIST,
                        onyxMethod: Onyx.METHOD.MERGE,
                        value: {
                            // eslint-disable-next-line @typescript-eslint/naming-convention
                            '1': null,
                            // eslint-disable-next-line @typescript-eslint/naming-convention
                            '2': null,
                            // eslint-disable-next-line @typescript-eslint/naming-convention
                            '3': null,
                        },
                    },
                ],
            };
            expect(result).toEqual(expected);
        });
    });

    describe('createDisplayName', () => {
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
});
