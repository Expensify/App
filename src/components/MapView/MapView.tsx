import {useFocusEffect, useNavigation} from '@react-navigation/native';
import Mapbox, {MapState, MarkerView, setAccessToken} from '@rnmapbox/maps';
import {forwardRef, memo, useCallback, useEffect, useImperativeHandle, useRef, useState} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import setUserLocation from '@libs/actions/UserLocation';
import compose from '@libs/compose';
import getCurrentPosition from '@libs/getCurrentPosition';
import styles from '@styles/styles';
import CONST from '@src/CONST';
import useLocalize from '@src/hooks/useLocalize';
import useNetwork from '@src/hooks/useNetwork';
import ONYXKEYS from '@src/ONYXKEYS';
import Direction from './Direction';
import {MapViewHandle} from './MapViewTypes';
import PendingMapView from './PendingMapView';
import responder from './responder';
import {ComponentProps, MapViewOnyxProps} from './types';
import utils from './utils';

const MapView = forwardRef<MapViewHandle, ComponentProps>(
    ({accessToken, style, mapPadding, userLocation: cachedUserLocation, styleURL, pitchEnabled, initialState, waypoints, directionCoordinates, onMapReady}, ref) => {
        const navigation = useNavigation();
        const {isOffline} = useNetwork();
        const {translate} = useLocalize();

        const cameraRef = useRef<Mapbox.Camera>(null);
        const [isIdle, setIsIdle] = useState(false);
        const [currentPosition, setCurrentPosition] = useState(cachedUserLocation);
        const [userInteractedWithMap, setUserInteractedWithMap] = useState(false);

        useFocusEffect(
            useCallback(() => {
                if (isOffline) {
                    return;
                }

                getCurrentPosition(
                    (params) => {
                        const currentCoords = {longitude: params.coords.longitude, latitude: params.coords.latitude};
                        setCurrentPosition(currentCoords);
                        setUserLocation(currentCoords);
                    },
                    () => {
                        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                        if (cachedUserLocation || !initialState) {
                            return;
                        }

                        setCurrentPosition({longitude: initialState.location[0], latitude: initialState.location[1]});
                    },
                );
            }, [cachedUserLocation, initialState, isOffline]),
        );

        // Determines if map can be panned to user's detected
        // location without bothering the user. It will return
        // false if user has already started dragging the map or
        // if there are one or more waypoints present.
        const shouldPanMapToCurrentPosition = useCallback(() => !userInteractedWithMap && (!waypoints || waypoints.length === 0), [userInteractedWithMap, waypoints]);

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
                        zoomLevel: 15,
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

        return (
            <>
                {!isOffline && Boolean(accessToken) && Boolean(currentPosition) ? (
                    <View style={style}>
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
                                    centerCoordinate: currentPosition ? [currentPosition.longitude, currentPosition.latitude] : initialState?.location,
                                    zoomLevel: initialState?.zoom,
                                }}
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
                )}
            </>
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
