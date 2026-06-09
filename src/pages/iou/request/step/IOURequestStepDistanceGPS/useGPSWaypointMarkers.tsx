import type {ReactNode} from 'react';
import type {WayPoint} from '@components/MapView/MapViewTypes';
import useMapMarkers from '@hooks/useMapMarkers';
import type {MapMarkerType} from '@hooks/useMapMarkers/types';
import useOnyx from '@hooks/useOnyx';
import {getGPSWaypoints, isTripStopped as isTripStoppedUtil} from '@libs/GPSDraftDetailsUtils';
import ONYXKEYS from '@src/ONYXKEYS';

function useGPSWaypointMarkers(): WayPoint[] {
    const getMapMarkerIconComponent = useMapMarkers();

    const [gpsDraftDetails] = useOnyx(ONYXKEYS.GPS_DRAFT_DETAILS);

    const isTripStopped = isTripStoppedUtil(gpsDraftDetails);

    const gpsWaypoints = getGPSWaypoints(gpsDraftDetails);
    const waypointEntries = Object.entries(gpsWaypoints);
    const lastIndex = waypointEntries.length - 1;

    return waypointEntries.flatMap(([key, waypoint], index): WayPoint[] => {
        const isStart = index === 0;
        const isEnd = index === lastIndex;

        if (isEnd && !isTripStopped) {
            return [];
        }

        let markerType: MapMarkerType = 'WAYPOINT';
        if (isStart) {
            markerType = 'START_WAYPOINT';
        } else if (isEnd) {
            markerType = 'STOP_WAYPOINT';
        }

        return [
            {
                id: key,
                coordinate: [waypoint.lng, waypoint.lat],
                markerComponent: (): ReactNode => getMapMarkerIconComponent(markerType),
            },
        ];
    });
}

export default useGPSWaypointMarkers;
