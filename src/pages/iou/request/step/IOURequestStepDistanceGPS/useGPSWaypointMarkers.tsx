import React from 'react';
import type {ReactNode} from 'react';
import ImageSVG from '@components/ImageSVG';
import type {WayPoint} from '@components/MapView/MapViewTypes';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useOnyx from '@hooks/useOnyx';
import {getMapMarkerSize} from '@libs/getMapMarkerSize';
import {getGPSWaypoints, isTripStopped as isTripStoppedUtil} from '@libs/GPSDraftDetailsUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type IconAsset from '@src/types/utils/IconAsset';

function useGPSWaypointMarkers(): WayPoint[] {
    const {MapStartWaypoint, MapStopWaypoint, MapWaypoint} = useMemoizedLazyExpensifyIcons(['MapStartWaypoint', 'MapStopWaypoint', 'MapWaypoint']);

    const [gpsDraftDetails] = useOnyx(ONYXKEYS.GPS_DRAFT_DETAILS);

    const isTripStopped = isTripStoppedUtil(gpsDraftDetails);

    const getMarkerComponent = (icon: IconAsset, width: number, height: number): ReactNode => (
        <ImageSVG
            src={icon}
            width={width}
            height={height}
        />
    );

    const gpsWaypoints = getGPSWaypoints(gpsDraftDetails);
    const waypointEntries = Object.entries(gpsWaypoints);
    const lastIndex = waypointEntries.length - 1;

    return waypointEntries.flatMap(([key, waypoint], index): WayPoint[] => {
        const isStart = index === 0;
        const isEnd = index === lastIndex;

        if (isEnd && !isTripStopped) {
            return [];
        }

        let icon = MapWaypoint;
        let markerSize = getMapMarkerSize('WAYPOINT');
        if (isStart) {
            icon = MapStartWaypoint;
            markerSize = getMapMarkerSize('START_WAYPOINT');
        } else if (isEnd) {
            icon = MapStopWaypoint;
            markerSize = getMapMarkerSize('STOP_WAYPOINT');
        }

        return [
            {
                id: key,
                coordinate: [waypoint.lng, waypoint.lat],
                markerComponent: (): ReactNode => getMarkerComponent(icon, markerSize.width, markerSize.height),
            },
        ];
    });
}

export default useGPSWaypointMarkers;
