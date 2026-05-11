import CONST from '@src/CONST';

type MapMarkerType = keyof typeof CONST.MAP_MARKER_SIZES;

function getMapMarkerSize(markerType: MapMarkerType): {width: number; height: number} {
    return CONST.MAP_MARKER_SIZES[markerType];
}

export {getMapMarkerSize};
export type {MapMarkerType};
