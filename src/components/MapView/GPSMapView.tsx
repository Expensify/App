import Button from '@components/ButtonComposed';
import ImageSVG from '@components/ImageSVG';

import useAppFocusEvent from '@hooks/useAppFocusEvent';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useOnyx from '@hooks/useOnyx';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';
import useLocalize from '@src/hooks/useLocalize';
import useNetwork from '@src/hooks/useNetwork';
import ONYXKEYS from '@src/ONYXKEYS';

import type {MapState} from '@rnmapbox/maps';

import {useFocusEffect} from '@react-navigation/native';
import Mapbox, {MarkerView} from '@rnmapbox/maps';
import {getForegroundPermissionsAsync} from 'expo-location';
import {useEffect, useRef, useState} from 'react';
import {View} from 'react-native';
import {useSharedValue} from 'react-native-reanimated';

import type {GPSMapViewProps} from './MapViewTypes';

import Compass from './Compass';
import GPSDirection from './GPSDirection';
import GPSWaypointLayer from './GPSWaypointLayer';
import LayerOrderAnchors from './LayerOrderAnchors';
import PendingMapView from './PendingMapView';
import responder from './responder';
import useAccessToken from './useAccessToken';
import utils from './utils';

const LOCATION_PUCK_PULSING = {
    isEnabled: true,
    color: CONST.MAP_CURRENT_LOCATION_FILL_COLOR,
    radius: 40.0,
};

const CURRENT_LOCATION_PUCK_IMAGE = 'current-location-puck-image';

