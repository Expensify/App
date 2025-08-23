import * as defaultAvatars from '@components/Icon/DefaultAvatars';
import * as UserUtils from '@src/libs/UserUtils';

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
});
