import {useFocusEffect} from '@react-navigation/native';
import Mapbox, {setAccessToken} from '@rnmapbox/maps';
import {useEffect, useRef, useState} from 'react';
import {Platform, View} from 'react-native';
import Button from '@components/Button';
import ImageSVG from '@components/ImageSVG';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import useLocalize from '@src/hooks/useLocalize';
import useNetwork from '@src/hooks/useNetwork';
import Direction from './Direction';
import GPSWaypointLayer from './GPSWaypointLayer';
import type {Coordinate, GPSMapViewProps} from './MapViewTypes';
import PendingMapView from './PendingMapView';
import responder from './responder';
import useAnimatedTrailingDirectionCoordinate from './useAnimatedTrailingDirectionCoordinate';
import utils from './utils';

// The native Mapbox SDK renders the user-location puck on its own dedicated layer. We draw the route below
// that layer so the puck always stays on top of the line. The layer id differs per platform.
const LOCATION_PUCK_LAYER_ID = Platform.select({ios: 'puck', android: 'mapbox-location-indicator-layer'});
const LOCATION_PUCK_PULSING = {
    isEnabled: true,
    color: '#0185FF',
    radius: 40.0,
};

const CURRENT_LOCATION_PUCK_IMAGE = 'current-location-puck-image';

