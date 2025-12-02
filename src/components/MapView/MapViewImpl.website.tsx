// Explanation: Different Mapbox libraries are required for web and native mobile platforms.
// This is why we have separate components for web and native to handle the specific implementations.
// For the web version, we use the Mapbox Web library called react-map-gl, while for the native mobile version,
// we utilize a different Mapbox library @rnmapbox/maps tailored for mobile development.
import {useFocusEffect} from '@react-navigation/native';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import React, {useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState} from 'react';
import type {MapRef, ViewState} from 'react-map-gl';
import Map, {Marker} from 'react-map-gl';
import {View} from 'react-native';
import Button from '@components/Button';
import * as Expensicons from '@components/Icon/Expensicons';
import {PressableWithoutFeedback} from '@components/Pressable';
import Text from '@components/Text';
import useOnyx from '@hooks/useOnyx';
import usePrevious from '@hooks/usePrevious';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import DistanceRequestUtils from '@libs/DistanceRequestUtils';
import type {GeolocationErrorCallback} from '@libs/getCurrentPosition/getCurrentPosition.types';
import {GeolocationErrorCode} from '@libs/getCurrentPosition/getCurrentPosition.types';
import {clearUserLocation, setUserLocation} from '@userActions/UserLocation';
import CONST from '@src/CONST';
import useLocalize from '@src/hooks/useLocalize';
import useNetwork from '@src/hooks/useNetwork';
import getCurrentPosition from '@src/libs/getCurrentPosition';
import ONYXKEYS from '@src/ONYXKEYS';
import Direction from './Direction';
import './mapbox.css';
import type {MapViewProps} from './MapViewTypes';
import PendingMapView from './PendingMapView';
import responder from './responder';
import utils from './utils';

