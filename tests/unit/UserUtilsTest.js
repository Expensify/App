"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var UserUtils = require("@src/libs/UserUtils");
describe('UserUtils', function () {
    it('should return default avatar if the url is for default avatar', function () {
        var avatarURL = 'https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/default-avatar_7.png';
        var defaultAvatar = UserUtils.getAvatar(avatarURL, 1);
        expect(typeof defaultAvatar).toBe('function');
    });
    it('should return the same url if url is not for default avatar', function () {
        var avatarURL = 'https://test.com/images/some_avatar.png';
        var avatar = UserUtils.getAvatar(avatarURL, 1);
        expect(avatar).toEqual('https://test.com/images/some_avatar.png');
    });
});
