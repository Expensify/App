import React, {useCallback, useMemo} from 'react';
import type {ReactNode} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import Button from '@components/Button';
import DistanceMapView from '@components/DistanceMapView';
import * as Expensicons from '@components/Icon/Expensicons';
import ImageSVG from '@components/ImageSVG';
import type {WayPoint} from '@components/MapView/MapViewTypes';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import * as TransactionUtils from '@libs/TransactionUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {MapboxAccessToken} from '@src/types/onyx';
import type {WaypointCollection} from '@src/types/onyx/Transaction';
import type Transaction from '@src/types/onyx/Transaction';
import type IconAsset from '@src/types/utils/IconAsset';

const MAX_WAYPOINTS = 25;

type DistanceRequestFooterOnyxProps = {
    /** Data about Mapbox token for calling Mapbox API */
    mapboxAccessToken: OnyxEntry<MapboxAccessToken>;
};

type DistanceRequestFooterProps = DistanceRequestFooterOnyxProps & {
    /** The waypoints for the distance expense */
    waypoints?: WaypointCollection;

    /** Function to call when the user wants to add a new waypoint */
    navigateToWaypointEditPage: (index: number) => void;

    /** The transaction being interacted with */
    transaction: OnyxEntry<Transaction>;
};

function DistanceRequestFooter({waypoints, transaction, mapboxAccessToken, navigateToWaypointEditPage}: DistanceRequestFooterProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const numberOfWaypoints = Object.keys(waypoints ?? {}).length;
    const numberOfFilledWaypoints = Object.values(waypoints ?? {}).filter((waypoint) => waypoint?.address).length;
    const lastWaypointIndex = numberOfWaypoints - 1;

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

    const waypointMarkers = useMemo(
        () =>
            Object.entries(waypoints ?? {})
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
                .filter((waypoint): waypoint is WayPoint => !!waypoint),
        [waypoints, lastWaypointIndex, getMarkerComponent],
    );

    return (
        <>
            {numberOfFilledWaypoints >= 2 && (
                <View style={[styles.flexRow, styles.justifyContentCenter, styles.pt1]}>
                    <Button
                        small
                        icon={Expensicons.Plus}
                        onPress={() => navigateToWaypointEditPage(Object.keys(transaction?.comment?.waypoints ?? {}).length)}
                        text={translate('distance.addStop')}
                        isDisabled={numberOfWaypoints === MAX_WAYPOINTS}
                        innerStyles={[styles.pl10, styles.pr10]}
                    />
                </View>
            )}
            <View style={styles.mapViewContainer}>
                <DistanceMapView
                    accessToken={mapboxAccessToken?.token ?? ''}
                    mapPadding={CONST.MAPBOX.PADDING}
                    pitchEnabled={false}
                    initialState={{
                        zoom: CONST.MAPBOX.DEFAULT_ZOOM,
                        location: waypointMarkers?.[0]?.coordinate ?? (CONST.MAPBOX.DEFAULT_COORDINATE as [number, number]),
                    }}
                    directionCoordinates={(transaction?.routes?.route0?.geometry?.coordinates as Array<[number, number]>) ?? []}
                    style={[styles.mapView, styles.mapEditView]}
                    waypoints={waypointMarkers}
                    styleURL={CONST.MAPBOX.STYLE_URL}
                    overlayStyle={styles.mapEditView}
                />
            </View>
        </>
    );
}

DistanceRequestFooter.displayName = 'DistanceRequestFooter';

export default withOnyx<DistanceRequestFooterProps, DistanceRequestFooterOnyxProps>({
    mapboxAccessToken: {
        key: ONYXKEYS.MAPBOX_ACCESS_TOKEN,
    },
})(DistanceRequestFooter);