function MapViewImpl({
    style,
    styleURL,
    waypoints,
    mapPadding,
    accessToken,
    directionCoordinates,
    initialState = {location: CONST.MAPBOX.DEFAULT_COORDINATE, zoom: CONST.MAPBOX.DEFAULT_ZOOM},
    interactive = true,
    distanceInMeters,
    unit,
    ref,
}: MapViewProps) {
    const [userLocation] = useOnyx(ONYXKEYS.USER_LOCATION, {canBeMissing: true});

    const {isOffline} = useNetwork();
    const {translate} = useLocalize();
    const [distanceUnit, setDistanceUnit] = useState(unit);
    useEffect(() => {
        if (!unit || distanceUnit) {
            return;
        }
        setDistanceUnit(unit);
    }, [unit, distanceUnit]);

    const toggleDistanceUnit = useCallback(() => {
        setDistanceUnit((currentUnit) =>
            currentUnit === CONST.CUSTOM_UNITS.DISTANCE_UNIT_KILOMETERS ? CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES : CONST.CUSTOM_UNITS.DISTANCE_UNIT_KILOMETERS,
        );
    }, []);

    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();

    const [mapRef, setMapRef] = useState<MapRef | null>(null);
    const initialLocation = useMemo(() => ({longitude: initialState.location[0], latitude: initialState.location[1]}), [initialState]);
    const currentPosition = userLocation ?? initialLocation;
    const prevUserPosition = usePrevious(currentPosition);
    const [userInteractedWithMap, setUserInteractedWithMap] = useState(false);
    const [shouldResetBoundaries, setShouldResetBoundaries] = useState<boolean>(false);
    const setRef = useCallback((newRef: MapRef | null) => setMapRef(newRef), []);
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

            getCurrentPosition((params) => {
                const currentCoords = {longitude: params.coords.longitude, latitude: params.coords.latitude};
                setUserLocation(currentCoords);
            }, setCurrentPositionToInitialState);
        }, [isOffline, shouldPanMapToCurrentPosition, setCurrentPositionToInitialState]),
    );

    useEffect(() => {
        if (!currentPosition || !mapRef) {
            return;
        }

        if (!shouldPanMapToCurrentPosition()) {
            return;
        }

        // Avoid animating the navigation to the same location
        const shouldAnimate = prevUserPosition.longitude !== currentPosition.longitude || prevUserPosition.latitude !== currentPosition.latitude;

        mapRef.flyTo({
            center: [currentPosition.longitude, currentPosition.latitude],
            zoom: CONST.MAPBOX.DEFAULT_ZOOM,
            animate: shouldAnimate,
        });
    }, [currentPosition, mapRef, prevUserPosition.longitude, prevUserPosition.latitude, shouldPanMapToCurrentPosition]);

    const resetBoundaries = useCallback(() => {
        if (!waypoints || waypoints.length === 0) {
            return;
        }

        if (!mapRef) {
            return;
        }

        if (waypoints.length === 1) {
            mapRef.flyTo({
                center: waypoints.at(0)?.coordinate,
                zoom: CONST.MAPBOX.SINGLE_MARKER_ZOOM,
            });
            return;
        }

        const map = mapRef.getMap();

        const {northEast, southWest} = utils.getBounds(
            waypoints.map((waypoint) => waypoint.coordinate),
            directionCoordinates,
        );
        map.fitBounds([northEast, southWest], {padding: mapPadding});
    }, [waypoints, mapRef, mapPadding, directionCoordinates]);

    useEffect(resetBoundaries, [resetBoundaries]);

    useEffect(() => {
        if (!shouldResetBoundaries) {
            return;
        }

        resetBoundaries();
        setShouldResetBoundaries(false);
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps -- this effect only needs to run when the boundaries reset is forced
    }, [shouldResetBoundaries]);

    useEffect(() => {
        if (!mapRef) {
            return;
        }

        const resizeObserver = new ResizeObserver(() => {
            mapRef.resize();
            setShouldResetBoundaries(true);
        });
        resizeObserver.observe(mapRef.getContainer());

        return () => {
            resizeObserver?.disconnect();
        };
    }, [mapRef]);

    useImperativeHandle(
        ref,
        () => ({
            flyTo: (location: [number, number], zoomLevel: number = CONST.MAPBOX.DEFAULT_ZOOM, animationDuration?: number) =>
                mapRef?.flyTo({
                    center: location,
                    zoom: zoomLevel,
                    duration: animationDuration,
                }),
            fitBounds: (northEast: [number, number], southWest: [number, number]) => mapRef?.fitBounds([northEast, southWest]),
        }),
        [mapRef],
    );

    const centerMap = useCallback(() => {
        if (!mapRef) {
            return;
        }
        const waypointCoordinates = waypoints?.map((waypoint) => waypoint.coordinate) ?? [];
        if (waypointCoordinates.length > 1 || (directionCoordinates ?? []).length > 1) {
            const {northEast, southWest} = utils.getBounds(waypoints?.map((waypoint) => waypoint.coordinate) ?? [], directionCoordinates);
            const map = mapRef?.getMap();
            map?.fitBounds([southWest, northEast], {padding: mapPadding, animate: true, duration: CONST.MAPBOX.ANIMATION_DURATION_ON_CENTER_ME});
            return;
        }

        mapRef.flyTo({
            center: [currentPosition?.longitude ?? 0, currentPosition?.latitude ?? 0],
            zoom: CONST.MAPBOX.SINGLE_MARKER_ZOOM,
            bearing: 0,
            animate: true,
            duration: CONST.MAPBOX.ANIMATION_DURATION_ON_CENTER_ME,
        });
    }, [directionCoordinates, currentPosition?.longitude, currentPosition?.latitude, mapRef, waypoints, mapPadding]);

    const initialViewState: Partial<ViewState> | undefined = useMemo(() => {
        if (!interactive) {
            if (!waypoints) {
                return undefined;
            }
            const {northEast, southWest} = utils.getBounds(
                waypoints.map((waypoint) => waypoint.coordinate),
                directionCoordinates,
            );
            return {
                zoom: initialState.zoom,
                bounds: [northEast, southWest],
            };
        }
        return {
            longitude: currentPosition?.longitude,
            latitude: currentPosition?.latitude,
            zoom: initialState.zoom,
        };
    }, [waypoints, directionCoordinates, interactive, currentPosition?.longitude, currentPosition?.latitude, initialState.zoom]);

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

    return !isOffline && !!accessToken && !!initialViewState ? (
        <View
            style={style}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...responder.panHandlers}
        >
            <Map
                onDrag={() => setUserInteractedWithMap(true)}
                ref={setRef}
                mapLib={mapboxgl}
                mapboxAccessToken={accessToken}
                initialViewState={initialViewState}
                style={{...StyleUtils.getTextColorStyle(theme.mapAttributionText), zIndex: -1}}
                mapStyle={styleURL}
                interactive={interactive}
            >
                {interactive && (
                    <Marker
                        key="Current-position"
                        longitude={currentPosition?.longitude ?? 0}
                        latitude={currentPosition?.latitude ?? 0}
                    >
                        <View style={styles.currentPositionDot} />
                    </Marker>
                )}
                {!!distanceSymbolCoordinate && !!distanceInMeters && !!distanceUnit && (
                    <Marker
                        key="distance-label"
                        longitude={distanceSymbolCoordinate.at(0) ?? 0}
                        latitude={distanceSymbolCoordinate.at(1) ?? 0}
                    >
                        <PressableWithoutFeedback
                            accessibilityLabel={CONST.ROLE.BUTTON}
                            role={CONST.ROLE.BUTTON}
                            onPress={toggleDistanceUnit}
                        >
                            <View style={styles.distanceLabelWrapper}>
                                <Text style={styles.distanceLabelText}> {DistanceRequestUtils.getDistanceForDisplayLabel(distanceInMeters, distanceUnit)}</Text>
                            </View>
                        </PressableWithoutFeedback>
                    </Marker>
                )}
                {waypoints?.map(({coordinate, markerComponent, id}) => {
                    const MarkerComponent = markerComponent;
                    if (utils.areSameCoordinate([coordinate[0], coordinate[1]], [currentPosition?.longitude ?? 0, currentPosition?.latitude ?? 0]) && interactive) {
                        return null;
                    }
                    return (
                        <Marker
                            key={id}
                            longitude={coordinate[0]}
                            latitude={coordinate[1]}
                        >
                            <MarkerComponent />
                        </Marker>
                    );
                })}
                {!!directionCoordinates && <Direction coordinates={directionCoordinates} />}
            </Map>
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
}

export default MapViewImpl;
