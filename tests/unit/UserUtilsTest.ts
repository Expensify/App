import * as defaultAvatars from '@components/Icon/DefaultAvatars';
import CONST from '@src/CONST';
import * as UserUtils from '@src/libs/UserUtils';
import type {LoginList} from '@src/types/onyx';

describe('UserUtils', () => {
    it('should return default avatar if the url is for default avatar', () => {
        const avatarURL = 'https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/default-avatar_7.png';
        const defaultAvatar = UserUtils.getAvatar(avatarURL, 1);

        expect(typeof defaultAvatar).toBe('function');

        const defaultAvatarUrl = UserUtils.getAvatarUrl(avatarURL, 1);

        expect(defaultAvatarUrl).toBe('https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/default-avatar_7.png');
        // Both defaultAvatar and defaultAvatarUrl must be `defaultAvatars.Avatar7`
        expect(defaultAvatar === defaultAvatars.Avatar7).toBeTruthy();
    });

    it('should return the same url if url is not for default avatar', () => {
        const avatarURL = 'https://test.com/images/some_avatar.png';
        const avatar = UserUtils.getAvatar(avatarURL, 1);

        expect(avatar).toEqual('https://test.com/images/some_avatar.png');

        const avatarUrl = UserUtils.getAvatarUrl(avatarURL, 1);

        expect(avatarUrl).toEqual('https://test.com/images/some_avatar.png');
    });

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
                const options = UserUtils.getContactMethodsOptions(loginList, defaultEmail);
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
});
