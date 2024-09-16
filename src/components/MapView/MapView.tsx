import {useFocusEffect, useNavigation} from '@react-navigation/native';
import type {MapState} from '@rnmapbox/maps';
import Mapbox, {MarkerView, setAccessToken} from '@rnmapbox/maps';
import {forwardRef, memo, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import * as Expensicons from '@components/Icon/Expensicons';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import * as UserLocation from '@libs/actions/UserLocation';
import getCurrentPosition from '@libs/getCurrentPosition';
import type {GeolocationErrorCallback} from '@libs/getCurrentPosition/getCurrentPosition.types';
import {GeolocationErrorCode} from '@libs/getCurrentPosition/getCurrentPosition.types';
import colors from '@styles/theme/colors';
import CONST from '@src/CONST';
import useLocalize from '@src/hooks/useLocalize';
import useNetwork from '@src/hooks/useNetwork';
import ONYXKEYS from '@src/ONYXKEYS';
import Direction from './Direction';
import type {MapViewHandle} from './MapViewTypes';
import PendingMapView from './PendingMapView';
import responder from './responder';
import type {ComponentProps, MapViewOnyxProps} from './types';
import utils from './utils';

const MapView = forwardRef<MapViewHandle, ComponentProps>(
    ({accessToken, style, mapPadding, userLocation, styleURL, pitchEnabled, initialState, waypoints, directionCoordinates, onMapReady, interactive = true}, ref) => {
        const navigation = useNavigation();
        const {isOffline} = useNetwork();
        const {translate} = useLocalize();
        const styles = useThemeStyles();
        const theme = useTheme();
        const cameraRef = useRef<Mapbox.Camera>(null);
        const [isIdle, setIsIdle] = useState(false);
        const initialLocation = useMemo(() => initialState && {longitude: initialState.location[0], latitude: initialState.location[1]}, [initialState]);
        const currentPosition = userLocation ?? initialLocation;
        const [userInteractedWithMap, setUserInteractedWithMap] = useState(false);
        const shouldInitializeCurrentPosition = useRef(true);
        const [isAccessTokenSet, setIsAccessTokenSet] = useState(false);

        // Determines if map can be panned to user's detected
        // location without bothering the user. It will return
        // false if user has already started dragging the map or
        // if there are one or more waypoints present.
        const shouldPanMapToCurrentPosition = useCallback(() => !userInteractedWithMap && (!waypoints || waypoints.length === 0), [userInteractedWithMap, waypoints]);

        const setCurrentPositionToInitialState: GeolocationErrorCallback = useCallback(
            (error) => {
                if (error?.code !== GeolocationErrorCode.PERMISSION_DENIED || !initialLocation) {
                    return;
                }
                UserLocation.clearUserLocation();
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

                getCurrentPosition((params) => {
                    const currentCoords = {longitude: params.coords.longitude, latitude: params.coords.latitude};
                    UserLocation.setUserLocation(currentCoords);
                }, setCurrentPositionToInitialState);
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
                animationDuration: 1500,
                centerCoordinate: [currentPosition.longitude, currentPosition.latitude],
            });
        }, [currentPosition, shouldPanMapToCurrentPosition]);

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
            cameraRef?.current?.setCamera({
                heading: 0,
                centerCoordinate: [currentPosition?.longitude ?? 0, currentPosition?.latitude ?? 0],
                animationDuration: CONST.MAPBOX.ANIMATION_DURATION_ON_CENTER_ME,
                zoomLevel: CONST.MAPBOX.SINGLE_MARKER_ZOOM,
            });
        }, [directionCoordinates, currentPosition, mapPadding, waypoints]);

        const centerCoordinate = useMemo(() => (currentPosition ? [currentPosition.longitude, currentPosition.latitude] : initialState?.location), [currentPosition, initialState?.location]);

        const waypointsBounds = useMemo(() => {
            if (!waypoints) {
                return undefined;
            }
            const {northEast, southWest} = utils.getBounds(
                waypoints.map((waypoint) => waypoint.coordinate),
                directionCoordinates,
            );
            return {ne: northEast, sw: southWest};
        }, [waypoints, directionCoordinates]);

        const defaultSettings: Mapbox.CameraStop | undefined = useMemo(() => {
            if (interactive) {
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
        }, [interactive, centerCoordinate, waypointsBounds, initialState?.zoom]);

        const initCenterCoordinate = useMemo(() => (interactive ? centerCoordinate : undefined), [interactive, centerCoordinate]);
        const initBounds = useMemo(() => (interactive ? undefined : waypointsBounds), [interactive, waypointsBounds]);

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
                    // eslint-disable-next-line react/jsx-props-no-spreading
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
                    {interactive && (
                        <Mapbox.ShapeSource
                            id="user-location"
                            shape={{
                                type: 'FeatureCollection',
                                features: [
                                    {
                                        type: 'Feature',
                                        geometry: {
                                            type: 'Point',
                                            coordinates: [currentPosition?.longitude ?? 0, currentPosition?.latitude ?? 0],
                                        },
                                        properties: {},
                                    },
                                ],
                            }}
                        >
                            <Mapbox.CircleLayer
                                id="user-location-layer"
                                sourceID="user-location"
                                style={{
                                    circleColor: colors.blue400,
                                    circleRadius: 8,
                                }}
                            />
                        </Mapbox.ShapeSource>
                    )}

                    {waypoints?.map(({coordinate, markerComponent, id}) => {
                        const MarkerComponent = markerComponent;
                        if (utils.areSameCoordinate([coordinate[0], coordinate[1]], [currentPosition?.longitude ?? 0, currentPosition?.latitude ?? 0]) && interactive) {
                            return null;
                        }
                        return (
                            <MarkerView
                                id={id}
                                key={id}
                                coordinate={coordinate}
                            >
                                <MarkerComponent />
                            </MarkerView>
                        );
                    })}

                    {directionCoordinates && <Direction coordinates={directionCoordinates} />}
                </Mapbox.MapView>
                {interactive && (
                    <View style={[styles.pAbsolute, styles.p5, styles.t0, styles.r0, {zIndex: 1}]}>
                        <Button
                            onPress={centerMap}
                            iconFill={theme.icon}
                            icon={Expensicons.Crosshair}
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
    },
);

export default withOnyx<ComponentProps, MapViewOnyxProps>({
    userLocation: {
        key: ONYXKEYS.USER_LOCATION,
    },
})(memo(MapView));
