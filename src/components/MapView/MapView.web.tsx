// Explanation: Different Mapbox libraries are required for web and native mobile platforms.
// This is why we have separate components for web and native to handle the specific implementations.
// For the web version, we use the Mapbox Web library called react-map-gl, while for the native mobile version,
// we utilize a different Mapbox library @rnmapbox/maps tailored for mobile development.

import React, {forwardRef, useCallback, useEffect, useImperativeHandle, useState} from 'react';
import {View} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import Map, {MapRef, Marker} from 'react-map-gl';
import mapboxgl from 'mapbox-gl';
import Onyx, { OnyxEntry, withOnyx } from 'react-native-onyx';
import responder from './responder';
import utils from './utils';
import CONST from '../../CONST';
import ONYXKEYS from '../../ONYXKEYS';
import styles from '../../styles/styles';
import * as OnyxTypes from '../../types/onyx';
import * as StyleUtils from '../../styles/StyleUtils';
import themeColors from '../../styles/themes/default';
import Direction from './Direction';
import {MapViewHandle, MapViewProps} from './MapViewTypes';
import getCurrentPosition from '../../libs/getCurrentPosition';
import Text from '../../components/Text'
import 'mapbox-gl/dist/mapbox-gl.css';

type MapViewOnyxProps = {
    userLocation: OnyxEntry<OnyxTypes.UserLocation>;
}

type ComponentProps = MapViewProps & MapViewOnyxProps

const MapView = forwardRef<MapViewHandle, ComponentProps>(
    ({style, styleURL, waypoints, mapPadding, accessToken, userLocation: cachedUserLocation, directionCoordinates, initialState = {location: CONST.MAPBOX.DEFAULT_COORDINATE, zoom: CONST.MAPBOX.DEFAULT_ZOOM}}, ref) => {
        const [mapRef, setMapRef] = useState<MapRef | null>(null);
        const [userLocation, setUserLocation] = useState(cachedUserLocation);
        const [isCurrentPositionFetching, setIsCurrentPositionFetching] = useState(true);
        const [userInteractedWithMap, setUserInteractedWithMap] = useState(false);
        const setRef = useCallback((newRef: MapRef | null) => setMapRef(newRef), []);

        useFocusEffect(
            useCallback(() => {
                console.log('Start location search')
                getCurrentPosition((params) => {
                    setUserLocation({latitude: params.coords.latitude, longitude: params.coords.longitude})
                    Onyx.merge(ONYXKEYS.USER_LOCATION, { latitude: params.coords.latitude, longitude: params.coords.longitude})
                    setIsCurrentPositionFetching(false);
                    console.log('Location search success')
                },
                () => {
                    // On error do nothing - an already cached location
                    // or the default location will be presented to the user
                    console.log('Location search error')
                    setIsCurrentPositionFetching(false);
                })
            }, [])
        )

        useEffect(() => {
            if (!userLocation || !mapRef) {
                return;
            }

            console.log('Map loaded')

            if (waypoints && waypoints.length > 0) {
                console.log('Waypoints existing. Dont jump')
                return;
            }

            if (userInteractedWithMap) {
                console.log('User already started clicking or dragging through the map. Dont jump')
                return;
            }

            console.log('No waypoints added. JumpTo')

            mapRef.jumpTo({
                center: [userLocation.longitude, userLocation.latitude],
                zoom: CONST.MAPBOX.DEFAULT_ZOOM,
            });
        }, [userLocation, userInteractedWithMap, mapRef])

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
                <View
                    style={style}
                    // eslint-disable-next-line
                    {...responder.panHandlers}
                >
                    <Map
                        onDrag={() => setUserInteractedWithMap(true)}
                        ref={setRef}
                        mapLib={mapboxgl}
                        mapboxAccessToken={accessToken}
                        initialViewState={{
                            longitude: initialState.location[0],
                            latitude: initialState.location[1],
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
                <Text
                    style={[styles.chatItemComposeSecondaryRowSubText, styles.chatItemComposeSecondaryRowOffset, styles.pre]}
                >
                    {isCurrentPositionFetching ? 'Finding your location...' : ' '}
                </Text>
            </>
        );
    },
);

export default withOnyx<ComponentProps,MapViewOnyxProps >({
    userLocation: {
        key: ONYXKEYS.USER_LOCATION,
    }
})(MapView)