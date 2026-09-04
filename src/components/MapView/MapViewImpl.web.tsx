import Button from '@components/ButtonComposed';

import 'mapbox-gl/dist/mapbox-gl.css';
import ImageSVG from '@components/ImageSVG';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useOnyx from '@hooks/useOnyx';
import usePrevious from '@hooks/usePrevious';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import type {GeolocationErrorCallback} from '@libs/getCurrentPosition/getCurrentPosition.types';
import {GeolocationErrorCode} from '@libs/getCurrentPosition/getCurrentPosition.types';

import {clearUserLocation, setUserLocation} from '@userActions/UserLocation';

import CONST from '@src/CONST';
import useLocalize from '@src/hooks/useLocalize';
import useNetwork from '@src/hooks/useNetwork';
import getCurrentPosition from '@src/libs/getCurrentPosition';
import ONYXKEYS from '@src/ONYXKEYS';

import type {MapMouseEvent, MapRef, ViewState} from 'react-map-gl/mapbox';

// Explanation: Different Mapbox libraries are required for web and native mobile platforms.
// This is why we have separate components for web and native to handle the specific implementations.
// For the web version, we use the Mapbox Web library called react-map-gl, while for the native mobile version,
// we utilize a different Mapbox library @rnmapbox/maps tailored for mobile development.
import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState} from 'react';
import Map, {Marker} from 'react-map-gl/mapbox';
import {View} from 'react-native';

import type {MapViewProps} from './MapViewTypes';

import './mapbox.css';
import {ALTERNATE_DIRECTIONS_LAYER_IDS} from './AlternateDirections.web';
import Directions from './Directions';
import MapMarkerIcon from './MapMarkerIcon';
import PendingMapView from './PendingMapView';
import responder from './responder';
import utils from './utils';

