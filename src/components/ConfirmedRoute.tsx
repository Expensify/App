import React, {useCallback, useEffect} from 'react';
import {ImageSourcePropType} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import {OnyxEntry} from 'react-native-onyx/lib/types';
import {SvgProps} from 'react-native-svg';
import useNetwork from '@hooks/useNetwork';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import * as TransactionUtils from '@libs/TransactionUtils';
import * as MapboxToken from '@userActions/MapboxToken';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {MapboxAccessToken, Transaction} from '@src/types/onyx';
import {WaypointCollection} from '@src/types/onyx/Transaction';
import DistanceMapView from './DistanceMapView';
import * as Expensicons from './Icon/Expensicons';
import ImageSVG from './ImageSVG';
import {WayPoint} from './MapView/MapViewTypes';
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
    const route = transaction.routes?.route0 ?? {geometry: {coordinates: []}};
    const waypoints = transaction.comment?.waypoints ?? {};
    const coordinates = route.geometry?.coordinates ?? [];
    const theme = useTheme();
    const styles = useThemeStyles();

    const getWaypointMarkers = useCallback(
        (waypointsData: WaypointCollection): Array<WayPoint | undefined> => {
            const numberOfWaypoints = Object.keys(waypointsData).length;
            const lastWaypointIndex = numberOfWaypoints - 1;

            return Object.entries(waypointsData)
                .map(([key, waypoint]) => {
                    if (!waypoint?.lat || !waypoint?.lng) {
                        return;
                    }

                    const index = TransactionUtils.getWaypointIndex(key);
                    let MarkerComponent: React.FC<SvgProps> | ImageSourcePropType;
                    if (index === 0) {
                        MarkerComponent = Expensicons.DotIndicatorUnfilled;
                    } else if (index === lastWaypointIndex) {
                        MarkerComponent = Expensicons.Location;
                    } else {
                        MarkerComponent = Expensicons.DotIndicator;
                    }

                    return {
                        id: `${waypoint.lng},${waypoint.lat},${index}`,
                        coordinate: [waypoint.lng, waypoint.lat] as [number, number],
                        markerComponent: () => (
                            <ImageSVG
                                src={MarkerComponent}
                                width={CONST.MAP_MARKER_SIZE}
                                height={CONST.MAP_MARKER_SIZE}
                                fill={theme.icon}
                            />
                        ),
                    };
                })
                .filter((waypoint) => !!waypoint);
        },
        [theme],
    );

    const waypointMarkers = getWaypointMarkers(waypoints);

    useEffect(() => {
        MapboxToken.init();
        return () => {
            MapboxToken.stop();
        };
    }, []);

    return (
        <>
            {!isOffline && mapboxAccessToken?.token ? (
                <DistanceMapView
                    accessToken={mapboxAccessToken.token}
                    mapPadding={CONST.MAP_PADDING}
                    pitchEnabled={false}
                    initialState={{
                        zoom: CONST.MAPBOX.DEFAULT_ZOOM,
                        location: (waypointMarkers[0]?.coordinate ?? CONST.MAPBOX.DEFAULT_COORDINATE) as number[],
                    }}
                    directionCoordinates={coordinates}
                    style={[styles.mapView, styles.br4]}
                    waypoints={waypointMarkers}
                    styleURL={CONST.MAPBOX.STYLE_URL}
                />
            ) : (
                <PendingMapView />
            )}
        </>
    );
}

export default withOnyx<ConfirmedRouteProps, ConfirmedRoutePropsOnyxProps>({
    mapboxAccessToken: {
        key: ONYXKEYS.MAPBOX_ACCESS_TOKEN,
    },
})(ConfirmedRoute);

ConfirmedRoute.displayName = 'ConfirmedRoute';
