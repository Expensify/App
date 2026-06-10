import {useFocusEffect, useNavigation} from '@react-navigation/native';
import type {MapState} from '@rnmapbox/maps';
import Mapbox, {MarkerView, setAccessToken} from '@rnmapbox/maps';
import {memo, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import ImageSVG from '@components/ImageSVG';
import Text from '@components/Text';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useOnyx from '@hooks/useOnyx';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {clearUserLocation, setUserLocation} from '@libs/actions/UserLocation';
import DistanceRequestUtils from '@libs/DistanceRequestUtils';
import getCurrentPosition from '@libs/getCurrentPosition';
import type {GeolocationErrorCallback} from '@libs/getCurrentPosition/getCurrentPosition.types';
import {GeolocationErrorCode} from '@libs/getCurrentPosition/getCurrentPosition.types';
import CONST from '@src/CONST';
import useLocalize from '@src/hooks/useLocalize';
import useNetwork from '@src/hooks/useNetwork';
import ONYXKEYS from '@src/ONYXKEYS';
import Direction from './Direction';
import type {MapViewProps} from './MapViewTypes';
import PendingMapView from './PendingMapView';
import responder from './responder';
import ToggleDistanceUnitButton from './ToggleDistanceUnitButton';
import useDistanceUnit from './useDistanceUnit';
import utils from './utils';

function MapView({
    accessToken,
    style,
    mapPadding,
    styleURL,
    pitchEnabled,
    initialState,
    waypoints,
    directionCoordinates: directionCoordinatesProp,
    onMapReady,
    interactive = true,
    distanceInMeters,
    unit,
    ref,
    shouldDisplayCurrentLocation = true,
}: MapViewProps) {
    const directionCoordinates = !directionCoordinatesProp || utils.isSingleSegmentRoute(directionCoordinatesProp) ? directionCoordinatesProp : directionCoordinatesProp.flat();

    const [userLocation] = useOnyx(ONYXKEYS.USER_LOCATION);
    const navigation = useNavigation();
    const {isOffline} = useNetwork();
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const theme = useTheme();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Crosshair', 'MapCurrentLocation']);
    const cameraRef = useRef<Mapbox.Camera>(null);
    const [isIdle, setIsIdle] = useState(false);
    const initialLocation = useMemo(() => initialState && {longitude: initialState.location[0], latitude: initialState.location[1]}, [initialState]);
    const currentPosition = userLocation ?? initialLocation;
    const [userInteractedWithMap, setUserInteractedWithMap] = useState(false);
    const shouldInitializeCurrentPosition = useRef(true);
    const [isAccessTokenSet, setIsAccessTokenSet] = useState(false);

    const {distanceUnit, toggleDistanceUnit} = useDistanceUnit(unit);

    const distanceLabelText = useMemo(
        () => DistanceRequestUtils.getDistanceForDisplayLabel(distanceInMeters ?? 0, distanceUnit ?? CONST.CUSTOM_UNITS.DISTANCE_UNIT_KILOMETERS),
        [distanceInMeters, distanceUnit],
    );

    // Determines if map can be panned to user's detected
    // location without bothering the user. It will return
    // false if user has already started dragging the map or
    // if there are one or more waypoints present.
    const shouldFollowUserLocation = useMemo(
        () => !userInteractedWithMap && shouldDisplayCurrentLocation && (!waypoints || waypoints.length === 0),
        [userInteractedWithMap, waypoints, shouldDisplayCurrentLocation],
    );

    const prevWaypointsLength = useRef(waypoints?.length ?? 0);
    useEffect(() => {
        const currentLength = waypoints?.length ?? 0;
        // When the route/waypoints are cleared (e.g. discarding a GPS trip),
        // resume following the user's current location.
        if (prevWaypointsLength.current > 0 && currentLength === 0) {
            setUserInteractedWithMap(false);
        }
        prevWaypointsLength.current = currentLength;
    }, [waypoints?.length]);

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

            if (!shouldFollowUserLocation) {
                setCurrentPositionToInitialState();
                return;
            }

            getCurrentPosition((params) => {
                const currentCoords = {longitude: params.coords.longitude, latitude: params.coords.latitude};
                setUserLocation(currentCoords);
            }, setCurrentPositionToInitialState);
        }, [isOffline, shouldFollowUserLocation, setCurrentPositionToInitialState]),
    );

    useEffect(() => {
        if (!currentPosition || !cameraRef.current) {
            return;
        }

        if (!shouldFollowUserLocation) {
            return;
        }

        cameraRef.current.setCamera({
            zoomLevel: CONST.MAPBOX.DEFAULT_ZOOM,
            animationDuration: 1500,
            centerCoordinate: [currentPosition.longitude, currentPosition.latitude],
        });
    }, [currentPosition, shouldFollowUserLocation]);

    useImperativeHandle(
        ref,
        () => ({
            flyTo: (location: [number, number], zoomLevel: number = CONST.MAPBOX.DEFAULT_ZOOM, animationDuration?: number) =>
                cameraRef.current?.setCamera({zoomLevel, centerCoordinate: location, animationDuration}),
            fitBounds: (northEast: [number, number], southWest: [number, number], paddingConfig?: number | number[] | undefined, animationDuration?: number | undefined) =>
                cameraRef.current?.fitBounds(northEast, southWest, paddingConfig, animationDuration),
        }),
        [],
    );

    // When the page loses focus, we temporarily set the "idled" state to false.
    // When the page regains focus, the onIdled method of the map will set the actual "idled" state,
    // which in turn triggers the callback.
    useFocusEffect(
        useCallback(() => {
            if (!waypoints || waypoints.length === 0 || !isIdle) {
                return;
            }

            if (waypoints.length === 1) {
                cameraRef.current?.setCamera({
                    zoomLevel: CONST.MAPBOX.SINGLE_MARKER_ZOOM,
                    animationDuration: 1500,
                    centerCoordinate: waypoints.at(0)?.coordinate,
                });
            } else {
                const {southWest, northEast} = utils.getBounds(
                    waypoints.map((waypoint) => waypoint.coordinate),
                    directionCoordinates,
                );
                cameraRef.current?.fitBounds(northEast, southWest, mapPadding, 1000);
            }
        }, [mapPadding, waypoints, isIdle, directionCoordinates]),
    );

    useEffect(() => {
        const unsubscribe = navigation.addListener('blur', () => {
            setIsIdle(false);
        });
        return unsubscribe;
    }, [navigation]);

    useEffect(() => {
        if (!isOffline) {
            return;
        }
        setIsIdle(false);
    }, [isOffline]);

    useEffect(() => {
        setAccessToken(accessToken).then((token) => {
            if (!token) {
                return;
            }
            setIsAccessTokenSet(true);
        });
    }, [accessToken]);

    const setMapIdle = (e: MapState) => {
        if (e.gestures.isGestureActive) {
            return;
        }
        setIsIdle(true);
        if (onMapReady) {
            onMapReady();
        }
    };
    const centerMap = useCallback(() => {
        const waypointCoordinates = waypoints?.map((waypoint) => waypoint.coordinate) ?? [];
        if (waypointCoordinates.length > 1 || (directionCoordinates ?? []).length > 1) {
            const {southWest, northEast} = utils.getBounds(waypoints?.map((waypoint) => waypoint.coordinate) ?? [], directionCoordinates);
            cameraRef.current?.fitBounds(southWest, northEast, mapPadding, CONST.MAPBOX.ANIMATION_DURATION_ON_CENTER_ME);
            return;
        }
        setUserInteractedWithMap(false);
        cameraRef?.current?.setCamera({
            heading: 0,
            centerCoordinate: [currentPosition?.longitude ?? 0, currentPosition?.latitude ?? 0],
            animationDuration: CONST.MAPBOX.ANIMATION_DURATION_ON_CENTER_ME,
            zoomLevel: CONST.MAPBOX.SINGLE_MARKER_ZOOM,
        });
    }, [directionCoordinates, currentPosition?.longitude, currentPosition?.latitude, mapPadding, waypoints]);

    const centerCoordinate = useMemo(() => (currentPosition ? [currentPosition.longitude, currentPosition.latitude] : initialState?.location), [currentPosition, initialState?.location]);

    const waypointsBounds = useMemo(() => {
        if (!waypoints || (!waypoints.length && !directionCoordinates?.length)) {
            return undefined;
        }

        const {northEast, southWest} = utils.getBounds(
            waypoints.map((waypoint) => waypoint.coordinate),
            directionCoordinates,
        );
        return {ne: northEast, sw: southWest};
    }, [waypoints, directionCoordinates]);

    const defaultSettings = useMemo(() => {
        if (interactive && shouldFollowUserLocation) {
            return centerCoordinate ? {zoomLevel: initialState?.zoom, centerCoordinate} : undefined;
        }
        if (!waypointsBounds) {
            return {};
        }
        return {bounds: waypointsBounds};
    }, [interactive, centerCoordinate, waypointsBounds, initialState?.zoom, shouldFollowUserLocation]);

    const initCenterCoordinate = useMemo(() => (interactive && shouldFollowUserLocation ? centerCoordinate : undefined), [interactive, centerCoordinate, shouldFollowUserLocation]);
    const initBounds = useMemo(() => (interactive ? undefined : waypointsBounds), [interactive, waypointsBounds]);

    const distanceSymbolCoordinate = useMemo(() => {
        if (!directionCoordinates?.length || !waypoints?.length) {
            return;
        }
        const {northEast, southWest} = utils.getBounds(
            waypoints.map((waypoint) => waypoint.coordinate),
            directionCoordinates,
        );
        const boundsCenter = utils.getBoundsCenter({northEast, southWest});

        return utils.findClosestCoordinateOnLineFromCenter(boundsCenter, directionCoordinates);
    }, [waypoints, directionCoordinates]);

    return !isOffline && isAccessTokenSet && !!defaultSettings ? (
        <View style={[style, !interactive ? styles.pointerEventsNone : {}]}>
            <Mapbox.MapView
                style={{flex: 1}}
                styleURL={styleURL}
                onMapIdle={setMapIdle}
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
                <Mapbox.Camera
                    ref={cameraRef}
                    defaultSettings={defaultSettings}
                    // Include centerCoordinate here as well to address the issue of incorrect coordinates
                    // displayed after the first render when the app's storage is cleared.
                    centerCoordinate={initCenterCoordinate}
                    bounds={initBounds}
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
                {waypoints?.map(({coordinate, markerComponent, id}) => {
                    const MarkerComponent = markerComponent;
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
                            <MarkerComponent />
                        </MarkerView>
                    );
                })}

                {!!directionCoordinatesProp && <Direction coordinates={directionCoordinatesProp} />}
                {!!distanceSymbolCoordinate && !!distanceInMeters && !!distanceUnit && (
                    <MarkerView
                        coordinate={distanceSymbolCoordinate}
                        id="distance-label"
                        key="distance-label"
                        allowOverlap
                    >
                        <View style={{zIndex: 1}}>
                            <ToggleDistanceUnitButton
                                accessibilityRole={CONST.ROLE.BUTTON}
                                accessibilityLabel="distance-label"
                                onPress={toggleDistanceUnit}
                            >
                                <View style={[styles.distanceLabelWrapper]}>
                                    <Text style={styles.distanceLabelText}> {distanceLabelText}</Text>
                                </View>
                            </ToggleDistanceUnitButton>
                        </View>
                    </MarkerView>
                )}
            </Mapbox.MapView>
            {interactive && (
                <View style={[styles.pAbsolute, styles.p5, styles.t0, styles.r0, {zIndex: 1}]}>
                    <Button
                        onPress={centerMap}
                        iconFill={theme.icon}
                        icon={expensifyIcons.Crosshair}
                        accessibilityLabel={translate('common.center')}
                    />
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
