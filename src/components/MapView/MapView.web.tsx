// Explanation: Different Mapbox libraries are required for web and native mobile platforms.
// This is why we have separate components for web and native to handle the specific implementations.
// For the web version, we use the Mapbox Web library called react-map-gl, while for the native mobile version,
// we utilize a different Mapbox library @rnmapbox/maps tailored for mobile development.
import {useFocusEffect} from '@react-navigation/native';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import React, {forwardRef, useCallback, useEffect, useImperativeHandle, useState} from 'react';
import Map, {MapRef, Marker} from 'react-map-gl';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import * as StyleUtils from '@styles/StyleUtils';
import themeColors from '@styles/themes/default';
import setUserLocation from '@userActions/UserLocation';
import CONST from '@src/CONST';
import useLocalize from '@src/hooks/useLocalize';
import useNetwork from '@src/hooks/useNetwork';
import getCurrentPosition from '@src/libs/getCurrentPosition';
import ONYXKEYS from '@src/ONYXKEYS';
import styles from '@src/styles/styles';
import Direction from './Direction';
import './mapbox.css';
import {MapViewHandle} from './MapViewTypes';
import PendingMapView from './PendingMapView';
import responder from './responder';
import {ComponentProps, MapViewOnyxProps} from './types';
import utils from './utils';

const MapView = forwardRef<MapViewHandle, ComponentProps>(
    (
        {
            style,
            styleURL,
            waypoints,
            mapPadding,
            accessToken,
            userLocation: cachedUserLocation,
            directionCoordinates,
            initialState = {location: CONST.MAPBOX.DEFAULT_COORDINATE, zoom: CONST.MAPBOX.DEFAULT_ZOOM},
        },
        ref,
    ) => {
        const {isOffline} = useNetwork();
        const {translate} = useLocalize();

        const [mapRef, setMapRef] = useState<MapRef | null>(null);
        const [currentPosition, setCurrentPosition] = useState(cachedUserLocation);
        const [userInteractedWithMap, setUserInteractedWithMap] = useState(false);
        const [shouldResetBoundaries, setShouldResetBoundaries] = useState<boolean>(false);
        const setRef = useCallback((newRef: MapRef | null) => setMapRef(newRef), []);

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
                        if (cachedUserLocation) {
                            return;
                        }

                        setCurrentPosition({longitude: initialState.location[0], latitude: initialState.location[1]});
                    },
                );
            }, [cachedUserLocation, isOffline, initialState.location]),
        );

        // Determines if map can be panned to user's detected
        // location without bothering the user. It will return
        // false if user has already started dragging the map or
        // if there are one or more waypoints present.
        const shouldPanMapToCurrentPosition = useCallback(() => !userInteractedWithMap && (!waypoints || waypoints.length === 0), [userInteractedWithMap, waypoints]);

        useEffect(() => {
            if (!currentPosition || !mapRef) {
                return;
            }

            if (!shouldPanMapToCurrentPosition()) {
                return;
            }

            mapRef.flyTo({
                center: [currentPosition.longitude, currentPosition.latitude],
                zoom: CONST.MAPBOX.DEFAULT_ZOOM,
            });
        }, [currentPosition, userInteractedWithMap, mapRef, shouldPanMapToCurrentPosition]);

        const resetBoundaries = useCallback(() => {
            if (!waypoints || waypoints.length === 0) {
                return;
            }

            if (!mapRef) {
                return;
            }

            if (waypoints.length === 1) {
                mapRef.flyTo({
                    center: waypoints[0].coordinate,
                    zoom: CONST.MAPBOX.DEFAULT_ZOOM,
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

        return (
            <>
                {!isOffline && Boolean(accessToken) && Boolean(currentPosition) ? (
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
                            initialViewState={{
                                longitude: currentPosition?.longitude,
                                latitude: currentPosition?.latitude,
                                zoom: initialState.zoom,
                            }}
                            style={StyleUtils.getTextColorStyle(themeColors.mapAttributionText) as React.CSSProperties}
                            mapStyle={styleURL}
                        >
                            {waypoints?.map(({coordinate, markerComponent, id}) => {
                                const MarkerComponent = markerComponent;
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
                            {directionCoordinates && <Direction coordinates={directionCoordinates} />}
                        </Map>
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

export default withOnyx<ComponentProps, MapViewOnyxProps>({
    userLocation: {
        key: ONYXKEYS.USER_LOCATION,
    },
})(MapView);
