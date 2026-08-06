import getSubscriptAvatarSizing from '@components/Avatar/layouts/getSubscriptAvatarSizing';

import CONST from '@src/CONST';

describe('getSubscriptAvatarSizing', () => {
    it.each([
        {
            size: CONST.AVATAR_SIZE.SMALL,
            expected: {
                subscriptSize: CONST.AVATAR_SIZE.XXXX_SMALL,
                borderWidthSize: CONST.AVATAR_SIZE.XXXX_SMALL,
                containerStyleKey: 'secondAvatarSubscriptSmall',
            },
        },
        {
            size: CONST.AVATAR_SIZE.XXXX_LARGE,
            expected: {
                subscriptSize: CONST.AVATAR_SIZE.DEFAULT,
                borderWidthSize: CONST.AVATAR_SIZE.SMALL,
                containerStyleKey: 'secondAvatarSubscriptXxxxLarge',
            },
        },
        {
            size: CONST.AVATAR_SIZE.DEFAULT,
            expected: {
                subscriptSize: CONST.AVATAR_SIZE.XX_SMALL,
                borderWidthSize: CONST.AVATAR_SIZE.XX_SMALL,
                containerStyleKey: 'secondAvatarSubscript',
            },
        },
        {
            size: CONST.AVATAR_SIZE.X_LARGE,
            expected: {
                subscriptSize: CONST.AVATAR_SIZE.XX_SMALL,
                borderWidthSize: CONST.AVATAR_SIZE.XX_SMALL,
                containerStyleKey: 'secondAvatarSubscript',
            },
        },
    ])('resolves the subscript layout for a $size primary avatar', ({size, expected}) => {
        expect(getSubscriptAvatarSizing(size)).toEqual(expected);
    });
});
