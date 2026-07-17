import CONST from '@src/CONST';

import type {ValueOf} from 'type-fest';

/** Preset icon size values from `CONST.ICON_SIZE`. */
type IconSize = ValueOf<typeof CONST.ICON_SIZE>;

/** Resolves the effective icon size from the new `size` prop or legacy boolean props. */
function resolveIconSize(size: IconSize | undefined, extraSmall: boolean, small: boolean, medium: boolean, large: boolean): IconSize | undefined {
    if (size) {
        return size;
    }

    if (extraSmall) {
        return CONST.ICON_SIZE.EXTRA_SMALL;
    }

    if (small) {
        return CONST.ICON_SIZE.SMALL;
    }

    if (medium) {
        return CONST.ICON_SIZE.MEDIUM;
    }

    if (large) {
        return CONST.ICON_SIZE.LARGE;
    }

    return undefined;
}

export default resolveIconSize;

export type {IconSize};
