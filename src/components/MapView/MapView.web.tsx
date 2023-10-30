// Explanation: Different Mapbox libraries are required for web and native mobile platforms.
// This is why we have separate components for web and native to handle the specific implementations.
// For the web version, we use the Mapbox Web library called react-map-gl, while for the native mobile version,
// we utilize a different Mapbox library @rnmapbox/maps tailored for mobile development.

import React, {forwardRef, useCallback, useEffect, useImperativeHandle, useState} from 'react';
import {View} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import Map, {MapRef, Marker} from 'react-map-gl';
import mapboxgl from 'mapbox-gl';
import PendingMapView from '../MapView/PendingMapView';
import Onyx, { OnyxEntry, withOnyx } from 'react-native-onyx';
import responder from './responder';
import utils from './utils';
import CONST from '../../CONST';
import ONYXKEYS from '../../ONYXKEYS';
import * as OnyxTypes from '../../types/onyx';
import * as StyleUtils from '../../styles/StyleUtils';
import themeColors from '../../styles/themes/default';
import Direction from './Direction';
import {MapViewHandle, MapViewProps} from './MapViewTypes';
import getCurrentPosition from '../../libs/getCurrentPosition';
import useNetwork from '../../hooks/useNetwork';
import useLocalize from '../../hooks/useLocalize';
import styles from '../../styles/styles';
import 'mapbox-gl/dist/mapbox-gl.css';

type MapViewOnyxProps = {
    userLocation: OnyxEntry<OnyxTypes.UserLocation>;
}

type ComponentProps = MapViewProps & MapViewOnyxProps

const MapView = forwardRef<MapViewHandle, ComponentProps>(
    ({style, styleURL, waypoints, mapPadding, accessToken, userLocation: cachedUserLocation, directionCoordinates, initialState = {location: CONST.MAPBOX.DEFAULT_COORDINATE, zoom: CONST.MAPBOX.DEFAULT_ZOOM}}, ref) => {
        const {isOffline} = useNetwork();
        const {translate} = useLocalize();

        const [mapRef, setMapRef] = useState<MapRef | null>(null);
        const [currentPosition, setCurrentPosition] = useState(cachedUserLocation);
        const [userInteractedWithMap, setUserInteractedWithMap] = useState(false);
        const setRef = useCallback((newRef: MapRef | null) => setMapRef(newRef), []);

        useFocusEffect(
            useCallback(() => {
                getCurrentPosition((params) => {
                    setCurrentPosition({longitude: params.coords.longitude, latitude: params.coords.latitude})
                    Onyx.merge(ONYXKEYS.USER_LOCATION, { longitude: params.coords.longitude, latitude: params.coords.latitude})
                },
                () => {
                    setCurrentPosition({ longitude: initialState.location[0], latitude: initialState.location[1] })
                })
            }, [])
        )

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
        }, [currentPosition, userInteractedWithMap, mapRef])

        // Determines if map can be panned to user's detected
        // location without bothering the user. It will return
        // false if user has already started dragging the map or
        // if there are one or more waypoints present.
        const shouldPanMapToCurrentPosition = () => !userInteractedWithMap && (!waypoints || waypoints.length === 0)

        useEffect(() => {
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

        useEffect(() => {
            if (!mapRef) {
                return;
            }

            const resizeObserver = new ResizeObserver(() => {
                mapRef.resize();
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

export default withOnyx<ComponentProps,MapViewOnyxProps >({
    userLocation: {
        key: ONYXKEYS.USER_LOCATION,
    }
})(MapView)