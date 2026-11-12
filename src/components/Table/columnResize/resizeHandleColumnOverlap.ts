import CONST from '@src/CONST';

/** How far a resize handle's hit area reaches into its column from the right edge. */
const RESIZE_HANDLE_COLUMN_OVERLAP = (CONST.TABLES.COLUMN_RESIZE.HIT_AREA_WIDTH + CONST.RESIZE_HANDLE.INDICATOR_WIDTH) / 2;

export default RESIZE_HANDLE_COLUMN_OVERLAP;
