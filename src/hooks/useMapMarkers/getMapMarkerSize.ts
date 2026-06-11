import CONST from '@src/CONST';
import type {MapMarkerType} from './types';

function getMapMarkerSize(markerType: MapMarkerType): {width: number; height: number} {
    return CONST.MAP_MARKER_SIZES[markerType];
}

export default getMapMarkerSize;
