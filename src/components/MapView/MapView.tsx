import Button from '@components/Button';
import ImageSVG from '@components/ImageSVG';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useOnyx from '@hooks/useOnyx';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import {clearUserLocation, setUserLocation} from '@libs/actions/UserLocation';
import getCurrentPosition from '@libs/getCurrentPosition';
import type {GeolocationErrorCallback} from '@libs/getCurrentPosition/getCurrentPosition.types';
import {GeolocationErrorCode} from '@libs/getCurrentPosition/getCurrentPosition.types';
import TransitionTracker from '@libs/Navigation/TransitionTracker';
import type {CancelHandle} from '@libs/Navigation/TransitionTracker';

import CONST from '@src/CONST';
import useLocalize from '@src/hooks/useLocalize';
import useNetwork from '@src/hooks/useNetwork';
import ONYXKEYS from '@src/ONYXKEYS';

import type {MapState} from '@rnmapbox/maps';

import {useFocusEffect} from '@react-navigation/native';
import Mapbox, {MarkerView} from '@rnmapbox/maps';
import {getForegroundPermissionsAsync} from 'expo-location';
import {memo, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
import {useSharedValue} from 'react-native-reanimated';

import type {MapViewProps} from './MapViewTypes';

import Compass from './Compass';
import Directions from './Directions';
import MapMarkerIcon from './MapMarkerIcon';
import PendingMapView from './PendingMapView';
import responder from './responder';
import useAccessToken from './useAccessToken';
import utils from './utils';

// Default is 1000ms which feels a bit too long for the animations when coming back from waypoints
// selection screen. 300ms is much lower and animations still trigger correctly
const MAX_WAIT_FOR_TRANSITION_TIME_FOR_CAMERA_MOVEMENTS_MS = 300;

function MapView({
    accessToken,
    style,
    mapPadding,
    styleURL,
    pitchEnabled,
    initialState,
    waypoints,
    directionCoordinates,
    alternateDirection,
    setIsAlternateDirectionSelected,
    onMapReady,
    interactive = true,
    distanceInMeters,
    unit,
    shouldDisplayCurrentLocation = true,
    shouldDisplayCompass = true,
}: MapViewProps) {
    const [userLocation] = useOnyx(ONYXKEYS.USER_LOCATION);
    const {isOffline} = useNetwork();
    const {translate, preferredLocale} = useLocalize();
    const styles = useThemeStyles();
    const theme = useTheme();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Crosshair', 'Expand', 'MapCurrentLocation']);
    const cameraRef = useRef<Mapbox.Camera>(null);
    const pendingFramingRef = useRef<CancelHandle | null>(null);
    const [isIdle, setIsIdle] = useState(false);
    const initialLocation = useMemo(() => initialState && {longitude: initialState.location[0], latitude: initialState.location[1]}, [initialState]);
    const currentPosition = userLocation ?? initialLocation;
    const currentPositionLongitude = currentPosition?.longitude;
    const currentPositionLatitude = currentPosition?.latitude;
    const [userInteractedWithMap, setUserInteractedWithMap] = useState(false);
    const [isWaypointsNextCenterTarget, setIsWaypointsNextCenterTarget] = useState(false);
    const shouldInitializeCurrentPosition = useRef(true);
    const isAccessTokenReady = useAccessToken({accessToken});

    // Determines if map can be panned to user's detected
    // location without bothering the user. It will return
    // false if user has already started dragging the map or
    // if there are one or more waypoints present.
    const shouldPanMapToCurrentPosition = useCallback(
        () => !userInteractedWithMap && shouldDisplayCurrentLocation && (!waypoints || waypoints.length === 0),
        [userInteractedWithMap, waypoints, shouldDisplayCurrentLocation],
    );

    const setCurrentPositionToInitialState: GeolocationErrorCallback = useCallback(
        (error) => {
            if (error?.code !== GeolocationErrorCode.PERMISSION_DENIED || !initialLocation) {
                return;
            }
            clearUserLocation();
        },
        [initialLocation],
    );

    useFocusEffect(
        useCallback(() => {
            if (isOffline) {
                return;
            }

            if (!shouldInitializeCurrentPosition.current) {
                return;
            }

            shouldInitializeCurrentPosition.current = false;

            if (!shouldPanMapToCurrentPosition()) {
                setCurrentPositionToInitialState();
                return;
            }

            // Only read the device location when permission is ALREADY granted. We never request it here,
            // so opening the map cannot trigger an OS permission prompt without a prior explicit user action.
            getForegroundPermissionsAsync().then(({granted}) => {
                if (!granted) {
                    // Pass the permission-denied error so any stale cached location is cleared and the map falls back to initialState.
                    setCurrentPositionToInitialState({
                        code: GeolocationErrorCode.PERMISSION_DENIED,
                        message: 'User denied access to location.',
                    });
                    return;
                }

                getCurrentPosition((params) => {
                    const currentCoords = {
                        longitude: params.coords.longitude,
                        latitude: params.coords.latitude,
                    };
                    setUserLocation(currentCoords);
                }, setCurrentPositionToInitialState);
            });
        }, [isOffline, shouldPanMapToCurrentPosition, setCurrentPositionToInitialState]),
    );

    useEffect(() => {
        if (!currentPosition || !cameraRef.current) {
            return;
        }

        if (!shouldPanMapToCurrentPosition()) {
            return;
        }

        cameraRef.current.setCamera({
            zoomLevel: CONST.MAPBOX.DEFAULT_ZOOM,
            animationDuration: CONST.MAPBOX.ANIMATION_DURATION_LONG,
            animationMode: CONST.MAPBOX.CAMERA_ANIMATION_MODE,
            centerCoordinate: [currentPosition.longitude, currentPosition.latitude],
        });
    }, [currentPosition, shouldPanMapToCurrentPosition]);

    const allDirectionCoordinates = utils.getCoordinatesFromAllDirections(directionCoordinates, alternateDirection);

    // Frames the camera on every focus once the map has loaded.
    useFocusEffect(
        useCallback(() => {
            if (!isIdle) {
                return;
            }

            // The camera goes back to its default framing below, so the center button starts the cycle again from the current position.
            setIsWaypointsNextCenterTarget(false);

            if (!waypoints || waypoints.length === 0) {
                if (currentPositionLongitude === undefined || currentPositionLatitude === undefined) {
                    return;
                }

                pendingFramingRef.current = TransitionTracker.runAfterTransitions({
                    callback: () =>
                        cameraRef.current?.setCamera({
                            zoomLevel: CONST.MAPBOX.DEFAULT_ZOOM,
                            animationMode: CONST.MAPBOX.CAMERA_ANIMATION_MODE,
                            animationDuration: CONST.MAPBOX.ANIMATION_DURATION_DEFAULT,
                            centerCoordinate: [currentPositionLongitude, currentPositionLatitude],
                        }),
                    waitForUpcomingTransition: true,
                    maxWaitForUpcomingTransitionMs: MAX_WAIT_FOR_TRANSITION_TIME_FOR_CAMERA_MOVEMENTS_MS,
                });
                return () => pendingFramingRef.current?.cancel();
            }

            if (waypoints.length === 1) {
                pendingFramingRef.current = TransitionTracker.runAfterTransitions({
                    callback: () =>
                        cameraRef.current?.setCamera({
                            zoomLevel: CONST.MAPBOX.SINGLE_MARKER_ZOOM,
                            animationDuration: CONST.MAPBOX.ANIMATION_DURATION_LONG,
                            animationMode: CONST.MAPBOX.CAMERA_ANIMATION_MODE,
                            centerCoordinate: waypoints.at(0)?.coordinate,
                        }),
                    waitForUpcomingTransition: true,
                    maxWaitForUpcomingTransitionMs: MAX_WAIT_FOR_TRANSITION_TIME_FOR_CAMERA_MOVEMENTS_MS,
                });
            } else {
                const {southWest, northEast} = utils.getBounds(
                    waypoints.map((waypoint) => waypoint.coordinate),
                    allDirectionCoordinates,
                );

                pendingFramingRef.current = TransitionTracker.runAfterTransitions({
                    callback: () =>
                        cameraRef.current?.setCamera({
                            bounds: {ne: northEast, sw: southWest},
                            padding: utils.getCameraPadding(mapPadding),
                            animationDuration: CONST.MAPBOX.ANIMATION_DURATION_DEFAULT,
                            animationMode: CONST.MAPBOX.CAMERA_ANIMATION_MODE,
                        }),
                    waitForUpcomingTransition: true,
                    maxWaitForUpcomingTransitionMs: MAX_WAIT_FOR_TRANSITION_TIME_FOR_CAMERA_MOVEMENTS_MS,
                });
            }

            return () => pendingFramingRef.current?.cancel();
        }, [mapPadding, waypoints, isIdle, allDirectionCoordinates, currentPositionLongitude, currentPositionLatitude]),
    );

    useEffect(() => {
        if (!isOffline) {
            return;
        }
        setIsIdle(false);
    }, [isOffline]);

    const setMapIdle = (e: MapState) => {
        if (e.gestures.isGestureActive) {
            return;
        }
        setIsIdle(true);
        if (onMapReady) {
            onMapReady();
        }
    };

    const mapHeading = useSharedValue(0);

    const onCameraChanged = (e: MapState) => {
        mapHeading.set(e.properties.heading ?? 0);
    };

    // Only a real, displayed user location is something to alternate with. currentPosition falls back to initialState
    // (e.g. the first waypoint), which would otherwise make the first press zoom into that waypoint instead of framing the route.
    const canCenterOnCurrentPosition = shouldDisplayCurrentLocation && !!userLocation;
    const {singleWaypointCoordinate, hasWaypointsTarget} = utils.getCenterTargets(
        waypoints,
        allDirectionCoordinates,
        canCenterOnCurrentPosition ? [userLocation.longitude, userLocation.latitude] : undefined,
    );

    // The waypoints can disappear after the user centered on their location, so the button only offers them while they are still a target.
    const shouldShowWaypointsCenterIcon = isWaypointsNextCenterTarget && hasWaypointsTarget;

    const centerMap = useCallback(() => {
        pendingFramingRef.current?.cancel();
        const waypointCoordinates = waypoints?.map((waypoint) => waypoint.coordinate) ?? [];
        const shouldCenterOnWaypoints = hasWaypointsTarget && (isWaypointsNextCenterTarget || !canCenterOnCurrentPosition);
        setIsWaypointsNextCenterTarget(!shouldCenterOnWaypoints && hasWaypointsTarget && canCenterOnCurrentPosition);

        if (shouldCenterOnWaypoints) {
            if (singleWaypointCoordinate) {
                cameraRef.current?.setCamera({
                    heading: 0,
                    centerCoordinate: singleWaypointCoordinate,
                    zoomLevel: CONST.MAPBOX.SINGLE_MARKER_ZOOM,
                    animationDuration: CONST.MAPBOX.ANIMATION_DURATION_DEFAULT,
                    animationMode: CONST.MAPBOX.CAMERA_ANIMATION_MODE,
                });
                return;
            }
            const {southWest, northEast} = utils.getBounds(waypointCoordinates, allDirectionCoordinates);
            cameraRef.current?.setCamera({
                bounds: {ne: northEast, sw: southWest},
                padding: utils.getCameraPadding(mapPadding),
                animationDuration: CONST.MAPBOX.ANIMATION_DURATION_DEFAULT,
                animationMode: CONST.MAPBOX.CAMERA_ANIMATION_MODE,
            });
            return;
        }
        cameraRef?.current?.setCamera({
            heading: 0,
            centerCoordinate: [currentPositionLongitude ?? 0, currentPositionLatitude ?? 0],
            animationDuration: CONST.MAPBOX.ANIMATION_DURATION_DEFAULT,
            animationMode: CONST.MAPBOX.CAMERA_ANIMATION_MODE,
            zoomLevel: CONST.MAPBOX.SINGLE_MARKER_ZOOM,
        });
    }, [
        allDirectionCoordinates,
        canCenterOnCurrentPosition,
        currentPositionLongitude,
        currentPositionLatitude,
        hasWaypointsTarget,
        isWaypointsNextCenterTarget,
        mapPadding,
        singleWaypointCoordinate,
        waypoints,
    ]);

    const centerCoordinate = useMemo(() => (currentPosition ? [currentPosition.longitude, currentPosition.latitude] : initialState?.location), [currentPosition, initialState?.location]);

    const waypointsBounds = useMemo(() => {
        if (!waypoints) {
            return undefined;
        }
        const {northEast, southWest} = utils.getBounds(
            waypoints.map((waypoint) => waypoint.coordinate),
            allDirectionCoordinates,
        );
        return {ne: northEast, sw: southWest};
    }, [waypoints, allDirectionCoordinates]);

    const hasWaypoints = !!waypoints?.length;

    const defaultSettings: Mapbox.CameraStop | undefined = useMemo(() => {
        if (interactive) {
            // Start framed on the waypoints the same way the focus effect frames them, so the map does not fly in from the current location
            if (waypoints?.length === 1) {
                return {
                    zoomLevel: CONST.MAPBOX.SINGLE_MARKER_ZOOM,
                    centerCoordinate: waypoints.at(0)?.coordinate,
                };
            }
            if (waypoints?.length && waypointsBounds) {
                return {
                    bounds: waypointsBounds,
                    padding: utils.getCameraPadding(mapPadding),
                };
            }
            if (!centerCoordinate) {
                return undefined;
            }
            return {
                zoomLevel: initialState?.zoom,
                centerCoordinate,
            };
        }
        if (!waypointsBounds) {
            return undefined;
        }
        return {
            bounds: waypointsBounds,
        };
    }, [interactive, waypoints, waypointsBounds, mapPadding, centerCoordinate, initialState?.zoom]);

    // The controlled centerCoordinate is applied after defaultSettings, so skip it while waypoints are shown or it would pull the camera back to the current location
    const initCenterCoordinate = useMemo(() => (interactive && !hasWaypoints ? centerCoordinate : undefined), [interactive, hasWaypoints, centerCoordinate]);
    const initBounds = useMemo(() => (interactive ? undefined : waypointsBounds), [interactive, waypointsBounds]);

    // Localize the map labels to the user's preferred app locale so they match the rest of the app.
    const localizeLabels = useMemo<{locale: string} | undefined>(() => {
        const language = utils.getNativeMapboxLanguage(preferredLocale);
        return language ? {locale: language} : undefined;
    }, [preferredLocale]);

    return !isOffline && isAccessTokenReady && !!defaultSettings ? (
        <View style={[style, !interactive ? styles.pointerEventsNone : {}]}>
            <Mapbox.MapView
                style={{flex: 1}}
                styleURL={styleURL}
                localizeLabels={localizeLabels}
                onMapIdle={setMapIdle}
                onCameraChanged={onCameraChanged}
                onTouchStart={() => {
                    pendingFramingRef.current?.cancel();
                    setUserInteractedWithMap(true);
                    setIsWaypointsNextCenterTarget(false);
                }}
                pitchEnabled={pitchEnabled}
                attributionPosition={{...styles.r2, ...styles.b2}}
                scaleBarEnabled={false}
                // We use scaleBarPosition with top: -32 to hide the scale bar on iOS because scaleBarEnabled={false} not work on iOS
                scaleBarPosition={{...styles.tn8, left: 0}}
                compassEnabled={false}
                logoPosition={{...styles.l2, ...styles.b2}}
                {...responder.panHandlers}
            >
                <Mapbox.Camera
                    ref={cameraRef}
                    defaultSettings={
                        defaultSettings ? {...defaultSettings, animationDuration: CONST.MAPBOX.ANIMATION_DURATION_DEFAULT, animationMode: CONST.MAPBOX.CAMERA_ANIMATION_MODE} : undefined
                    }
                    // Include centerCoordinate here as well to address the issue of incorrect coordinates
                    // displayed after the first render when the app's storage is cleared.
                    centerCoordinate={initCenterCoordinate}
                    bounds={initBounds}
                    animationDuration={CONST.MAPBOX.ANIMATION_DURATION_DEFAULT}
                    animationMode={CONST.MAPBOX.CAMERA_ANIMATION_MODE}
                />
                {interactive && shouldDisplayCurrentLocation && (
                    <MarkerView
                        id={CONST.MAP_VIEW_LAYERS.USER_LOCATION}
                        coordinate={[currentPosition?.longitude ?? 0, currentPosition?.latitude ?? 0]}
                        allowOverlap
                    >
                        <ImageSVG
                            src={expensifyIcons.MapCurrentLocation}
                            width={CONST.MAP_MARKER_SIZES.CURRENT_LOCATION.width}
                            height={CONST.MAP_MARKER_SIZES.CURRENT_LOCATION.height}
                        />
                    </MarkerView>
                )}
                {waypoints?.map(({coordinate, markerType, id}) => {
                    if (
                        utils.areSameCoordinate([coordinate[0], coordinate[1]], [currentPosition?.longitude ?? 0, currentPosition?.latitude ?? 0]) &&
                        interactive &&
                        shouldDisplayCurrentLocation
                    ) {
                        return null;
                    }

                    return (
                        <MarkerView
                            id={id}
                            key={id}
                            coordinate={coordinate}
                            allowOverlap
                        >
                            <MapMarkerIcon markerType={markerType} />
                        </MarkerView>
                    );
                })}

                <Directions
                    directionCoordinates={directionCoordinates}
                    alternateDirection={alternateDirection}
                    setIsAlternateDirectionSelected={setIsAlternateDirectionSelected}
                    distanceInMeters={distanceInMeters}
                    unit={unit}
                    waypoints={waypoints}
                />
            </Mapbox.MapView>
            <Compass
                interactive={interactive}
                shouldDisplayCompass={shouldDisplayCompass}
                cameraRef={cameraRef}
                mapHeading={mapHeading}
            />
            {interactive && (
                <View style={[styles.pAbsolute, styles.p5, styles.t0, styles.r0, styles.zIndex1]}>
                    <Button
                        onPress={centerMap}
                        accessibilityLabel={translate('common.center')}
                    >
                        <Button.Icon
                            src={shouldShowWaypointsCenterIcon ? expensifyIcons.Expand : expensifyIcons.Crosshair}
                            fill={theme.icon}
                            hoverFill={theme.icon}
                        />
                    </Button>
                </View>
            )}
        </View>
    ) : (
        <PendingMapView
            title={translate('distance.mapPending.title')}
            subtitle={isOffline ? translate('distance.mapPending.subtitle') : translate('distance.mapPending.onlineSubtitle')}
            style={styles.mapEditView}
        />
    );
}

export default memo(MapView);
