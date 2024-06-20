import * as UserUtils from '@src/libs/UserUtils';

describe('UserUtils', () => {
    it('should return default avatar if the url is for default avatar', () => {
        const avatarURL = 'https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/default-avatar_7.png';
        const defaultAvatar = UserUtils.getAvatar(avatarURL, 1);

        expect(typeof defaultAvatar).toBe('function');
    });

    it('should return the same url if url is not for default avatar', () => {
        const avatarURL = 'https://test.com/images/some_avatar.png';
        const avatar = UserUtils.getAvatar(avatarURL, 1);

        expect(avatar).toEqual('https://test.com/images/some_avatar.png');
    });
});
