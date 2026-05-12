import React from 'react';
import type {ReactNode} from 'react';
import ImageSVG from '@components/ImageSVG';
import type {WayPoint} from '@components/MapView/MapViewTypes';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useOnyx from '@hooks/useOnyx';
import useTheme from '@hooks/useTheme';
import {getGPSWaypoints, isTripStopped as isTripStoppedUtil} from '@libs/GPSDraftDetailsUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type IconAsset from '@src/types/utils/IconAsset';

function useGPSWaypointMarkers(): WayPoint[] {
    const theme = useTheme();
    const {DotIndicatorUnfilled, Location, DotIndicator} = useMemoizedLazyExpensifyIcons(['DotIndicatorUnfilled', 'Location', 'DotIndicator']);

    const [gpsDraftDetails] = useOnyx(ONYXKEYS.GPS_DRAFT_DETAILS);

    const isTripStopped = isTripStoppedUtil(gpsDraftDetails);

    const getMarkerComponent = (icon: IconAsset): ReactNode => (
        <ImageSVG
            src={icon}
            width={CONST.MAP_MARKER_SIZE}
            height={CONST.MAP_MARKER_SIZE}
            fill={theme.icon}
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

        let icon = DotIndicator;
        if (isStart) {
            icon = DotIndicatorUnfilled;
        } else if (isEnd) {
            icon = Location;
        }

        return [
            {
                id: key,
                coordinate: [waypoint.lng, waypoint.lat],
                markerComponent: (): ReactNode => getMarkerComponent(icon),
            },
        ];
    });
}

export default useGPSWaypointMarkers;
