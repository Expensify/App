import {useFocusEffect, useNavigation} from '@react-navigation/native';
import type {MapState} from '@rnmapbox/maps';
import Mapbox, {MarkerView, setAccessToken} from '@rnmapbox/maps';
import {forwardRef, memo, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import useThemeStyles from '@hooks/useThemeStyles';
import * as UserLocation from '@libs/actions/UserLocation';
import compose from '@libs/compose';
import getCurrentPosition from '@libs/getCurrentPosition';
import type {GeolocationErrorCallback} from '@libs/getCurrentPosition/getCurrentPosition.types';
import {GeolocationErrorCode} from '@libs/getCurrentPosition/getCurrentPosition.types';
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
    ({accessToken, style, mapPadding, userLocation: cachedUserLocation, styleURL, pitchEnabled, initialState, waypoints, directionCoordinates, onMapReady, interactive = true}, ref) => {
        const navigation = useNavigation();
        const {isOffline} = useNetwork();
        const {translate} = useLocalize();
        const styles = useThemeStyles();

        const cameraRef = useRef<Mapbox.Camera>(null);
        const [isIdle, setIsIdle] = useState(false);
        const initialLocation = useMemo(() => initialState && {longitude: initialState.location[0], latitude: initialState.location[1]}, [initialState]);
        const [currentPosition, setCurrentPosition] = useState(cachedUserLocation ?? initialLocation);
        const [userInteractedWithMap, setUserInteractedWithMap] = useState(false);
        const shouldInitializeCurrentPosition = useRef(true);

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
                setCurrentPosition(initialLocation);
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
                    setCurrentPosition(currentCoords);
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
                        centerCoordinate: waypoints[0].coordinate,
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
            setAccessToken(accessToken);
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

        const centerCoordinate = currentPosition ? [currentPosition.longitude, currentPosition.latitude] : initialState?.location;
        return !isOffline && Boolean(accessToken) && Boolean(currentPosition) ? (
            <View style={[style, !interactive ? styles.pointerEventsNone : {}]}>
                <Mapbox.MapView
                    style={{flex: 1}}
                    styleURL={styleURL}
                    onMapIdle={setMapIdle}
                    onTouchStart={() => setUserInteractedWithMap(true)}
                    pitchEnabled={pitchEnabled}
                    attributionPosition={{...styles.r2, ...styles.b2}}
                    scaleBarEnabled={false}
                    logoPosition={{...styles.l2, ...styles.b2}}
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...responder.panHandlers}
                >
                    <Mapbox.Camera
                        ref={cameraRef}
                        defaultSettings={{
                            centerCoordinate,
                            zoomLevel: initialState?.zoom,
                        }}
                        // Include centerCoordinate here as well to address the issue of incorrect coordinates
                        // displayed after the first render when the app's storage is cleared.
                        centerCoordinate={centerCoordinate}
                    />

                    {waypoints?.map(({coordinate, markerComponent, id}) => {
                        const MarkerComponent = markerComponent;
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

export default compose(
    withOnyx<ComponentProps, MapViewOnyxProps>({
        userLocation: {
            key: ONYXKEYS.USER_LOCATION,
        },
    }),
    memo,
)(MapView);
