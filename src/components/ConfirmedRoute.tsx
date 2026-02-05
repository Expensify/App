import React, {useCallback, useEffect} from 'react';
import type {ReactNode} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {getWaypointIndex} from '@libs/TransactionUtils';
import {init as initMapboxToken, stop as stopMapboxToken} from '@userActions/MapboxToken';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Transaction} from '@src/types/onyx';
import type {WaypointCollection} from '@src/types/onyx/Transaction';
import type IconAsset from '@src/types/utils/IconAsset';
import DistanceMapView from './DistanceMapView';
import ImageSVG from './ImageSVG';
import type {WayPoint} from './MapView/MapViewTypes';
import PendingMapView from './MapView/PendingMapView';

type ConfirmedRouteProps = {
    /** Transaction that stores the distance expense data */
    transaction: OnyxEntry<Transaction>;

    /** Whether the size of the route pending icon is smaller. */
    isSmallerIcon?: boolean;

    /** Whether it should have border radius */
    shouldHaveBorderRadius?: boolean;

    /** Whether it should display the Mapbox map only when the route/coordinates exist otherwise
     * it will display pending map icon */
    requireRouteToDisplayMap?: boolean;

    /** Whether the map is interactive or not */
    interactive?: boolean;
};

function ConfirmedRoute({transaction, isSmallerIcon, shouldHaveBorderRadius = true, requireRouteToDisplayMap = false, interactive}: ConfirmedRouteProps) {
    const {isOffline} = useNetwork();
    const {route0: route} = transaction?.routes ?? {};
    const waypoints = transaction?.comment?.waypoints ?? {};
    const coordinates = route?.geometry?.coordinates ?? [];
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const icons = useMemoizedLazyExpensifyIcons(['DotIndicator', 'DotIndicatorUnfilled', 'Location'] as const);

    const [mapboxAccessToken] = useOnyx(ONYXKEYS.MAPBOX_ACCESS_TOKEN, {canBeMissing: true});

    const getMarkerComponent = useCallback(
        (icon: IconAsset): ReactNode => (
            <ImageSVG
                src={icon}
                width={CONST.MAP_MARKER_SIZE}
                height={CONST.MAP_MARKER_SIZE}
                fill={theme.icon}
            />
        ),
        [theme],
    );

    const getWaypointMarkers = useCallback(
        (waypointsData: WaypointCollection): WayPoint[] => {
            const numberOfWaypoints = Object.keys(waypointsData).length;
            const lastWaypointIndex = numberOfWaypoints - 1;

            return Object.entries(waypointsData)
                .map(([key, waypoint]) => {
                    if (!waypoint?.lat || !waypoint?.lng) {
                        return;
                    }

                    const index = getWaypointIndex(key);
                    let MarkerComponent: IconAsset;
                    if (index === 0) {
                        MarkerComponent = icons.DotIndicatorUnfilled;
                    } else if (index === lastWaypointIndex) {
                        MarkerComponent = icons.Location;
                    } else {
                        MarkerComponent = icons.DotIndicator;
                    }

                    return {
                        id: `${waypoint.lng},${waypoint.lat},${index}`,
                        coordinate: [waypoint.lng, waypoint.lat] as const,
                        markerComponent: (): ReactNode => getMarkerComponent(MarkerComponent),
                    };
                })
                .filter((waypoint): waypoint is WayPoint => !!waypoint);
        },
        [getMarkerComponent, icons.DotIndicator, icons.DotIndicatorUnfilled, icons.Location],
    );

    const waypointMarkers = getWaypointMarkers(waypoints);

    useEffect(() => {
        initMapboxToken();
        return stopMapboxToken;
    }, []);

    const shouldDisplayMap = !requireRouteToDisplayMap || !!coordinates.length;

    return !isOffline && !!mapboxAccessToken?.token && shouldDisplayMap ? (
        <DistanceMapView
            interactive={interactive}
            accessToken={mapboxAccessToken?.token ?? ''}
            mapPadding={CONST.MAPBOX.PADDING}
            pitchEnabled={false}
            initialState={{
                zoom: CONST.MAPBOX.DEFAULT_ZOOM,
                location: waypointMarkers?.at(0)?.coordinate ?? CONST.MAPBOX.DEFAULT_COORDINATE,
            }}
            directionCoordinates={coordinates as Array<[number, number]>}
            style={[styles.mapView, shouldHaveBorderRadius && styles.br4]}
            waypoints={waypointMarkers}
            styleURL={CONST.MAPBOX.STYLE_URL}
            requireRouteToDisplayMap={requireRouteToDisplayMap}
        />
    ) : (
        <PendingMapView
            isSmallerIcon={isSmallerIcon}
            style={!shouldHaveBorderRadius && StyleUtils.getBorderRadiusStyle(0)}
        />
    );
}

export default ConfirmedRoute;
