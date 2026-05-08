import type {ReactNode} from 'react';
import ImageSVG from '@components/ImageSVG';
import type {WayPoint} from '@components/MapView/MapViewTypes';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useTheme from '@hooks/useTheme';
import {getGPSWaypoints, isTripStopped as isTripStoppedUtil} from '@libs/GPSDraftDetailsUtils';
import CONST from '@src/CONST';
import type {GpsDraftDetails} from '@src/types/onyx';
import type {TrimmedGPSPoint} from '@src/types/onyx/GpsDraftDetails';
import type IconAsset from '@src/types/utils/IconAsset';

type UseGPSWaypointMarkersProps = {
    gpsDraftDetails: GpsDraftDetails | undefined;
    trimmedEndPoint?: TrimmedGPSPoint;
};

function useGPSWaypointMarkers({gpsDraftDetails, trimmedEndPoint: trimmedEndPointProp}: UseGPSWaypointMarkersProps) {
    const theme = useTheme();

    const trimmedEndPoint = trimmedEndPointProp ?? gpsDraftDetails?.trimmedEndPoint;

    const isTripStopped = isTripStoppedUtil(gpsDraftDetails);

    const {DotIndicatorUnfilled, Location, DotIndicator} = useMemoizedLazyExpensifyIcons(['DotIndicatorUnfilled', 'Location', 'DotIndicator']);

    // Stable component references per icon type so React doesn't see a new component type on every render,
    // which would cause MarkerView children to unmount/remount and flash on Android.
    const getMarkerComponent = (icon: IconAsset): ReactNode => (
        <ImageSVG
            src={icon}
            width={CONST.MAP_MARKER_SIZE}
            height={CONST.MAP_MARKER_SIZE}
            fill={theme.icon}
        />
    );

    const gpsWaypoints = getGPSWaypoints(gpsDraftDetails, trimmedEndPoint);
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
