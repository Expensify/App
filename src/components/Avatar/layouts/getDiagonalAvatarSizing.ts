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

/**
 * Resolves the inner avatar size and container style keys for a diagonal avatar stack from the stack size.
 *
 * `shouldUseMidSubscriptSize` affects only `avatarSize` — the style keys depend solely on `size`, which lets
 * `DiagonalAvatarsFrame` resolve them without knowing about the mid-subscript mode.
 */
function getDiagonalAvatarSizing(size: AvatarSize, shouldUseMidSubscriptSize: boolean): DiagonalAvatarSizing {
    let avatarSize: AvatarSize;
    if (shouldUseMidSubscriptSize) {
        avatarSize = CONST.AVATAR_SIZE.XXX_SMALL;
    } else if (size === CONST.AVATAR_SIZE.XXX_LARGE) {
        avatarSize = CONST.AVATAR_SIZE.X_LARGE;
    } else if (size === CONST.AVATAR_SIZE.XXXX_LARGE) {
        avatarSize = CONST.AVATAR_SIZE.XX_LARGE;
    } else {
        avatarSize = CONST.AVATAR_SIZE.X_SMALL;
    }

    if (size === CONST.AVATAR_SIZE.SMALL) {
        return {
            avatarSize,
            singleAvatarStyleKey: 'singleAvatarXxxSmall',
            secondAvatarStyleKey: 'secondAvatarXxxSmall',
        };
    }

    if (size === CONST.AVATAR_SIZE.XXX_LARGE) {
        return {
            avatarSize,
            singleAvatarStyleKey: 'singleAvatarXLarge',
            secondAvatarStyleKey: 'secondAvatarXLarge',
        };
    }

    if (size === CONST.AVATAR_SIZE.XXXX_LARGE) {
        return {
            avatarSize,
            singleAvatarStyleKey: 'singleAvatarXxLarge',
            secondAvatarStyleKey: 'secondAvatarXxLarge',
        };
    }

    return {
        avatarSize,
        singleAvatarStyleKey: 'singleAvatarXSmall',
        secondAvatarStyleKey: 'secondAvatarXSmall',
    };
}

export default getDiagonalAvatarSizing;
export type {DiagonalAvatarSizing};
