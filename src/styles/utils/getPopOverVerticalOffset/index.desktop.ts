import CONST from '@src/CONST';
import type GetPopOverVerticalOffset from './types';

/** Adds the header padding with vertical offset on desktop */
const getPopOverVerticalOffset: GetPopOverVerticalOffset = (vertical) => ({
    // We add CONST.DESKTOP_HEADER_GAP on desktop which we
    // need to add to vertical offset to have proper vertical
    // offset on desktop
    vertical: vertical + CONST.DESKTOP_HEADER_PADDING,
});

export default getPopOverVerticalOffset;
