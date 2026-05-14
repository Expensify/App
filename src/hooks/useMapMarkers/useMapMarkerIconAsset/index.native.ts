import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import type {MapMarkerType} from '@hooks/useMapMarkers/types';
import type IconAsset from '@src/types/utils/IconAsset';

function useMapMarkerIconAsset() {
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['RNMapStartWaypoint', 'RNMapStopWaypoint', 'RNMapWaypoint']);

    const getMapMarkerIconAsset = (markerType: MapMarkerType): IconAsset => {
        switch (markerType) {
            case 'START_WAYPOINT':
                return expensifyIcons.RNMapStartWaypoint;
            case 'STOP_WAYPOINT':
                return expensifyIcons.RNMapStopWaypoint;
            default:
                return expensifyIcons.RNMapWaypoint;
        }
    };

    return getMapMarkerIconAsset;
}

export default useMapMarkerIconAsset;
