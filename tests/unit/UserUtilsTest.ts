import * as UserUtils from '@src/libs/UserUtils';

describe('UserUtils', () => {
    it('should return the default avatar from the avatar url', () => {
        const avatarURL = 'https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/default-avatar_7.png';
        const defaultAvatar = UserUtils.getDefaultAvatar(1, avatarURL);
        expect(typeof defaultAvatar).toBe('function');
    });
});
