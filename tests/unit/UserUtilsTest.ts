import CONST from '@src/CONST';
import * as UserUtils from '@src/libs/UserUtils';
import type {LoginList} from '@src/types/onyx';

import {translateLocal} from '../utils/TestHelper';

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
                const options = UserUtils.getContactMethodsOptions(translateLocal, loginList, defaultEmail);
                const indicators = options.map((o) => o?.indicator);
                expect(indicators).toEqual(expectedIndicators);
            });
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
});
