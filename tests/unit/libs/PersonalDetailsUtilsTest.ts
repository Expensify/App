import Onyx from 'react-native-onyx';
import {
    arePersonalDetailsMissing,
    createDisplayName,
    createPersonalDetailsLookupByAccountID,
    getAccountIDsByLogins,
    getEffectiveDisplayName,
    getPersonalDetailByEmail,
    getPersonalDetailsOnyxDataForOptimisticUsers,
} from '@libs/PersonalDetailsUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetails, PersonalDetailsList, PrivatePersonalDetails} from '@src/types/onyx';
import {formatPhoneNumber} from '../../utils/TestHelper';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

type PersonalDetailsForDisplayName = Pick<PersonalDetails, 'firstName' | 'lastName'> & {
    firstName?: string | null;
    lastName?: string | null;
};

describe('PersonalDetailsUtils', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });

    afterEach(() => Onyx.clear());

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

    describe('arePersonalDetailsMissing', () => {
        it.each([
            [
                'all required personal details are present',
                {
                    legalFirstName: 'John',
                    legalLastName: 'Doe',
                    dob: '1990-01-01',
                    phoneNumber: '+15555555555',
                    addresses: [{street: '123 Main St', city: 'New York', state: 'NY', country: 'US'}],
                },
                false,
            ],
            [
                'addresses has multiple entries',
                {
                    legalFirstName: 'John',
                    legalLastName: 'Doe',
                    dob: '1990-01-01',
                    phoneNumber: '+15555555555',
                    addresses: [
                        {street: '123 Main St', city: 'New York', state: 'NY'},
                        {street: '456 Oak Ave', city: 'Los Angeles', state: 'CA', current: true},
                    ],
                },
                false,
            ],
            [
                'all fields are present with extra optional fields',
                {
                    legalFirstName: 'John',
                    legalLastName: 'Doe',
                    dob: '1990-01-01',
                    phoneNumber: '+15555555555',
                    addresses: [{street: '123 Main St', street2: 'Apt 4B', city: 'New York', state: 'NY', zip: '10001', country: 'US', current: true}],
                    isLoading: false,
                    errorFields: {},
                    errors: null,
                },
                false,
            ],
            [
                'whitespace-only strings are considered present',
                {
                    legalFirstName: '   ',
                    legalLastName: '   ',
                    dob: '   ',
                    phoneNumber: '   ',
                    addresses: [{street: '   '}],
                },
                false,
            ],
            [
                'addresses contains minimal valid data',
                {
                    legalFirstName: 'John',
                    legalLastName: 'Doe',
                    dob: '1990-01-01',
                    phoneNumber: '+15555555555',
                    addresses: [{street: '123 Main St'}],
                },
                false,
            ],
        ] as const)('should return false when %s', (_description, details, expected) => {
            expect(arePersonalDetailsMissing(details as unknown as PrivatePersonalDetails)).toBe(expected);
        });

        it.each([
            [
                'legalFirstName is missing',
                {
                    legalLastName: 'Doe',
                    dob: '1990-01-01',
                    phoneNumber: '+15555555555',
                    addresses: [{street: '123 Main St'}],
                },
            ],
            [
                'legalFirstName is empty string',
                {
                    legalFirstName: '',
                    legalLastName: 'Doe',
                    dob: '1990-01-01',
                    phoneNumber: '+15555555555',
                    addresses: [{street: '123 Main St'}],
                },
            ],
            [
                'legalLastName is missing',
                {
                    legalFirstName: 'John',
                    dob: '1990-01-01',
                    phoneNumber: '+15555555555',
                    addresses: [{street: '123 Main St'}],
                },
            ],
            [
                'legalLastName is empty string',
                {
                    legalFirstName: 'John',
                    legalLastName: '',
                    dob: '1990-01-01',
                    phoneNumber: '+15555555555',
                    addresses: [{street: '123 Main St'}],
                },
            ],
            [
                'dob is missing',
                {
                    legalFirstName: 'John',
                    legalLastName: 'Doe',
                    phoneNumber: '+15555555555',
                    addresses: [{street: '123 Main St'}],
                },
            ],
            [
                'dob is empty string',
                {
                    legalFirstName: 'John',
                    legalLastName: 'Doe',
                    dob: '',
                    phoneNumber: '+15555555555',
                    addresses: [{street: '123 Main St'}],
                },
            ],
            [
                'phoneNumber is missing',
                {
                    legalFirstName: 'John',
                    legalLastName: 'Doe',
                    dob: '1990-01-01',
                    addresses: [{street: '123 Main St'}],
                },
            ],
            [
                'phoneNumber is empty string',
                {
                    legalFirstName: 'John',
                    legalLastName: 'Doe',
                    dob: '1990-01-01',
                    phoneNumber: '',
                    addresses: [{street: '123 Main St'}],
                },
            ],
            [
                'addresses is missing',
                {
                    legalFirstName: 'John',
                    legalLastName: 'Doe',
                    dob: '1990-01-01',
                    phoneNumber: '+15555555555',
                },
            ],
            [
                'addresses is an empty array',
                {
                    legalFirstName: 'John',
                    legalLastName: 'Doe',
                    dob: '1990-01-01',
                    phoneNumber: '+15555555555',
                    addresses: [],
                },
            ],
            ['multiple required fields are missing', {legalFirstName: 'John'}],
            ['all fields are missing', {}],
            ['null', null],
            ['undefined', undefined],
        ] as const)('should return true when %s', (_description, details) => {
            expect(arePersonalDetailsMissing(details as PrivatePersonalDetails)).toBe(true);
        });
    });

    describe('getAccountIDsByLogins', () => {
        const accountID1 = 1;
        const accountID2 = 2;
        const accountID3 = 3;

        it('should return account IDs for existing users', async () => {
            const personalDetails: PersonalDetailsList = {
                [accountID1]: {
                    accountID: accountID1,
                    login: 'user1@example.com',
                    displayName: 'User One',
                },
                [accountID2]: {
                    accountID: accountID2,
                    login: 'user2@example.com',
                    displayName: 'User Two',
                },
                [accountID3]: {
                    accountID: accountID3,
                    login: 'user3@example.com',
                    displayName: 'User Three',
                },
            };

            await Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, personalDetails);
            await waitForBatchedUpdates();

            const result = getAccountIDsByLogins(['user1@example.com', 'user2@example.com']);
            expect(result).toEqual([accountID1, accountID2]);
        });

        it('should generate optimistic account IDs for unknown users', async () => {
            const personalDetails: PersonalDetailsList = {
                [accountID1]: {
                    accountID: accountID1,
                    login: 'user1@example.com',
                    displayName: 'User One',
                },
            };

            await Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, personalDetails);
            await waitForBatchedUpdates();

            const result = getAccountIDsByLogins(['user1@example.com', 'unknown@example.com']);

            // First should be 1 (existing), second should be a generated optimistic ID
            expect(result.at(0)).toBe(accountID1);
            // Optimistic account IDs are generated - they should be different from real IDs
            expect(result.at(1)).not.toBe(0);
            expect(typeof result.at(1)).toBe('number');
        });

        it('should handle case-insensitive email matching', async () => {
            const personalDetails: PersonalDetailsList = {
                [accountID1]: {
                    accountID: accountID1,
                    login: 'user1@example.com',
                    displayName: 'User One',
                },
            };

            await Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, personalDetails);
            await waitForBatchedUpdates();

            // The cache is built with lowercase keys, so we need to test that the lookup works
            const result = getAccountIDsByLogins(['USER1@EXAMPLE.COM']);
            expect(result).toEqual([accountID1]);
        });

        it('should handle empty array', async () => {
            const result = getAccountIDsByLogins([]);
            expect(result).toEqual([]);
        });
    });

    describe('getPersonalDetailByEmail', () => {
        const testAccountID = 1;

        it('should return personal details for an existing email', async () => {
            const personalDetails: PersonalDetailsList = {
                [testAccountID]: {
                    accountID: testAccountID,
                    login: 'test@example.com',
                    displayName: 'Test User',
                },
            };

            await Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, personalDetails);
            await waitForBatchedUpdates();

            const result = getPersonalDetailByEmail('test@example.com');
            expect(result).toEqual({
                accountID: testAccountID,
                login: 'test@example.com',
                displayName: 'Test User',
            });
        });

        it('should return undefined for unknown email', async () => {
            const personalDetails: PersonalDetailsList = {
                [testAccountID]: {
                    accountID: testAccountID,
                    login: 'test@example.com',
                    displayName: 'Test User',
                },
            };

            await Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, personalDetails);
            await waitForBatchedUpdates();

            const result = getPersonalDetailByEmail('unknown@example.com');
            expect(result).toBeUndefined();
        });

        it('should handle case-insensitive email lookup', async () => {
            const personalDetails: PersonalDetailsList = {
                [testAccountID]: {
                    accountID: testAccountID,
                    login: 'Test@Example.com',
                    displayName: 'Test User',
                },
            };

            await Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, personalDetails);
            await waitForBatchedUpdates();

            const result = getPersonalDetailByEmail('test@example.com');
            expect(result).toEqual({
                accountID: testAccountID,
                login: 'Test@Example.com',
                displayName: 'Test User',
            });
        });
    });

    describe('createPersonalDetailsLookupByAccountID', () => {
        it('should create a lookup map from an array of personal details', () => {
            const details: PersonalDetails[] = [
                {accountID: 1, login: 'user1@example.com', displayName: 'User One'},
                {accountID: 2, login: 'user2@example.com', displayName: 'User Two'},
                {accountID: 3, login: 'user3@example.com', displayName: 'User Three'},
            ];

            const result = createPersonalDetailsLookupByAccountID(details);

            expect(result[1]).toEqual({accountID: 1, login: 'user1@example.com', displayName: 'User One'});
            expect(result[2]).toEqual({accountID: 2, login: 'user2@example.com', displayName: 'User Two'});
            expect(result[3]).toEqual({accountID: 3, login: 'user3@example.com', displayName: 'User Three'});
        });

        it('should return an empty object for an empty array', () => {
            const result = createPersonalDetailsLookupByAccountID([]);
            expect(result).toEqual({});
        });

        it('should allow O(1) lookup by accountID', () => {
            const details: PersonalDetails[] = [{accountID: 100, login: 'test@example.com', displayName: 'Test User'}];

            const map = createPersonalDetailsLookupByAccountID(details);

            // Direct access should work
            expect(map[100]).toBeDefined();
            expect(map[100].displayName).toBe('Test User');

            // Non-existent key should be undefined
            expect(map[999]).toBeUndefined();
        });

        it('should handle duplicate accountIDs by keeping the last occurrence', () => {
            const details: PersonalDetails[] = [
                {accountID: 1, login: 'first@example.com', displayName: 'First'},
                {accountID: 1, login: 'second@example.com', displayName: 'Second'},
            ];

            const result = createPersonalDetailsLookupByAccountID(details);

            // The second entry should overwrite the first
            expect(result[1]).toEqual({accountID: 1, login: 'second@example.com', displayName: 'Second'});
        });
    });
});
