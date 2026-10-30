import CONST from '@src/CONST';
import * as UserUtils from '@src/libs/UserUtils';
import type {LoginList} from '@src/types/onyx';

import {formatPhoneNumber, translateLocal} from '../utils/TestHelper';

describe('UserUtils', () => {
    describe('getContactMethodsOptions', () => {
        type TestCase = {
            name: string;
            loginList: LoginList;
            defaultEmail?: string;
            expectedIndicators: Array<undefined | string>;
        };

        const TEST_CASES: TestCase[] = [
            {
                name: 'shows error indicator when any errorFields are present',
                loginList: {
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    'user@example.com': {
                        partnerUserID: 'user@example.com',
                        errorFields: {addedLogin: {message: 'err'}},
                    },
                },
                defaultEmail: 'user@example.com',
                expectedIndicators: [CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR],
            },
            {
                name: 'shows info indicator for unvalidated non-default contact method',
                loginList: {
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    'primary@example.com': {
                        partnerUserID: 'primary@example.com',
                        validatedDate: '2024-01-01',
                    },
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    'secondary@example.com': {
                        partnerUserID: 'secondary@example.com',
                        // no validatedDate => unvalidated
                    },
                },
                defaultEmail: 'primary@example.com',
                // Sorted order puts default first, then secondary
                expectedIndicators: [undefined, CONST.BRICK_ROAD_INDICATOR_STATUS.INFO],
            },
            {
                name: 'shows no indicator when validated and no errors',
                loginList: {
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    'ok@example.com': {
                        partnerUserID: 'ok@example.com',
                        validatedDate: '2024-01-01',
                    },
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    'another@example.com': {
                        partnerUserID: 'another@example.com',
                        validatedDate: '2024-03-03',
                    },
                },
                defaultEmail: 'ok@example.com',
                expectedIndicators: [undefined],
            },
        ];

        describe.each(TEST_CASES)('$name', ({loginList, defaultEmail, expectedIndicators}) => {
            test('verifies indicator states', () => {
                const options = UserUtils.getContactMethodsOptions(translateLocal, formatPhoneNumber, loginList, defaultEmail);
                const indicators = options.map((o) => o?.indicator);
                expect(indicators).toEqual(expectedIndicators);
            });
        });

        it('formats SMS contact method titles using the passed formatter', () => {
            const phoneLogin = '+18172057554@expensify.sms';
            const formatPhoneNumberMock = jest.fn(() => '(817) 205-7554');
            const options = UserUtils.getContactMethodsOptions(
                translateLocal,
                formatPhoneNumberMock,
                {
                    [phoneLogin]: {
                        partnerUserID: phoneLogin,
                        validatedDate: '2024-01-01',
                    },
                },
                phoneLogin,
            );

            expect(options.at(0)?.menuItemTitle).toBe('(817) 205-7554');
            expect(formatPhoneNumberMock).toHaveBeenCalledWith(phoneLogin);
        });
    });

    describe('getLoginListBrickRoadIndicator', () => {
        type TestCase = {
            name: string;
            loginList: LoginList;
            email?: string;
            expected: undefined | string;
        };

        const TEST_CASES: TestCase[] = [
            {
                name: 'returns ERROR when any login has errorFields',
                loginList: {
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    'a@example.com': {
                        partnerUserID: 'a@example.com',
                        errorFields: {validateCodeSent: {code: 'oops'}},
                    },
                },
                email: 'a@example.com',
                expected: CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR,
            },
            {
                name: 'returns INFO when there is unvalidated non-default login and no errors',
                loginList: {
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    'primary@example.com': {
                        partnerUserID: 'primary@example.com',
                        validatedDate: '2024-01-01',
                    },
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    'pending@example.com': {
                        partnerUserID: 'pending@example.com',
                        // missing validatedDate => unvalidated
                    },
                },
                email: 'primary@example.com',
                expected: CONST.BRICK_ROAD_INDICATOR_STATUS.INFO,
            },
            {
                name: 'returns undefined when all validated and no errors',
                loginList: {
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    'a@example.com': {
                        partnerUserID: 'a@example.com',
                        validatedDate: '2024-01-01',
                    },
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    'b@example.com': {
                        partnerUserID: 'b@example.com',
                        validatedDate: '2024-03-03',
                    },
                },
                email: 'a@example.com',
                expected: undefined,
            },
        ];

        describe.each(TEST_CASES)('$name', ({loginList, email, expected}) => {
            test('verifies brick road indicator', () => {
                const result = UserUtils.getLoginListBrickRoadIndicator(loginList, email);
                expect(result).toBe(expected);
            });
        });
    });

    describe('expensifyLoginsSelector', () => {
        test('returns undefined when there are no logins', () => {
            expect(UserUtils.expensifyLoginsSelector(undefined)).toBeUndefined();
        });

        test('keeps Expensify contact methods and excludes device and synthetic policy-domain logins', () => {
            const logins = {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                '1_user@example.com': {
                    created: '2024-01-01',
                    accountID: 1,
                    partnerID: CONST.PARTNER_ID.EXPENSIFY,
                    partnerUserID: 'user@example.com',
                    lastLogin: '2024-01-02',
                    validatedDate: '2024-01-01',
                },
                // eslint-disable-next-line @typescript-eslint/naming-convention
                '1_card@expensify-policy7c203ee7387a8f06.exfy': {
                    created: '2024-01-01',
                    accountID: 1,
                    partnerID: CONST.PARTNER_ID.EXPENSIFY,
                    partnerUserID: 'card@expensify-policy7c203ee7387a8f06.exfy',
                    lastLogin: '2024-01-02',
                    validatedDate: null,
                },
                // eslint-disable-next-line @typescript-eslint/naming-convention
                '14_device': {
                    created: '2024-01-01',
                    accountID: 1,
                    partnerID: CONST.PARTNER_ID.IPHONE,
                    partnerUserID: 'device@example.com',
                    lastLogin: '2024-01-02',
                    validatedDate: null,
                },
            };

            const result = UserUtils.expensifyLoginsSelector(logins);

            expect(Object.keys(result ?? {})).toEqual(['user@example.com']);
        });
    });

    describe('getDeviceLogins', () => {
        test('returns an empty array when there are no logins', () => {
            expect(UserUtils.getDeviceLogins(undefined)).toEqual([]);
        });

        test('sorts device logins by most recent timestamp first', () => {
            const logins = {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                '14_oldest': {
                    created: '2024-01-01',
                    accountID: 1,
                    partnerID: CONST.PARTNER_ID.IPHONE,
                    partnerUserID: 'oldest@example.com',
                    lastLogin: '2024-01-02',
                    validatedDate: null,
                },
                // eslint-disable-next-line @typescript-eslint/naming-convention
                '16_newest': {
                    created: '2024-01-01',
                    accountID: 1,
                    partnerID: CONST.PARTNER_ID.ANDROID,
                    partnerUserID: 'newest@example.com',
                    lastLogin: '2024-03-10',
                    validatedDate: null,
                },
                // eslint-disable-next-line @typescript-eslint/naming-convention
                '83_middle': {
                    created: '2024-01-01',
                    accountID: 1,
                    partnerID: CONST.PARTNER_ID.NEWDOT,
                    partnerUserID: 'middle@example.com',
                    lastLogin: '2024-02-05',
                    validatedDate: null,
                },
            };

            const result = UserUtils.getDeviceLogins(logins);

            expect(result.map((login) => login.partnerUserID)).toEqual(['newest@example.com', 'middle@example.com', 'oldest@example.com']);
        });

        test('falls back to created when lastLogin is the default 2008 value', () => {
            const logins = {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                '14_a': {
                    created: '2024-01-01',
                    accountID: 1,
                    partnerID: CONST.PARTNER_ID.IPHONE,
                    partnerUserID: 'a@example.com',
                    lastLogin: '2008-01-01',
                    validatedDate: null,
                },
                // eslint-disable-next-line @typescript-eslint/naming-convention
                '16_b': {
                    created: '2024-05-01',
                    accountID: 1,
                    partnerID: CONST.PARTNER_ID.ANDROID,
                    partnerUserID: 'b@example.com',
                    lastLogin: '2008-01-01',
                    validatedDate: null,
                },
            };

            const result = UserUtils.getDeviceLogins(logins);

            expect(result.map((login) => login.partnerUserID)).toEqual(['b@example.com', 'a@example.com']);
        });
    });

    describe('integrationServerLoginsSelector', () => {
        test('returns an empty array when there are no logins', () => {
            // Given the logins key hasn't loaded
            // When the Integration Server logins are selected
            const result = UserUtils.integrationServerLoginsSelector(undefined);

            // Then the contact methods page gets an empty list, so it shows no Integrations section
            expect(result).toEqual([]);
        });

        test('keeps only Integration Server logins', () => {
            // Given an account with an email contact method, a device login, the standard Integration Server login and two issued to OAuth partners,
            // one of which reached the client before the server sent partner names
            const logins = {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                '1_user@example.com': {
                    created: '2024-01-01',
                    accountID: 1,
                    partnerID: CONST.PARTNER_ID.EXPENSIFY,
                    partnerUserID: 'user@example.com',
                    lastLogin: '2024-01-02',
                    validatedDate: '2024-01-01',
                },
                // eslint-disable-next-line @typescript-eslint/naming-convention
                '14_device': {
                    created: '2024-01-01',
                    accountID: 1,
                    partnerID: CONST.PARTNER_ID.IPHONE,
                    partnerUserID: 'device@example.com',
                    lastLogin: '2024-01-02',
                    validatedDate: null,
                },
                // eslint-disable-next-line @typescript-eslint/naming-convention
                '53_aa_user_example_com': {
                    created: '2024-01-01',
                    accountID: 1,
                    partnerID: CONST.PARTNER_ID.INTEGRATIONS,
                    partnerUserID: 'aa_user_example_com',
                    lastLogin: '2024-01-02',
                    validatedDate: null,
                },
                // eslint-disable-next-line @typescript-eslint/naming-convention
                '201_is-oauth-0123456789abcdef': {
                    created: '2024-01-01',
                    accountID: 1,
                    partnerID: 201,
                    partnerUserID: 'is-oauth-0123456789abcdef',
                    lastLogin: '2024-01-02',
                    validatedDate: null,
                    integrationPartnerName: 'Acme',
                },
                // eslint-disable-next-line @typescript-eslint/naming-convention
                '202_is-oauth-fedcba9876543210': {
                    created: '2024-01-01',
                    accountID: 1,
                    partnerID: 202,
                    partnerUserID: 'is-oauth-fedcba9876543210',
                    lastLogin: '2024-01-02',
                    validatedDate: null,
                },
            };

            // When the Integration Server logins are selected
            const result = UserUtils.integrationServerLoginsSelector(logins);

            // Then only the Integration Server logins are kept, including the one without a name, because the other logins have their own sections and pages
            expect(result.map((login) => login.partnerUserID)).toEqual(['aa_user_example_com', 'is-oauth-0123456789abcdef', 'is-oauth-fedcba9876543210']);
        });
    });

    describe('getIntegrationServerLoginCopy', () => {
        const baseLogin = {
            created: '2024-01-01',
            accountID: 1,
            lastLogin: '2024-01-02',
            validatedDate: null,
        };

        test('names the standard Integration Server login "Integrations"', () => {
            // Given the standard Integration Server login, which has no partner name
            const login = {...baseLogin, partnerID: CONST.PARTNER_ID.INTEGRATIONS, partnerUserID: 'aa_user_example_com'};

            // When its copy is built
            const result = UserUtils.getIntegrationServerLoginCopy(login, translateLocal);

            // Then it describes the Integration Server API, since no partner issued it
            expect(result).toEqual({
                title: translateLocal('contacts.integrationServerLogin.title'),
                description: translateLocal('contacts.integrationServerLogin.description'),
                removeDescription: translateLocal('contacts.integrationServerLogin.removeDescription'),
            });
        });

        test('names an OAuth partner login after the partner', () => {
            // Given a login issued to the Acme OAuth partner
            const login = {...baseLogin, partnerID: 201, partnerUserID: 'is-oauth-0123456789abcdef', integrationPartnerName: 'Acme'};

            // When its copy is built
            const result = UserUtils.getIntegrationServerLoginCopy(login, translateLocal);

            // Then the label and text use the partner's name, so the user can tell which integration they would revoke
            expect(result).toEqual({
                title: 'Acme',
                description: translateLocal('contacts.integrationServerLogin.partnerDescription', {partnerName: 'Acme'}),
                removeDescription: translateLocal('contacts.integrationServerLogin.partnerRemoveDescription', {partnerName: 'Acme'}),
            });
        });
    });
});
