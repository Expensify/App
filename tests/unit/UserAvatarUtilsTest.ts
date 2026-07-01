import {renderHook} from '@testing-library/react-native';
import * as defaultAvatars from '@components/Icon/DefaultAvatars';
import useDefaultAvatars from '@hooks/useDefaultAvatars';
import {USER_AVATARS} from '@libs/Avatars/UserAvatarCatalog';
import CONST from '@src/CONST';
import * as UserAvatarUtils from '@src/libs/UserAvatarUtils';

describe('UserAvatarUtils', () => {
    describe('getAvatar', () => {
        it('should return default avatar if the url is for default avatar', () => {
            const avatarURL = 'https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/default-avatar_7.png';
            const {result: avatars} = renderHook(() => useDefaultAvatars());
            const defaultAvatar = UserAvatarUtils.getAvatar({avatarSource: avatarURL, accountID: 1, defaultAvatars: avatars.current});

            expect(typeof defaultAvatar).toBe('function');
            // Both defaultAvatar and defaultAvatarUrl must be `defaultAvatars.Avatar7`
            expect(defaultAvatar === defaultAvatars.Avatar7).toBeTruthy();
        });

        it('should return the same url if url is not for default avatar', () => {
            const avatarURL = 'https://test.com/images/some_avatar.png';
            const {result: avatars} = renderHook(() => useDefaultAvatars());
            const avatar = UserAvatarUtils.getAvatar({avatarSource: avatarURL, accountID: 1, defaultAvatars: avatars.current});

            expect(avatar).toEqual('https://test.com/images/some_avatar.png');
        });

        it('should return default avatar for Concierge URLs', () => {
            const {result: avatars} = renderHook(() => useDefaultAvatars());
            const avatar = UserAvatarUtils.getAvatar({avatarSource: CONST.CONCIERGE_ICON_URL, accountID: CONST.ACCOUNT_ID.CONCIERGE, defaultAvatars: avatars.current});
            expect(avatar).toBeDefined();
        });

        it('should return default avatar SVG for default avatar URL', () => {
            const {result: avatars} = renderHook(() => useDefaultAvatars());
            const avatar = UserAvatarUtils.getAvatar({avatarSource: 'https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/avatar_2.png', accountID: 2, defaultAvatars: avatars.current});
            expect(typeof avatar).toBe('function');
            expect(avatar).toBe(defaultAvatars.Avatar2);
        });

        it('should return default avatar SVG for default avatar URL regardless of accountEmail or accountId provided', () => {
            const defaultAvatarURL = 'https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/user/default-avatar_5.png';
            const {result: avatars} = renderHook(() => useDefaultAvatars());
            const avatarByEmail = UserAvatarUtils.getAvatar({avatarSource: defaultAvatarURL, accountID: 5, accountEmail: 'alice@example.com', defaultAvatars: avatars.current});
            const avatarById = UserAvatarUtils.getAvatar({avatarSource: defaultAvatarURL, accountID: 5, defaultAvatars: avatars.current});

            expect(avatarByEmail).toBe(defaultAvatars.Avatar5);
            expect(avatarById).toBe(defaultAvatars.Avatar5);
        });
    });

    describe('getAvatarUrl', () => {
        it('should return default avatar URL when url is for default avatar', () => {
            const avatarURL = 'https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/default-avatar_7.png';
            const defaultAvatarUrl = UserAvatarUtils.getAvatarURL({avatarSource: avatarURL, accountID: 1});

            expect(defaultAvatarUrl).toBe('https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/default-avatar_7.png');
        });

        it('should return the same url if url is not for default avatar', () => {
            const avatarURL = 'https://test.com/images/some_avatar.png';
            const avatarUrl = UserAvatarUtils.getAvatarURL({avatarSource: avatarURL, accountID: 1});

            expect(avatarUrl).toEqual('https://test.com/images/some_avatar.png');
        });
    });

    describe('getPresetAvatarURL', () => {
        it('should return Concierge icon URL for Concierge account', () => {
            const url = UserAvatarUtils.getDefaultAvatarURL({accountID: CONST.ACCOUNT_ID.CONCIERGE});
            expect(url).toBe(CONST.CONCIERGE_ICON_URL);
        });

        it('should return default avatar URL for regular account', () => {
            const url = UserAvatarUtils.getDefaultAvatarURL({accountID: 1});
            expect(url).toContain('default-avatar_');
            expect(url).toContain('.png');
        });

        it('should extract avatar number from avatarURL when provided', () => {
            const url = UserAvatarUtils.getDefaultAvatarURL({accountID: 999, avatarURL: 'https://example.com/default-avatar_5.png'});
            expect(url).toContain('default-avatar_5.png');
        });

        it('should prioritize avatarURL parameter over accountID', () => {
            const urlWithAvatar = UserAvatarUtils.getDefaultAvatarURL({accountID: 1, avatarURL: 'https://example.com/avatar_10.png'});
            const urlWithoutAvatar = UserAvatarUtils.getDefaultAvatarURL({accountID: 1});

            expect(urlWithAvatar).toContain('default-avatar_10.png');
            expect(urlWithoutAvatar).toContain('default-avatar_2.png');
        });

        it('should use accountID modulo when only accountID is provided', () => {
            const url1 = UserAvatarUtils.getDefaultAvatarURL({accountID: 1});
            const url25 = UserAvatarUtils.getDefaultAvatarURL({accountID: 25}); // 25 % 24 + 1 = 2

            expect(url1).toContain('default-avatar_2.png'); // 1 % 24 + 1 = 2
            expect(url25).toContain('default-avatar_2.png'); // 25 % 24 + 1 = 2
            expect(url1).toBe(url25); // Same modulo result
        });

        it('should use accountEmail hash instead of accountID when email is provided', () => {
            const urlByID = UserAvatarUtils.getDefaultAvatarURL({accountID: 10});
            const urlByEmail = UserAvatarUtils.getDefaultAvatarURL({accountID: 10, accountEmail: 'john.doe@example.com'});

            expect(urlByID).toContain('default-avatar_');
            expect(urlByEmail).toContain('default-avatar_');
            expect(urlByID).not.toBe(urlByEmail);
        });

        it('should produce consistent avatar for same email', () => {
            const url1 = UserAvatarUtils.getDefaultAvatarURL({accountID: 1, accountEmail: 'consistent@example.com'});
            const url2 = UserAvatarUtils.getDefaultAvatarURL({accountID: 999, accountEmail: 'consistent@example.com'});

            expect(url1).toBe(url2);
        });
    });

    describe('isDefaultAvatar', () => {
        it('should return true for default avatar URLs with avatar_ prefix', () => {
            expect(UserAvatarUtils.isDefaultAvatar('https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/avatar_7.png')).toBe(true);
        });

        it('should return true for default avatar URLs with default-avatar_ prefix', () => {
            expect(UserAvatarUtils.isDefaultAvatar('https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/default-avatar_7.png')).toBe(true);
        });

        it('should return true for user default avatar URLs', () => {
            expect(UserAvatarUtils.isDefaultAvatar('https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/user/default-avatar_7.png')).toBe(true);
        });

        it('should return true for Concierge icon URL', () => {
            expect(UserAvatarUtils.isDefaultAvatar(CONST.CONCIERGE_ICON_URL)).toBe(true);
        });

        it('should return true for legacy Concierge icon URL', () => {
            expect(UserAvatarUtils.isDefaultAvatar(CONST.CONCIERGE_ICON_URL_2021)).toBe(true);
        });

        it('should return false for custom avatar URLs', () => {
            expect(UserAvatarUtils.isDefaultAvatar('https://example.com/custom-avatar.png')).toBe(false);
        });

        it('should return false for undefined', () => {
            expect(UserAvatarUtils.isDefaultAvatar(undefined)).toBe(false);
        });
    });

    describe('isCatalogAvatar', () => {
        it('should return true for user catalog avatar URLs', () => {
            const customURL = 'https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/default-avatar_5.png';
            expect(UserAvatarUtils.isCatalogAvatar(customURL)).toBe(true);
        });

        it('should return true for agent catalog avatar URLs', () => {
            const botURL = 'https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/bots/bot-avatar--blue.png';
            expect(UserAvatarUtils.isCatalogAvatar(botURL)).toBe(true);
        });

        it('should return false for non-catalog URLs', () => {
            expect(UserAvatarUtils.isCatalogAvatar('https://example.com/random.png')).toBe(false);
        });

        it('should return false for Concierge URL', () => {
            expect(UserAvatarUtils.isCatalogAvatar(CONST.CONCIERGE_ICON_URL)).toBe(false);
        });

        it('should return false for undefined', () => {
            expect(UserAvatarUtils.isCatalogAvatar(undefined)).toBe(false);
        });
    });

    describe('isLetterAvatar', () => {
        it('should return true for valid letter avatar filenames', () => {
            expect(UserAvatarUtils.isLetterAvatar('letter-avatar-#FF5733-#C70039-A.png')).toBe(true);
            expect(UserAvatarUtils.isLetterAvatar('letter-avatar-#000000-#FFFFFF-Z.png')).toBe(true);
        });

        it('should return false for invalid letter avatar filenames', () => {
            expect(UserAvatarUtils.isLetterAvatar('letter-avatar-#FF5733-#C70039-a.png')).toBe(false); // lowercase letter
            expect(UserAvatarUtils.isLetterAvatar('letter-avatar-#FF573-#C70039-A.png')).toBe(false); // invalid hex
            expect(UserAvatarUtils.isLetterAvatar('random-avatar.png')).toBe(false);
        });

        it('should return false for undefined', () => {
            expect(UserAvatarUtils.isLetterAvatar(undefined)).toBe(false);
        });

        it('should return false for empty string', () => {
            expect(UserAvatarUtils.isLetterAvatar('')).toBe(false);
        });
    });

    describe('getSmallSizeAvatar', () => {
        it('should add _128 suffix to CloudFront avatars', () => {
            const source = 'https://d2k5nsl2zxldvw.cloudfront.net/images/avatar.png';
            const {result: avatars} = renderHook(() => useDefaultAvatars());
            const result = UserAvatarUtils.getSmallSizeAvatar({avatarSource: source, accountID: 1, defaultAvatars: avatars.current});
            expect(result).toBe('https://d2k5nsl2zxldvw.cloudfront.net/images/avatar_128.png');
        });

        it('should not add _128 to non-CloudFront URLs', () => {
            const source = 'https://example.com/avatar.png';
            const {result: avatars} = renderHook(() => useDefaultAvatars());
            const result = UserAvatarUtils.getSmallSizeAvatar({avatarSource: source, accountID: 1, defaultAvatars: avatars.current});
            expect(result).toBe(source);
        });

        it('should not duplicate _128 suffix', () => {
            const source = 'https://d2k5nsl2zxldvw.cloudfront.net/images/avatar_128.png';
            const {result: avatars} = renderHook(() => useDefaultAvatars());
            const result = UserAvatarUtils.getSmallSizeAvatar({avatarSource: source, accountID: 1, defaultAvatars: avatars.current});
            expect(result).toBe(source);
        });

        it('should return SVG component as-is for default avatars', () => {
            const defaultAvatarURL = 'https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/default-avatar_5.png';
            const {result: avatars} = renderHook(() => useDefaultAvatars());
            const result = UserAvatarUtils.getSmallSizeAvatar({avatarSource: defaultAvatarURL, accountID: 5, defaultAvatars: avatars.current});
            expect(typeof result).toBe('function'); // SVG component
        });
    });

    describe('getFullSizeAvatar', () => {
        it('should remove _128 suffix from avatar URLs', () => {
            const source = 'https://example.com/avatar_128.png';
            const {result: avatars} = renderHook(() => useDefaultAvatars());
            const result = UserAvatarUtils.getFullSizeAvatar({avatarSource: source, accountID: 1, defaultAvatars: avatars.current});
            expect(result).toBe('https://example.com/avatar.png');
        });

        it('should return avatar as-is if no _128 suffix', () => {
            const source = 'https://example.com/avatar.png';
            const {result: avatars} = renderHook(() => useDefaultAvatars());
            const result = UserAvatarUtils.getFullSizeAvatar({avatarSource: source, accountID: 1, defaultAvatars: avatars.current});
            expect(result).toBe(source);
        });

        it('should return SVG component as-is for default avatars', () => {
            const defaultAvatarURL = 'https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/default-avatar_3.png';
            const {result: avatars} = renderHook(() => useDefaultAvatars());
            const result = UserAvatarUtils.getFullSizeAvatar({avatarSource: defaultAvatarURL, accountID: 3, defaultAvatars: avatars.current});
            expect(typeof result).toBe('function'); // SVG component
            expect(result).toBe(defaultAvatars.Avatar3);
        });
    });

    describe('getCatalogAvatarNameFromURL', () => {
        it('should extract user catalog avatar name from CloudFront URL', () => {
            const url = 'https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/default-avatar_5.png';
            const result = UserAvatarUtils.getCatalogAvatarNameFromURL(url);
            expect(result).toBe('default-avatar_5');
        });

        it('should extract agent catalog avatar name from CloudFront URL', () => {
            const url = 'https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/bots/bot-avatar--blue.png';
            const result = UserAvatarUtils.getCatalogAvatarNameFromURL(url);
            expect(result).toBe('bot-avatar--blue');
        });

        it('should return undefined for non-catalog avatar URLs', () => {
            const url = 'https://example.com/custom-upload.png';
            const result = UserAvatarUtils.getCatalogAvatarNameFromURL(url);
            expect(result).toBeUndefined();
        });

        it('should return undefined for Concierge URL', () => {
            const result = UserAvatarUtils.getCatalogAvatarNameFromURL(CONST.CONCIERGE_ICON_URL);
            expect(result).toBeUndefined();
        });

        it('should return undefined for undefined input', () => {
            const result = UserAvatarUtils.getCatalogAvatarNameFromURL(undefined);
            expect(result).toBeUndefined();
        });
    });

    describe('getDefaultAvatarName', () => {
        it('should return avatar name for account ID', () => {
            const name = UserAvatarUtils.getDefaultAvatarName({accountID: 1});
            expect(name).toBe('default-avatar_2'); // (1 % 24) + 1 = 2
        });

        it('should return avatar name using email hash when provided', () => {
            const name1 = UserAvatarUtils.getDefaultAvatarName({accountID: 1, accountEmail: 'test@example.com'});
            const name2 = UserAvatarUtils.getDefaultAvatarName({accountID: 999, accountEmail: 'test@example.com'});
            expect(name1).toBe(name2); // Same email = same avatar
            expect(name1).toContain('default-avatar_');
        });

        it('should extract avatar number from existing avatarURL', () => {
            const name = UserAvatarUtils.getDefaultAvatarName({accountID: 999, avatarURL: 'https://example.com/avatar_12.png'});
            expect(name).toBe('default-avatar_12');
        });

        it('should prioritize avatarURL over accountID and email', () => {
            const name = UserAvatarUtils.getDefaultAvatarName({accountID: 1, accountEmail: 'test@example.com', avatarURL: 'https://example.com/default-avatar_20.png'});
            expect(name).toBe('default-avatar_20');
        });
    });

    describe('optimizeAvatarSource', () => {
        it('should return the bundled local SVG for a catalog avatar URL', () => {
            const catalogAvatar = USER_AVATARS.entries['default-avatar_1'];
            const result = UserAvatarUtils.optimizeAvatarSource(catalogAvatar.url);

            expect(result).toBe(catalogAvatar.local);
            expect(typeof result).toBe('function');
        });

        it('should return the original URL unchanged for a non-catalog (uploaded) URL', () => {
            const uploadedURL = 'https://example.com/uploaded-avatar.png';
            expect(UserAvatarUtils.optimizeAvatarSource(uploadedURL)).toBe(uploadedURL);
        });

        it('should return an SVG component source unchanged', () => {
            expect(UserAvatarUtils.optimizeAvatarSource(defaultAvatars.Avatar1)).toBe(defaultAvatars.Avatar1);
        });

        it('should return undefined when no source is provided', () => {
            expect(UserAvatarUtils.optimizeAvatarSource(undefined)).toBeUndefined();
        });
    });
});
