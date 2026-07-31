import getDiagonalAvatarSizing from '@components/Avatar/layouts/getDiagonalAvatarSizing';

import CONST from '@src/CONST';

describe('getDiagonalAvatarSizing', () => {
    it.each([
        {
            size: CONST.AVATAR_SIZE.SMALL,
            expected: {
                avatarSize: CONST.AVATAR_SIZE.X_SMALL,
                singleAvatarStyleKey: 'singleAvatarXxxSmall',
                secondAvatarStyleKey: 'secondAvatarXxxSmall',
            },
        },
        {
            size: CONST.AVATAR_SIZE.XXX_LARGE,
            expected: {
                avatarSize: CONST.AVATAR_SIZE.X_LARGE,
                singleAvatarStyleKey: 'singleAvatarXLarge',
                secondAvatarStyleKey: 'secondAvatarXLarge',
            },
        },
        {
            size: CONST.AVATAR_SIZE.XXXX_LARGE,
            expected: {
                avatarSize: CONST.AVATAR_SIZE.XX_LARGE,
                singleAvatarStyleKey: 'singleAvatarXxLarge',
                secondAvatarStyleKey: 'secondAvatarXxLarge',
            },
        },
        {
            size: CONST.AVATAR_SIZE.DEFAULT,
            expected: {
                avatarSize: CONST.AVATAR_SIZE.X_SMALL,
                singleAvatarStyleKey: 'singleAvatarXSmall',
                secondAvatarStyleKey: 'secondAvatarXSmall',
            },
        },
        {
            size: CONST.AVATAR_SIZE.X_LARGE,
            expected: {
                avatarSize: CONST.AVATAR_SIZE.X_SMALL,
                singleAvatarStyleKey: 'singleAvatarXSmall',
                secondAvatarStyleKey: 'secondAvatarXSmall',
            },
        },
    ])('resolves the diagonal layout for a $size stack', ({size, expected}) => {
        expect(getDiagonalAvatarSizing(size, false)).toEqual(expected);
    });

    it.each([
        {size: CONST.AVATAR_SIZE.SMALL, singleAvatarStyleKey: 'singleAvatarXxxSmall', secondAvatarStyleKey: 'secondAvatarXxxSmall'},
        {size: CONST.AVATAR_SIZE.XXX_LARGE, singleAvatarStyleKey: 'singleAvatarXLarge', secondAvatarStyleKey: 'secondAvatarXLarge'},
        {size: CONST.AVATAR_SIZE.XXXX_LARGE, singleAvatarStyleKey: 'singleAvatarXxLarge', secondAvatarStyleKey: 'secondAvatarXxLarge'},
        {size: CONST.AVATAR_SIZE.DEFAULT, singleAvatarStyleKey: 'singleAvatarXSmall', secondAvatarStyleKey: 'secondAvatarXSmall'},
    ])('uses the mid-subscript avatar size without affecting the $size style keys', ({size, singleAvatarStyleKey, secondAvatarStyleKey}) => {
        expect(getDiagonalAvatarSizing(size, true)).toEqual({
            avatarSize: CONST.AVATAR_SIZE.XXX_SMALL,
            singleAvatarStyleKey,
            secondAvatarStyleKey,
        });
    });
});
