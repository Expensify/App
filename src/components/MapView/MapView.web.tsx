// Explanation: Different Mapbox libraries are required for web and native mobile platforms.
// This is why we have separate components for web and native to handle the specific implementations.
// For the web version, we use the Mapbox Web library called react-map-gl, while for the native mobile version,
// we utilize a different Mapbox library @rnmapbox/maps tailored for mobile development.

import React, {forwardRef, useCallback, useEffect, useImperativeHandle, useState} from 'react';
import {View} from 'react-native';
import Map, {MapRef, Marker} from 'react-map-gl';

import responder from './responder';
import utils from './utils';

import CONST from '../../CONST';
import Direction from './Direction';
import {MapViewHandle, MapViewProps} from './MapViewTypes';

import 'mapbox-gl/dist/mapbox-gl.css';

const MapView = forwardRef<MapViewHandle, MapViewProps>(
    ({style, styleURL, waypoints, mapPadding, accessToken, directionCoordinates, initialState = {location: CONST.MAPBOX.DEFAULT_COORDINATE, zoom: CONST.MAPBOX.DEFAULT_ZOOM}}, ref) => {
        const [mapRef, setMapRef] = useState<MapRef | null>(null);
        const setRef = useCallback((newRef: MapRef | null) => setMapRef(newRef), []);

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
                    zoom: 15,
                });
                return;
            }

            const map = mapRef.getMap();

            const {northEast, southWest} = utils.getBounds(waypoints.map((waypoint) => waypoint.coordinate));
            map.fitBounds([northEast, southWest], {padding: mapPadding});
        }, [waypoints, mapRef, mapPadding]);

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
            <View
                style={style}
                // eslint-disable-next-line
                {...responder.panHandlers}
            >
                <Map
                    ref={setRef}
                    mapboxAccessToken={accessToken}
                    initialViewState={{
                        longitude: initialState.location[0],
                        latitude: initialState.location[1],
                        zoom: initialState.zoom,
                    }}
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
        );
    },
);

export default MapView;
