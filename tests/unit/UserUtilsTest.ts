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

    describe('getAvatar', () => {
        it('should return default avatar for Concierge URLs', () => {
            const avatar = UserUtils.getAvatar(CONST.CONCIERGE_ICON_URL, CONST.ACCOUNT_ID.CONCIERGE);
            expect(avatar).toBeDefined();
        });

        it('should return default avatar SVG for default avatar URL', () => {
            const avatar = UserUtils.getAvatar('https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/avatar_2.png', 2);
            expect(typeof avatar).toBe('function');
            expect(avatar).toBe(defaultAvatars.Avatar2);
        });

        it('should return custom avatar URL unchanged', () => {
            const customURL = 'https://example.com/custom-avatar.jpg';
            const avatar = UserUtils.getAvatar(customURL, 1);
            expect(avatar).toBe(customURL);
        });

        it('should return default avatar SVG for default avatar URL regardless of accountEmail or accountId provided', () => {
            const defaultAvatarURL = 'https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/user/default-avatar_5.png';
            const avatarByEmail = UserUtils.getAvatar(defaultAvatarURL, 5, 'alice@example.com');
            const avatarById = UserUtils.getAvatar(defaultAvatarURL, 5);

            expect(avatarByEmail).toBe(defaultAvatars.Avatar5);
            expect(avatarById).toBe(defaultAvatars.Avatar5);
        });
    });

    describe('getDefaultAvatarURL', () => {
        it('should return Concierge icon URL for Concierge account', () => {
            const url = UserUtils.getDefaultAvatarURL(CONST.ACCOUNT_ID.CONCIERGE);
            expect(url).toBe(CONST.CONCIERGE_ICON_URL);
        });

        it('should return default avatar URL for regular account', () => {
            const url = UserUtils.getDefaultAvatarURL(1);
            expect(url).toContain('default-avatar_');
            expect(url).toContain('.png');
        });

        it('should extract avatar number from avatarURL when provided', () => {
            const url = UserUtils.getDefaultAvatarURL(999, undefined, 'https://example.com/default-avatar_5.png');
            expect(url).toContain('default-avatar_5.png');
        });

        it('should prioritize avatarURL parameter over accountID', () => {
            const urlWithAvatar = UserUtils.getDefaultAvatarURL(1, undefined, 'https://example.com/avatar_10.png');
            const urlWithoutAvatar = UserUtils.getDefaultAvatarURL(1);

            expect(urlWithAvatar).toContain('default-avatar_10.png');
            expect(urlWithoutAvatar).toContain('default-avatar_2.png');
        });

        it('should use accountID modulo when only accountID is provided', () => {
            const url1 = UserUtils.getDefaultAvatarURL(1);
            const url25 = UserUtils.getDefaultAvatarURL(25); // 25 % 24 + 1 = 2

            expect(url1).toContain('default-avatar_2.png'); // 1 % 24 + 1 = 2
            expect(url25).toContain('default-avatar_2.png'); // 25 % 24 + 1 = 2
            expect(url1).toBe(url25); // Same modulo result
        });

        it('should use accountEmail hash instead of accountID when email is provided', () => {
            const urlByID = UserUtils.getDefaultAvatarURL(10);
            const urlByEmail = UserUtils.getDefaultAvatarURL(10, 'john.doe@example.com');

            expect(urlByID).toContain('default-avatar_');
            expect(urlByEmail).toContain('default-avatar_');
            expect(urlByID).not.toBe(urlByEmail);
        });

        it('should produce consistent avatar for same email', () => {
            const url1 = UserUtils.getDefaultAvatarURL(1, 'consistent@example.com');
            const url2 = UserUtils.getDefaultAvatarURL(999, 'consistent@example.com');

            expect(url1).toBe(url2);
        });
    });

    describe('isDefaultAvatar', () => {
        it('should return true for default avatar URLs', () => {
            expect(UserUtils.isDefaultAvatar('https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/default-avatar_7.png')).toBe(true);
            expect(UserUtils.isDefaultAvatar(CONST.CONCIERGE_ICON_URL)).toBe(true);
        });

        it('should return false for custom avatar URLs', () => {
            expect(UserUtils.isDefaultAvatar('https://example.com/custom-avatar.png')).toBe(false);
        });
    });

    describe('getSmallSizeAvatar', () => {
        it('should add _128 suffix to CloudFront avatars', () => {
            const source = 'https://d2k5nsl2zxldvw.cloudfront.net/images/avatar.png';
            const result = UserUtils.getSmallSizeAvatar(source, 1);
            expect(result).toBe('https://d2k5nsl2zxldvw.cloudfront.net/images/avatar_128.png');
        });

        it('should not add _128 to non-CloudFront URLs', () => {
            const source = 'https://example.com/avatar.png';
            const result = UserUtils.getSmallSizeAvatar(source, 1);
            expect(result).toBe(source);
        });

        it('should not duplicate _128 suffix', () => {
            const source = 'https://d2k5nsl2zxldvw.cloudfront.net/images/avatar_128.png';
            const result = UserUtils.getSmallSizeAvatar(source, 1);
            expect(result).toBe(source);
        });
    });

    describe('getFullSizeAvatar', () => {
        it('should remove _128 suffix from avatar URLs', () => {
            const source = 'https://example.com/avatar_128.png';
            const result = UserUtils.getFullSizeAvatar(source, 1);
            expect(result).toBe('https://example.com/avatar.png');
        });

        it('should return avatar as-is if no _128 suffix', () => {
            const source = 'https://example.com/avatar.png';
            const result = UserUtils.getFullSizeAvatar(source, 1);
            expect(result).toBe(source);
        });
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