function GPSMapView({accessToken, style, mapPadding, styleURL, pitchEnabled, waypoints, directionCoordinates: directionCoordinatesProp, isTrackingGPS}: GPSMapViewProps) {
    const directionCoordinates = utils.convertSegmentedRouteToSingleSegmentRoute(directionCoordinatesProp);
    const noWaypoints = !waypoints || waypoints.length === 0;

    const {isOffline} = useNetwork();
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const theme = useTheme();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Crosshair', 'MapCurrentLocationPuck', 'MapCurrentLocation']);
    const isAccessTokenReady = useAccessToken({accessToken});

    const cameraRef = useRef<Mapbox.Camera>(null);

    const [foregroundLocationPermissionsGranted, setForegroundLocationPermissionsGranted] = useState<boolean | null>(null);

    // Check (never request) foreground location permissions to determine if we can use the followUserLocation prop on the map camera.
    // Requesting here would trigger an OS prompt on open without a prior explicit user action, so we only read the current status.
    useFocusEffect(() => {
        if (isOffline) {
            return;
        }

        let ignore = false;
        getForegroundPermissionsAsync().then(({granted}) => {
            if (ignore) {
                return;
            }
            setForegroundLocationPermissionsGranted(granted);
        });

        return () => {
            ignore = true;
        };
    });

    // Check for foreground location permissions in case user backgrounded app and foregrounded it again
    // to ensure we have the latest permissions status in case user changed them in the settings in the meantime
    useAppFocusEvent(() => {
        if (isOffline) {
            return;
        }
        getForegroundPermissionsAsync().then(({granted}) => {
            setForegroundLocationPermissionsGranted(granted);
        });
    });

    const [userLocation] = useOnyx(ONYXKEYS.USER_LOCATION);
    const centerCoordinate = userLocation ? [userLocation.longitude, userLocation.latitude] : CONST.MAPBOX.DEFAULT_COORDINATE;

    const [userInteractedWithMap, setUserInteractedWithMap] = useState(false);
    const [shouldUseImmediateFollowTransition, setShouldUseImmediateFollowTransition] = useState(noWaypoints || isTrackingGPS);
    const [lastLocation, setLastLocation] = useState<{longitude: number; latitude: number} | undefined>();

    // Determines if map can be panned to user's detected location without bothering the user. It will return
    // false if user has already started dragging the map or if there are one or more waypoints present
    // and the GPS trip is not active or the foreground location permissions are not granted.
    const shouldFollowUserLocation = !userInteractedWithMap && (noWaypoints || isTrackingGPS) && foregroundLocationPermissionsGranted !== false;

    // When the route/waypoints are cleared (e.g. discarding a GPS trip),
    // resume following the user's current location.
    const prevWaypointsLength = useRef(waypoints?.length ?? 0);
    useEffect(() => {
        const currentLength = waypoints?.length ?? 0;
        if (prevWaypointsLength.current > 0 && currentLength === 0) {
            // Reset the user interaction state to allow the map to follow the user's location
            setUserInteractedWithMap(false);

            // If foreground location permissions are not granted, center the map on the fallback location
            if (!foregroundLocationPermissionsGranted) {
                cameraRef.current?.setCamera({
                    zoomLevel: CONST.MAPBOX.DEFAULT_ZOOM,
                    animationDuration: CONST.MAPBOX.ANIMATION_DURATION_ON_CENTER_ME,
                    centerCoordinate,
                });
            }
        }
        prevWaypointsLength.current = currentLength;
        // only run when waypoints length changes
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [waypoints?.length]);

    useFocusEffect(() => {
        if (noWaypoints || shouldFollowUserLocation || !!lastLocation || userInteractedWithMap) {
            return;
        }

        const {southWest, northEast} = utils.getBounds(
            waypoints.map((waypoint) => waypoint.coordinate),
            directionCoordinates,
        );
        cameraRef.current?.fitBounds(northEast, southWest, mapPadding, CONST.MAPBOX.ANIMATION_DURATION_ON_CENTER_ME);
    });

    const centerMap = () => {
        const waypointCoordinates = waypoints?.map((waypoint) => waypoint.coordinate) ?? [];
        if (!isTrackingGPS && (waypointCoordinates.length > 1 || directionCoordinates?.length > 1)) {
            const {southWest, northEast} = utils.getBounds(waypointCoordinates, directionCoordinates);
            cameraRef.current?.fitBounds(southWest, northEast, mapPadding, CONST.MAPBOX.ANIMATION_DURATION_ON_CENTER_ME);
            return;
        }
        // Reset the user interaction state to allow the map to follow the user's location
        setUserInteractedWithMap(false);

        // If foreground location permissions are not granted, center the map on the fallback location
        if (!foregroundLocationPermissionsGranted) {
            cameraRef.current?.setCamera({
                zoomLevel: CONST.MAPBOX.DEFAULT_ZOOM,
                animationDuration: CONST.MAPBOX.ANIMATION_DURATION_ON_CENTER_ME,
                centerCoordinate,
            });
        }
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

    const onUserLocationUpdate = (update: Mapbox.Location) => {
        const coords = update.coords;
        setLastLocation({longitude: coords.longitude, latitude: coords.latitude});
    };

    const shouldFollowFallbackLocation = noWaypoints && foregroundLocationPermissionsGranted === false;

    const cameraPadding: Mapbox.CameraPadding | undefined =
        mapPadding !== undefined ? {paddingLeft: mapPadding, paddingRight: mapPadding, paddingTop: mapPadding, paddingBottom: mapPadding} : undefined;

    // defaultSettings with bounds ensures there is immediate snap to GPS trip on map load
    const defaultSettings: Mapbox.CameraStop | undefined = {
        bounds: waypointsBounds,
        padding: waypointsBounds ? cameraPadding : undefined,
        centerCoordinate: shouldFollowFallbackLocation ? centerCoordinate : undefined,
        zoomLevel: shouldFollowFallbackLocation ? CONST.MAPBOX.DEFAULT_ZOOM : undefined,
    };

    const mapHeading = useSharedValue(0);

    const onCameraChanged = (e: MapState) => {
        mapHeading.set(e.properties.heading ?? 0);
    };

    return !isOffline && isAccessTokenReady && foregroundLocationPermissionsGranted !== null ? (
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
                compassEnabled={false}
                onCameraChanged={onCameraChanged}
                logoPosition={{...styles.l2, ...styles.b2}}
                {...responder.panHandlers}
            >
                <LayerOrderAnchors />

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
                    bounds={waypointsBounds ? {...waypointsBounds, ...cameraPadding} : undefined}
                    defaultSettings={defaultSettings}
                    centerCoordinate={shouldFollowFallbackLocation ? centerCoordinate : undefined}
                />

                {/** Show fallback location if foreground location permissions are not granted */}
                {foregroundLocationPermissionsGranted === false && (
                    <MarkerView
                        id={CONST.MAP_VIEW_LAYERS.USER_LOCATION}
                        coordinate={centerCoordinate}
                        allowOverlap
                    >
                        <ImageSVG
                            src={expensifyIcons.MapCurrentLocation}
                            width={CONST.MAP_MARKER_SIZES.CURRENT_LOCATION.width}
                            height={CONST.MAP_MARKER_SIZES.CURRENT_LOCATION.height}
                        />
                    </MarkerView>
                )}

                <Mapbox.Images>
                    <Mapbox.Image name={CURRENT_LOCATION_PUCK_IMAGE}>
                        <ImageSVG
                            src={expensifyIcons.MapCurrentLocationPuck}
                            width={CONST.MAP_MARKER_SIZES.CURRENT_LOCATION.width}
                            height={CONST.MAP_MARKER_SIZES.CURRENT_LOCATION.height}
                        />
                    </Mapbox.Image>
                </Mapbox.Images>

                {/** We want to use our custom current location marker instead of the default one */}
                {!!foregroundLocationPermissionsGranted && (
                    <>
                        <Mapbox.LocationPuck
                            pulsing={LOCATION_PUCK_PULSING}
                            topImage={CURRENT_LOCATION_PUCK_IMAGE}
                        />
                        <Mapbox.UserLocation
                            onUpdate={onUserLocationUpdate}
                            visible={false}
                        />
                    </>
                )}

                <GPSWaypointLayer
                    waypoints={waypoints}
                    belowLayerID={CONST.MAP_VIEW_LAYERS.WAYPOINTS_ANCHOR}
                />

                {!noWaypoints && (
                    <GPSDirection
                        directionCoordinates={directionCoordinatesProp}
                        isTrackingGPS={isTrackingGPS}
                        lastLocation={lastLocation}
                        belowLayerID={CONST.MAP_VIEW_LAYERS.ROUTE_ANCHOR}
                    />
                )}
            </Mapbox.MapView>
            <Compass
                interactive
                shouldDisplayCompass
                cameraRef={cameraRef}
                mapHeading={mapHeading}
            />
            <View style={[styles.pAbsolute, styles.p5, styles.t0, styles.r0, styles.zIndex1]}>
                <Button
                    onPress={centerMap}
                    accessibilityLabel={translate('common.center')}
                >
                    <Button.Icon
                        src={expensifyIcons.Crosshair}
                        fill={theme.icon}
                        hoverFill={theme.icon}
                    />
                </Button>
            </View>
        </View>
    ) : (
        <PendingMapView
            title={translate('distance.mapPending.title')}
            subtitle={isOffline ? translate('distance.mapPending.subtitle') : translate('distance.mapPending.onlineSubtitle')}
            style={styles.mapEditView}
        />
    );
}

export default GPSMapView;
