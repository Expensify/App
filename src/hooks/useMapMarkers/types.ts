import type CONST from '@src/CONST';

type MapMarkerType = Exclude<keyof typeof CONST.MAP_MARKER_SIZES, 'CURRENT_LOCATION'>;

/* oxlint-disable-next-line hosted/prefer-default-export */ // eslint-disable-next-line import/prefer-default-export
export type {MapMarkerType};
