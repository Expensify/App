import type IconSize from '@components/Icon/types';

import CONST from '@src/CONST';

/** Maps the responsive-layout state to the icon size used by search header action buttons. */
function getSearchHeaderIconSize(isMediumScreenWidth: boolean, shouldUseNarrowLayout: boolean): IconSize | undefined {
    if (isMediumScreenWidth) {
        return CONST.ICON_SIZE.EXTRA_SMALL;
    }
    if (shouldUseNarrowLayout) {
        return CONST.ICON_SIZE.SMALL;
    }
    return undefined;
}

export default getSearchHeaderIconSize;
