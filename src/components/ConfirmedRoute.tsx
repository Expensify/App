import React, {useCallback, useEffect} from 'react';
import type {ReactNode} from 'react';
import {withOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import useNetwork from '@hooks/useNetwork';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import * as TransactionUtils from '@libs/TransactionUtils';
import * as MapboxToken from '@userActions/MapboxToken';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {MapboxAccessToken, Transaction} from '@src/types/onyx';
import type {WaypointCollection} from '@src/types/onyx/Transaction';
import type IconAsset from '@src/types/utils/IconAsset';
import DistanceMapView from './DistanceMapView';
import * as Expensicons from './Icon/Expensicons';
import ImageSVG from './ImageSVG';
import type {WayPoint} from './MapView/MapViewTypes';
import PendingMapView from './MapView/PendingMapView';

type ConfirmedRoutePropsOnyxProps = {
    /** Data about Mapbox token for calling Mapbox API */
    mapboxAccessToken: OnyxEntry<MapboxAccessToken>;
};

type ConfirmedRouteProps = ConfirmedRoutePropsOnyxProps & {
    /** Transaction that stores the distance request data */
    transaction: Transaction;
};

function ConfirmedRoute({mapboxAccessToken, transaction}: ConfirmedRouteProps) {
    const {isOffline} = useNetwork();
    const {route0: route} = transaction.routes ?? {};
    const waypoints = transaction.comment?.waypoints ?? {};
    const coordinates = route?.geometry?.coordinates ?? [];
    const theme = useTheme();
    const styles = useThemeStyles();

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

                    const index = TransactionUtils.getWaypointIndex(key);
                    let MarkerComponent: IconAsset;
                    if (index === 0) {
                        MarkerComponent = Expensicons.DotIndicatorUnfilled;
                    } else if (index === lastWaypointIndex) {
                        MarkerComponent = Expensicons.Location;
                    } else {
                        MarkerComponent = Expensicons.DotIndicator;
                    }

                    return {
                        id: `${waypoint.lng},${waypoint.lat},${index}`,
                        coordinate: [waypoint.lng, waypoint.lat] as const,
                        markerComponent: (): ReactNode => getMarkerComponent(MarkerComponent),
                    };
                })
                .filter((waypoint): waypoint is WayPoint => !!waypoint);
        },
        [getMarkerComponent],
    );

    const waypointMarkers = getWaypointMarkers(waypoints);

    useEffect(() => {
        MapboxToken.init();
        return MapboxToken.stop;
    }, []);

    return !isOffline && Boolean(mapboxAccessToken?.token) ? (
        <DistanceMapView
            accessToken={mapboxAccessToken?.token ?? ''}
            mapPadding={CONST.MAP_PADDING}
            pitchEnabled={false}
            initialState={{
                zoom: CONST.MAPBOX.DEFAULT_ZOOM,
                location: waypointMarkers?.[0]?.coordinate ?? (CONST.MAPBOX.DEFAULT_COORDINATE as [number, number]),
            }}
            directionCoordinates={coordinates as Array<[number, number]>}
            style={[styles.mapView, styles.br4]}
            waypoints={waypointMarkers}
            styleURL={CONST.MAPBOX.STYLE_URL}
        />
    ) : (
        <PendingMapView />
    );
}

export default withOnyx<ConfirmedRouteProps, ConfirmedRoutePropsOnyxProps>({
    mapboxAccessToken: {
        key: ONYXKEYS.MAPBOX_ACCESS_TOKEN,
    },
})(ConfirmedRoute);

ConfirmedRoute.displayName = 'ConfirmedRoute';
