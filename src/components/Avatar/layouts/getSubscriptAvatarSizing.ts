import CONST from '@src/CONST';

import type {ValueOf} from 'type-fest';

type AvatarSize = ValueOf<typeof CONST.AVATAR_SIZE>;

type SubscriptAvatarSizing = {
    /** Size of the secondary (subscript) avatar */
    subscriptSize: AvatarSize;

    /** Avatar size whose border width the subscript avatar uses */
    borderWidthSize: AvatarSize;

    /** Theme style key for the subscript avatar container */
    containerStyleKey: 'secondAvatarSubscriptSmall' | 'secondAvatarSubscriptXxxxLarge' | 'secondAvatarSubscript';
};

/** Resolves the subscript avatar size, border width and container style from the primary avatar size. */
function getSubscriptAvatarSizing(size: AvatarSize): SubscriptAvatarSizing {
    if (size === CONST.AVATAR_SIZE.SMALL) {
        return {
            subscriptSize: CONST.AVATAR_SIZE.XXXX_SMALL,
            borderWidthSize: CONST.AVATAR_SIZE.XXXX_SMALL,
            containerStyleKey: 'secondAvatarSubscriptSmall',
        };
    }

    if (size === CONST.AVATAR_SIZE.XXXX_LARGE) {
        return {
            subscriptSize: CONST.AVATAR_SIZE.DEFAULT,
            // The medium subscript on a xxxx-large avatar keeps the small border width — the default border width for its size is 1px thicker and would shrink the visible avatar.
            borderWidthSize: CONST.AVATAR_SIZE.SMALL,
            containerStyleKey: 'secondAvatarSubscriptXxxxLarge',
        };
    }

    return {
        subscriptSize: CONST.AVATAR_SIZE.XX_SMALL,
        borderWidthSize: CONST.AVATAR_SIZE.XX_SMALL,
        containerStyleKey: 'secondAvatarSubscript',
    };
}

export default getSubscriptAvatarSizing;