function MapViewImpl({
    style,
    styleURL,
    waypoints,
    mapPadding,
    accessToken,
    directionCoordinates: directionCoordinatesProp,
    alternateDirection,
    setIsAlternateDirectionSelected,
    initialState = {location: CONST.MAPBOX.DEFAULT_COORDINATE, zoom: CONST.MAPBOX.DEFAULT_ZOOM},
    interactive = true,
    distanceInMeters,
    unit,
    ref,
    shouldDisplayCurrentLocation = true,
}: MapViewProps) {
    // Coordinates of every rendered route (the main one and the alternate one, if any), used to frame the map around all of them.
    const allDirectionCoordinates = utils.getCoordinatesFromAllDirections(directionCoordinatesProp, alternateDirection);
    const hasAlternateDirection = !!alternateDirection?.coordinates?.length;

    const [userLocation] = useOnyx(ONYXKEYS.USER_LOCATION);
    const [countryByIp] = useOnyx(ONYXKEYS.COUNTRY);

    const {isOffline} = useNetwork();
    const {translate, preferredLocale} = useLocalize();

    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Crosshair', 'MapCurrentLocation']);

    const [mapRef, setMapRef] = useState<MapRef | null>(null);
    const initialLocation = useMemo(() => ({longitude: initialState.location[0], latitude: initialState.location[1]}), [initialState]);
    const currentPosition = userLocation ?? initialLocation;
    const prevUserPosition = usePrevious(currentPosition);
    const [userInteractedWithMap, setUserInteractedWithMap] = useState(false);
    const [isHoveringDirection, setIsHoveringDirection] = useState(false);
    const [shouldResetBoundaries, setShouldResetBoundaries] = useState<boolean>(false);
    const setRef = useCallback((newRef: MapRef | null) => setMapRef(newRef), []);
    const shouldInitializeCurrentPosition = useRef(true);

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
            allDirectionCoordinates,
        );
        map.fitBounds([northEast, southWest], {padding: mapPadding});
    }, [waypoints, mapRef, mapPadding, allDirectionCoordinates]);

    useEffect(resetBoundaries, [resetBoundaries]);

    useEffect(() => {
        if (!shouldResetBoundaries) {
            return;
        }

        resetBoundaries();
        setShouldResetBoundaries(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps -- this effect only needs to run when the boundaries reset is forced
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

    // cspell:ignore styledata
    // Keep the map labels in the user's preferred app locale and its disputed borders drawn from the user's
    // own worldview, reapplying whenever the map, the locale or the country changes.
    useEffect(() => {
        if (!mapRef) {
            return;
        }

        const map = mapRef.getMap();
        const applyLocalization = () => {
            map.setLanguage(utils.getMapboxLanguage(preferredLocale));
            map.setWorldview(utils.getMapboxWorldview(countryByIp));
        };

        if (map.isStyleLoaded()) {
            applyLocalization();
            return;
        }

        // The style must be loaded before labels and borders can be localized, so defer until it is ready.
        map.once('styledata', applyLocalization);
        return () => {
            map.off('styledata', applyLocalization);
        };
    }, [mapRef, preferredLocale, countryByIp]);

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
        if (waypointCoordinates.length > 1 || (allDirectionCoordinates ?? []).length > 1) {
            const {northEast, southWest} = utils.getBounds(waypoints?.map((waypoint) => waypoint.coordinate) ?? [], allDirectionCoordinates);
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
    }, [allDirectionCoordinates, currentPosition?.longitude, currentPosition?.latitude, mapRef, waypoints, mapPadding]);

    const initialViewState: Partial<ViewState> | undefined = useMemo(() => {
        if (!interactive) {
            if (!waypoints) {
                return undefined;
            }
            const {northEast, southWest} = utils.getBounds(
                waypoints.map((waypoint) => waypoint.coordinate),
                allDirectionCoordinates,
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
    }, [waypoints, allDirectionCoordinates, interactive, currentPosition?.longitude, currentPosition?.latitude, initialState.zoom]);

    // The route layers only need to be interactive when there is an alternate route to pick, so that clicking a route selects it.
    const interactiveLayerIds = useMemo(() => (interactive && hasAlternateDirection ? ALTERNATE_DIRECTIONS_LAYER_IDS : undefined), [interactive, hasAlternateDirection]);

    const onDrag = useCallback(() => {
        setUserInteractedWithMap(true);
        // Dragging must keep the grabbing cursor even when it starts on top of a route.
        setIsHoveringDirection(false);
    }, []);

    const selectClickedDirection = useCallback(
        (event: MapMouseEvent) => {
            const isAlternate: unknown = event.features?.at(0)?.properties?.isAlternate;
            if (typeof isAlternate !== 'boolean') {
                return;
            }
            setIsAlternateDirectionSelected?.(isAlternate);
        },
        [setIsAlternateDirectionSelected],
    );

    return !isOffline && !!accessToken && !!initialViewState ? (
        <View
            style={style}
            {...responder.panHandlers}
        >
            <Map
                onDrag={onDrag}
                ref={setRef}
                mapboxAccessToken={accessToken}
                initialViewState={initialViewState}
                style={{...StyleUtils.getTextColorStyle(theme.mapAttributionText), zIndex: -1}}
                mapStyle={styleURL}
                interactive={interactive}
                interactiveLayerIds={interactiveLayerIds}
                onClick={selectClickedDirection}
                // Only the interactive route layers report hover, so the pointer cursor shows up exclusively when there is an alternate route to pick.
                onMouseEnter={() => setIsHoveringDirection(true)}
                onMouseLeave={() => setIsHoveringDirection(false)}
                cursor={isHoveringDirection && hasAlternateDirection ? 'pointer' : undefined}
            >
                {interactive && shouldDisplayCurrentLocation && (
                    <Marker
                        key="Current-position"
                        longitude={currentPosition?.longitude ?? 0}
                        latitude={currentPosition?.latitude ?? 0}
                    >
                        <ImageSVG
                            src={expensifyIcons.MapCurrentLocation}
                            width={CONST.MAP_MARKER_SIZES.CURRENT_LOCATION.width}
                            height={CONST.MAP_MARKER_SIZES.CURRENT_LOCATION.height}
                        />
                    </Marker>
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
                        <Marker
                            key={id}
                            longitude={coordinate[0]}
                            latitude={coordinate[1]}
                        >
                            <MapMarkerIcon markerType={markerType} />
                        </Marker>
                    );
                })}
                <Directions
                    directionCoordinates={directionCoordinatesProp}
                    alternateDirection={alternateDirection}
                    setIsAlternateDirectionSelected={setIsAlternateDirectionSelected}
                    distanceInMeters={distanceInMeters}
                    unit={unit}
                    waypoints={waypoints}
                />
            </Map>
            {interactive && (
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
