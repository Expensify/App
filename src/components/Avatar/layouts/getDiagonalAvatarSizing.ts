import CONST from '@src/CONST';

import type {ValueOf} from 'type-fest';

type AvatarSize = ValueOf<typeof CONST.AVATAR_SIZE>;

type DiagonalAvatarSizing = {
    /** Size of each avatar inside the diagonal stack */
    avatarSize: AvatarSize;

    /** Theme style key for the primary avatar container, also used as image styles on both avatars */
    singleAvatarStyleKey: 'singleAvatarXxxSmall' | 'singleAvatarXLarge' | 'singleAvatarXxLarge' | 'singleAvatarXSmall';

    /** Theme style key for the secondary avatar container */
    secondAvatarStyleKey: 'secondAvatarXxxSmall' | 'secondAvatarXLarge' | 'secondAvatarXxLarge' | 'secondAvatarXSmall';
};

/** Resolves the inner avatar size and container style keys for a diagonal avatar stack from the stack size. */
function getDiagonalAvatarSizing(size: AvatarSize): DiagonalAvatarSizing {
    if (size === CONST.AVATAR_SIZE.SMALL) {
        return {
            avatarSize: CONST.AVATAR_SIZE.XXX_SMALL,
            singleAvatarStyleKey: 'singleAvatarXxxSmall',
            secondAvatarStyleKey: 'secondAvatarXxxSmall',
        };
    }

    if (size === CONST.AVATAR_SIZE.XXX_LARGE) {
        return {
            avatarSize: CONST.AVATAR_SIZE.X_LARGE,
            singleAvatarStyleKey: 'singleAvatarXLarge',
            secondAvatarStyleKey: 'secondAvatarXLarge',
        };
    }

    if (size === CONST.AVATAR_SIZE.XXXX_LARGE) {
        return {
            avatarSize: CONST.AVATAR_SIZE.XX_LARGE,
            singleAvatarStyleKey: 'singleAvatarXxLarge',
            secondAvatarStyleKey: 'secondAvatarXxLarge',
        };
    }

    return {
        avatarSize: CONST.AVATAR_SIZE.X_SMALL,
        singleAvatarStyleKey: 'singleAvatarXSmall',
        secondAvatarStyleKey: 'secondAvatarXSmall',
    };
}

export default getDiagonalAvatarSizing;
