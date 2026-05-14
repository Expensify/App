import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import type {MapMarkerType} from '@hooks/useMapMarkers/types';
import type IconAsset from '@src/types/utils/IconAsset';

function useMapMarkerIconAsset() {
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['MapStartWaypoint', 'MapStopWaypoint', 'MapWaypoint']);

    const getMapMarkerIconAsset = (markerType: MapMarkerType): IconAsset => {
        switch (markerType) {
            case 'START_WAYPOINT':
                return expensifyIcons.MapStartWaypoint;
            case 'STOP_WAYPOINT':
                return expensifyIcons.MapStopWaypoint;
            default:
                return expensifyIcons.MapWaypoint;
        }
    };

    return getMapMarkerIconAsset;
}

export default useMapMarkerIconAsset;
