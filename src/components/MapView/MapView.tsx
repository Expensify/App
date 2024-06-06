import {useFocusEffect, useNavigation} from '@react-navigation/native';
import type {MapState} from '@rnmapbox/maps';
import Mapbox, {MarkerView, setAccessToken} from '@rnmapbox/maps';
import {forwardRef, memo, useCallback, useEffect, useImperativeHandle, useRef, useState} from 'react';
import {View} from 'react-native';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import {PressableWithoutFeedback} from '@components/Pressable';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import colors from '@styles/theme/colors';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import useLocalize from '@src/hooks/useLocalize';
import useNetwork from '@src/hooks/useNetwork';
import Direction from './Direction';
import type {MapViewHandle, MapViewProps} from './MapViewTypes';
import PendingMapView from './PendingMapView';
import responder from './responder';
import useCurrentPosition from './useCurrentPosition';
import utils from './utils';

const MapView = forwardRef<MapViewHandle, MapViewProps>(
    ({accessToken, style, mapPadding, styleURL, pitchEnabled, initialState, waypoints, directionCoordinates, onMapReady, interactive = true}, ref) => {
        const navigation = useNavigation();
        const {isOffline} = useNetwork();
        const {translate} = useLocalize();
        const styles = useThemeStyles();
        const theme = useTheme();
        const cameraRef = useRef<Mapbox.Camera>(null);
        const [isIdle, setIsIdle] = useState(false);

        const flyTo = useCallback(
            (location: [number, number], zoomLevel: number = CONST.MAPBOX.DEFAULT_ZOOM, animationDuration?: number) =>
                cameraRef.current?.setCamera({zoomLevel, centerCoordinate: location, animationDuration}),
            [],
        );

        const {currentPosition, setHasUserInteractedWithMap} = useCurrentPosition({
            initialPosition: initialState?.location,
            waypoints,
            flyTo,
        });

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
        const centerMap = useCallback(() => {
            if (directionCoordinates && directionCoordinates.length > 1) {
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

        const centerCoordinate = currentPosition ? [currentPosition.longitude, currentPosition.latitude] : initialState?.location;
        return !isOffline && Boolean(accessToken) && Boolean(currentPosition) ? (
            <View style={[style, !interactive ? styles.pointerEventsNone : {}]}>
                <Mapbox.MapView
                    style={{flex: 1}}
                    styleURL={styleURL}
                    onMapIdle={setMapIdle}
                    onTouchStart={() => setHasUserInteractedWithMap(true)}
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
                <View style={[styles.pAbsolute, styles.p5, styles.t0, styles.r0, {zIndex: 1}]}>
                    <PressableWithoutFeedback
                        accessibilityRole={CONST.ROLE.BUTTON}
                        onPress={centerMap}
                        accessibilityLabel={translate('common.center')}
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
                </View>
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

export default memo(MapView);
