import type CONST from '@src/CONST';

type MapMarkerType = Exclude<keyof typeof CONST.MAP_MARKER_SIZES, 'CURRENT_LOCATION'>;

// eslint-disable-next-line import/prefer-default-export
export type {MapMarkerType};
