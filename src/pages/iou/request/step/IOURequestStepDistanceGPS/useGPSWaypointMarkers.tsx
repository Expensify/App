import type {ReactNode} from 'react';
import {useCallback, useMemo} from 'react';
import ImageSVG from '@components/ImageSVG';
import type {WayPoint} from '@components/MapView/MapViewTypes';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useTheme from '@hooks/useTheme';
import {getGpsPoints, getGPSWaypoints, isTripStopped as isTripStoppedUtil} from '@libs/GPSDraftDetailsUtils';
import CONST from '@src/CONST';
import type {GpsDraftDetails} from '@src/types/onyx';
import type {TrimmedGPSPoint} from '@src/types/onyx/GpsDraftDetails';

type UseGPSWaypointMarkersProps = {
    gpsDraftDetails: GpsDraftDetails | undefined;
    trimmedEndPoint?: TrimmedGPSPoint;
};

function useGPSWaypointMarkers({gpsDraftDetails, trimmedEndPoint: trimmedEndPointProp}: UseGPSWaypointMarkersProps) {
    const theme = useTheme();

    const trimmedEndPoint = trimmedEndPointProp ?? gpsDraftDetails?.trimmedEndPoint;

    const isTripStopped = isTripStoppedUtil(gpsDraftDetails);
    const gpsWaypoints = getGPSWaypoints(gpsDraftDetails, trimmedEndPoint);

    const {DotIndicatorUnfilled, Location, DotIndicator} = useMemoizedLazyExpensifyIcons(['DotIndicatorUnfilled', 'Location', 'DotIndicator']);

    // Stable component references per icon type so React doesn't see a new component type on every render,
    // which would cause MarkerView children to unmount/remount and flash on Android.
    const DotIndicatorUnfilledMarker = useCallback(
        (): ReactNode => (
            <ImageSVG
                src={DotIndicatorUnfilled}
                width={CONST.MAP_MARKER_SIZE}
                height={CONST.MAP_MARKER_SIZE}
                fill={theme.icon}
            />
        ),
        [DotIndicatorUnfilled, theme.icon],
    );

    const DotIndicatorMarker = useCallback(
        (): ReactNode => (
            <ImageSVG
                src={DotIndicator}
                width={CONST.MAP_MARKER_SIZE}
                height={CONST.MAP_MARKER_SIZE}
                fill={theme.icon}
            />
        ),
        [DotIndicator, theme.icon],
    );

    const LocationMarker = useCallback(
        (): ReactNode => (
            <ImageSVG
                src={Location}
                width={CONST.MAP_MARKER_SIZE}
                height={CONST.MAP_MARKER_SIZE}
                fill={theme.icon}
            />
        ),
        [Location, theme.icon],
    );

    return useMemo((): WayPoint[] => {
        const waypointMarkers = Object.entries(gpsWaypoints).map(([key, waypoint], index): WayPoint | null => {
            const tripSegmentsCount = trimmedEndPoint?.segmentIndex !== undefined ? trimmedEndPoint.segmentIndex + 1 : getGpsPoints(gpsDraftDetails).length;

            if (index === tripSegmentsCount * 2 - 1) {
                if (!isTripStopped) {
                    return null;
                }
                return {
                    id: key,
                    coordinate: [waypoint.lng, waypoint.lat],
                    markerComponent: LocationMarker,
                };
            }

            return {
                id: key,
                coordinate: [waypoint.lng, waypoint.lat],
                markerComponent: index === 0 ? DotIndicatorUnfilledMarker : DotIndicatorMarker,
            };
        });

        return waypointMarkers.filter((waypoint): waypoint is WayPoint => !!waypoint);
    }, [gpsWaypoints, gpsDraftDetails, isTripStopped, trimmedEndPoint?.segmentIndex, DotIndicatorUnfilledMarker, DotIndicatorMarker, LocationMarker]);
}

export default useGPSWaypointMarkers;
