import {useFocusEffect, useNavigation} from '@react-navigation/native';
import type {MapState} from '@rnmapbox/maps';
import Mapbox, {MarkerView, setAccessToken} from '@rnmapbox/maps';
import {forwardRef, memo, useCallback, useEffect, useImperativeHandle, useRef, useState} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import Animated, {runOnJS, useAnimatedStyle, useSharedValue, withTiming} from 'react-native-reanimated';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import {PressableWithoutFeedback} from '@components/Pressable';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import setUserLocation from '@libs/actions/UserLocation';
import compose from '@libs/compose';
import getCurrentPosition from '@libs/getCurrentPosition';
import colors from '@styles/theme/colors';
import variables from '@styles/variables';
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
        const theme = useTheme();
        const centerButtonOpacity = useSharedValue(1);
        const [shouldDisplayCenterButton, setShouldDisplayCenterButton] = useState(false);
        const centerButtonAnimatedStyle = useAnimatedStyle(() => ({
            opacity: centerButtonOpacity.value,
        }));

        const toggleCenterButton = useCallback(
            (toggleOn: boolean) => {
                if (toggleOn) {
                    setShouldDisplayCenterButton(true);
                    centerButtonOpacity.value = withTiming(1, {duration: CONST.MAPBOX.CENTER_BUTTON_FADE_DURATION});
                } else {
                    centerButtonOpacity.value = withTiming(0, {duration: CONST.MAPBOX.CENTER_BUTTON_FADE_DURATION}, () => runOnJS(setShouldDisplayCenterButton)(false));
                }
            },
            [centerButtonOpacity],
        );

        const cameraRef = useRef<Mapbox.Camera>(null);
        const [isIdle, setIsIdle] = useState(false);
        const [currentPosition, setCurrentPosition] = useState(cachedUserLocation);
        const [userInteractedWithMap, setUserInteractedWithMap] = useState(false);
        const shouldInitializeCurrentPosition = useRef(true);

        // Determines if map can be panned to user's detected
        // location without bothering the user. It will return
        // false if user has already started dragging the map or
        // if there are one or more waypoints present.
        const shouldPanMapToCurrentPosition = useCallback(() => !userInteractedWithMap && (!waypoints || waypoints.length === 0), [userInteractedWithMap, waypoints]);

        const setCurrentPositionToInitialState = useCallback(() => {
            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
            if (cachedUserLocation || !initialState) {
                return;
            }
            setCurrentPosition({longitude: initialState.location[0], latitude: initialState.location[1]});
        }, [initialState, cachedUserLocation]);

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
                    setUserLocation(currentCoords);
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
                    if (utils.areSameCoordinate([currentPosition?.longitude ?? 0, currentPosition?.latitude ?? 0], [...waypoints[0].coordinate])) {
                        toggleCenterButton(false);
                    } else {
                        toggleCenterButton(true);
                    }
                    cameraRef.current?.setCamera({
                        zoomLevel: CONST.MAPBOX.SINGLE_MARKER_ZOOM,
                        animationDuration: 1500,
                        centerCoordinate: waypoints[0].coordinate,
                    });
                } else {
                    toggleCenterButton(false);
                    const {southWest, northEast} = utils.getBounds(
                        waypoints.map((waypoint) => waypoint.coordinate),
                        directionCoordinates,
                    );
                    cameraRef.current?.fitBounds(northEast, southWest, mapPadding, 1000);
                }
            }, [mapPadding, waypoints, isIdle, directionCoordinates, toggleCenterButton, currentPosition]),
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
        const centerMap = useCallback(() => {
            if (directionCoordinates && directionCoordinates.length > 1) {
                const {southWest, northEast} = utils.getBounds(waypoints?.map((waypoint) => waypoint.coordinate) ?? [], directionCoordinates);
                cameraRef.current?.fitBounds(southWest, northEast, mapPadding, CONST.MAPBOX.ANIMATION_DURATION_ON_CENTER_ME);
                toggleCenterButton(false);
                return;
            }
            cameraRef?.current?.setCamera({
                heading: 0,
                centerCoordinate: [currentPosition?.longitude ?? 0, currentPosition?.latitude ?? 0],
                animationDuration: CONST.MAPBOX.ANIMATION_DURATION_ON_CENTER_ME,
                zoomLevel: CONST.MAPBOX.SINGLE_MARKER_ZOOM,
            });
            toggleCenterButton(false);
        }, [directionCoordinates, currentPosition, mapPadding, waypoints, toggleCenterButton]);

        const onTouchEnd = useCallback(() => toggleCenterButton(true), [toggleCenterButton]);

        return !isOffline && Boolean(accessToken) && Boolean(currentPosition) ? (
            <View style={[style, !interactive ? styles.pointerEventsNone : {}]}>
                <Mapbox.MapView
                    onTouchEnd={onTouchEnd}
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

                    {waypoints?.map(({coordinate, markerComponent, id}) => {
                        const MarkerComponent = markerComponent;
                        if (utils.areSameCoordinate([coordinate[0], coordinate[1]], [currentPosition?.longitude ?? 0, currentPosition?.latitude ?? 0])) {
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
                {shouldDisplayCenterButton && (
                    <Animated.View style={[styles.pAbsolute, styles.p5, styles.t0, styles.r0, {zIndex: 1}, {opacity: 1}, centerButtonAnimatedStyle]}>
                        <PressableWithoutFeedback
                            accessibilityRole={CONST.ROLE.BUTTON}
                            onPress={centerMap}
                            accessibilityLabel="Center"
                        >
                            <View style={styles.primaryMediumIcon}>
                                <Icon
                                    width={variables.iconSizeNormal}
                                    height={variables.iconSizeNormal}
                                    src={Expensicons.Crosshair}
                                    fill={theme.icon}
                                />
                            </View>
                        </PressableWithoutFeedback>
                    </Animated.View>
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

export default compose(
    withOnyx<ComponentProps, MapViewOnyxProps>({
        userLocation: {
            key: ONYXKEYS.USER_LOCATION,
        },
    }),
    memo,
)(MapView);