function GPSMapView({accessToken, style, mapPadding, styleURL, pitchEnabled, waypoints, directionCoordinates: directionCoordinatesProp, isTrackingGPS}: GPSMapViewProps) {
    const directionCoordinates = !directionCoordinatesProp || utils.isSingleSegmentRoute(directionCoordinatesProp) ? directionCoordinatesProp : directionCoordinatesProp.flat();
    const noWaypoints = !waypoints || waypoints.length === 0;

    const {isOffline} = useNetwork();
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const theme = useTheme();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Crosshair', 'MapCurrentLocationPuck']);

    const cameraRef = useRef<Mapbox.Camera>(null);

    const [userInteractedWithMap, setUserInteractedWithMap] = useState(false);
    const [shouldUseImmediateFollowTransition, setShouldUseImmediateFollowTransition] = useState(noWaypoints);
    const [isAccessTokenSet, setIsAccessTokenSet] = useState(false);
    const [lastLocation, setLastLocation] = useState<{longitude: number; latitude: number} | undefined>();

    const [hasEverTrackedGPS, setHasEverTrackedGPS] = useState(!!isTrackingGPS);
    useEffect(() => {
        if (!isTrackingGPS) {
            return;
        }
        setHasEverTrackedGPS(true);
    }, [isTrackingGPS]);

    // Determines if map can be panned to user's detected location without bothering the user. It will return
    // false if user has already started dragging the map or if there are one or more waypoints present and the GPS trip is not active.
    const shouldFollowUserLocation = !userInteractedWithMap && (noWaypoints || isTrackingGPS);

    // When the route/waypoints are cleared (e.g. discarding a GPS trip),
    // resume following the user's current location.
    const prevWaypointsLength = useRef(waypoints?.length ?? 0);
    useEffect(() => {
        const currentLength = waypoints?.length ?? 0;
        if (prevWaypointsLength.current > 0 && currentLength === 0) {
            setUserInteractedWithMap(false);
        }
        prevWaypointsLength.current = currentLength;
    }, [waypoints?.length]);

    useFocusEffect(() => {
        if (noWaypoints || shouldFollowUserLocation || !!lastLocation || userInteractedWithMap) {
            return;
        }

        const {southWest, northEast} = utils.getBounds(
            waypoints.map((waypoint) => waypoint.coordinate),
            directionCoordinates,
        );
        cameraRef.current?.fitBounds(northEast, southWest, mapPadding, 1000);
    });

    useEffect(() => {
        setAccessToken(accessToken).then((token) => {
            if (!token) {
                return;
            }
            setIsAccessTokenSet(true);
        });
    }, [accessToken]);

    useEffect(() => {
        setAccessToken(accessToken).then((token) => {
            if (!token) {
                return;
            }
            setIsAccessTokenSet(true);
        });
    }, [accessToken]);

    const centerMap = () => {
        const waypointCoordinates = waypoints?.map((waypoint) => waypoint.coordinate) ?? [];
        if (!isTrackingGPS && (waypointCoordinates.length > 1 || (directionCoordinates ?? []).length > 1)) {
            const {southWest, northEast} = utils.getBounds(waypoints?.map((waypoint) => waypoint.coordinate) ?? [], directionCoordinates);
            cameraRef.current?.fitBounds(southWest, northEast, mapPadding, CONST.MAPBOX.ANIMATION_DURATION_ON_CENTER_ME);
            return;
        }
        setUserInteractedWithMap(false);
    };

    const getWaypointBounds = () => {
        if (!waypoints || userInteractedWithMap || (!waypoints.length && !directionCoordinates?.length)) {
            return undefined;
        }

        const {northEast, southWest} = utils.getBounds(
            waypoints.map((waypoint) => waypoint.coordinate),
            directionCoordinates,
        );
        return {ne: northEast, sw: southWest};
    };

    const waypointsBounds = getWaypointBounds();

    const getTrailingSegmentMetadata = () => {
        const lastSegment = directionCoordinatesProp?.at(-1);

        if (!lastSegment?.length) {
            return {
                secondToLastCoordinate: undefined,
                lastSegmentStartCoordinate: undefined,
            };
        }

        const lastSegmentStartCoordinate = lastSegment.at(0);
        const secondToLastCoordinate = lastSegment.length === 1 ? lastSegmentStartCoordinate : lastSegment.at(-2);

        return {
            secondToLastCoordinate,
            lastSegmentStartCoordinate,
        };
    };

    const trailingSegmentMetadata = getTrailingSegmentMetadata();

    const animatedTrailingCoordinate = useAnimatedTrailingDirectionCoordinate({
        isEnabled: !!isTrackingGPS,
        segmentCount: directionCoordinatesProp?.length ?? 0,
        lastSegmentStartLongitude: trailingSegmentMetadata.lastSegmentStartCoordinate?.at(0),
        lastSegmentStartLatitude: trailingSegmentMetadata.lastSegmentStartCoordinate?.at(1),
        secondToLastLongitude: trailingSegmentMetadata.secondToLastCoordinate?.at(0),
        secondToLastLatitude: trailingSegmentMetadata.secondToLastCoordinate?.at(1),
        targetLongitude: lastLocation?.longitude,
        targetLatitude: lastLocation?.latitude,
        durationMs: CONST.MAPBOX.GPS_ROUTE_ANIMATION_DURATION_MS,
    });

    const getCoordinates = () => {
        if (!isTrackingGPS || !lastLocation || !directionCoordinatesProp || directionCoordinatesProp.length === 0) {
            return directionCoordinatesProp;
        }

        const lastSegment = directionCoordinatesProp.at(-1);
        if (!lastSegment) {
            return directionCoordinatesProp;
        }

        if (lastSegment.length === 0) {
            return directionCoordinatesProp;
        }

        const lastLocationCoordinate: Coordinate = animatedTrailingCoordinate ?? [lastLocation.longitude, lastLocation.latitude];

        const newLastSegment = [...lastSegment.slice(0, lastSegment.length === 1 ? undefined : -1), lastLocationCoordinate];

        const newDirectionCoordinates = [...directionCoordinatesProp.slice(0, directionCoordinatesProp.length - 1), newLastSegment];
        return newDirectionCoordinates;
    };

    const onUserLocationUpdate = (update: Mapbox.Location) => {
        const coords = update.coords;
        setLastLocation({longitude: coords.longitude, latitude: coords.latitude});
    };

    return !isOffline && isAccessTokenSet ? (
        <>
            <View style={style}>
                <Mapbox.MapView
                    style={{flex: 1}}
                    styleURL={styleURL}
                    onTouchStart={() => setUserInteractedWithMap(true)}
                    pitchEnabled={pitchEnabled}
                    attributionPosition={{...styles.r2, ...styles.b2}}
                    scaleBarEnabled={false}
                    // We use scaleBarPosition with top: -32 to hide the scale bar on iOS because scaleBarEnabled={false} not work on iOS
                    scaleBarPosition={{...styles.tn8, left: 0}}
                    compassEnabled
                    compassPosition={{...styles.l2, ...styles.t5}}
                    logoPosition={{...styles.l2, ...styles.b2}}
                    {...responder.panHandlers}
                >
                    <Mapbox.Viewport
                        onStatusChanged={(event) => {
                            if (!shouldUseImmediateFollowTransition) {
                                return;
                            }

                            if (event.from.kind === 'transition' && event.from.toState.kind === 'followPuck') {
                                setShouldUseImmediateFollowTransition(false);
                            }
                        }}
                    />
                    <Mapbox.Camera
                        ref={cameraRef}
                        followUserLocation={shouldFollowUserLocation}
                        followUserLocationUseImmediateTransition={shouldUseImmediateFollowTransition}
                        followZoomLevel={CONST.MAPBOX.DEFAULT_ZOOM}
                        bounds={waypointsBounds ? {...waypointsBounds, paddingLeft: mapPadding, paddingRight: mapPadding, paddingTop: mapPadding, paddingBottom: mapPadding} : undefined}
                        // defaultSettings with bounds ensures there is immediate snap to GPS trip on map load
                        defaultSettings={{bounds: waypointsBounds}}
                    />

                    {/** We want to use our custom current location marker instead of the default one */}
                    <Mapbox.Images>
                        <Mapbox.Image name={CURRENT_LOCATION_PUCK_IMAGE}>
                            <ImageSVG
                                src={expensifyIcons.MapCurrentLocationPuck}
                                width={CONST.MAP_MARKER_SIZES.CURRENT_LOCATION.width}
                                height={CONST.MAP_MARKER_SIZES.CURRENT_LOCATION.height}
                            />
                        </Mapbox.Image>
                    </Mapbox.Images>
                    <Mapbox.LocationPuck
                        pulsing={LOCATION_PUCK_PULSING}
                        topImage={CURRENT_LOCATION_PUCK_IMAGE}
                    />
                    <Mapbox.UserLocation
                        onUpdate={onUserLocationUpdate}
                        visible={false}
                    />

                    <GPSWaypointLayer
                        waypoints={waypoints}
                        // To ensure that waypoints are shown below the location puck we need to pass its belowLayerID
                        // which on iOS is not ready on the first render, so we pass it only after user has started a GPS trip
                        // Android does not support dynamic belowLayerID prop change, so we pass key to remount this component instead
                        key={hasEverTrackedGPS || isTrackingGPS ? 'below-location-puck' : 'default'}
                        belowLayerID={hasEverTrackedGPS || isTrackingGPS ? LOCATION_PUCK_LAYER_ID : undefined}
                    />

                    {!!directionCoordinatesProp && (
                        <Direction
                            coordinates={getCoordinates()}
                            belowLayerID={CONST.MAP_VIEW_LAYERS.WAYPOINTS}
                        />
                    )}
                </Mapbox.MapView>
                <View style={[styles.pAbsolute, styles.p5, styles.t0, styles.r0, {zIndex: 1}]}>
                    <Button
                        onPress={centerMap}
                        iconFill={theme.icon}
                        icon={expensifyIcons.Crosshair}
                        accessibilityLabel={translate('common.center')}
                    />
                </View>
            </View>
            {!lastLocation && (
                <View style={styles.mapViewOverlay}>
                    <GPSPendingMapView />
                </View>
            )}
        </>
    ) : (
        <GPSPendingMapView />
    );
}

function GPSPendingMapView() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {isOffline} = useNetwork();

    return (
        <PendingMapView
            title={translate('distance.mapPending.title')}
            subtitle={isOffline ? translate('distance.mapPending.subtitle') : translate('distance.mapPending.onlineSubtitle')}
            style={styles.mapEditView}
        />
    );
}

export default GPSMapView;
