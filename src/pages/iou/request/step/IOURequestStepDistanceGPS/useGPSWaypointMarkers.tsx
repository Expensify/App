import type {WayPoint} from '@components/MapView/MapViewTypes';
import type {MapMarkerType} from '@hooks/useMapMarkers/types';
import {getGPSWaypoints, isTripStopped as isTripStoppedUtil} from '@libs/GPSDraftDetailsUtils';
import type {GpsDraftDetails} from '@src/types/onyx';
import type {TrimmedGPSPoint} from '@src/types/onyx/GpsDraftDetails';

type UseGPSWaypointMarkersProps = {
    gpsDraftDetails: GpsDraftDetails | undefined;
    trimmedEndPoint?: TrimmedGPSPoint;
};

function useGPSWaypointMarkers({gpsDraftDetails, trimmedEndPoint: trimmedEndPointProp}: UseGPSWaypointMarkersProps) {
    const trimmedEndPoint = trimmedEndPointProp ?? gpsDraftDetails?.trimmedEndPoint;

    const isTripStopped = isTripStoppedUtil(gpsDraftDetails);

    const gpsWaypoints = getGPSWaypoints(gpsDraftDetails, trimmedEndPoint);
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
                markerType,
            },
        ];
    });
}

export default useGPSWaypointMarkers;
