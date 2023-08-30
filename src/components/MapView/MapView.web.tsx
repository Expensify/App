import React, {forwardRef, useCallback, useEffect, useImperativeHandle, useState} from 'react';
import {View} from 'react-native';
import Map, {MapRef, Marker} from 'react-map-gl';

import utils from './utils';

import CONST from '../../CONST';
import Direction from './Direction';
import {MapViewHandle, MapViewProps} from './MapViewTypes';

import 'mapbox-gl/dist/mapbox-gl.css';

const MapView = forwardRef<MapViewHandle, MapViewProps>(
    (
        {
            style,
            styleURL,
            waypoints,
            mapPadding,
            accessToken,
            directionStyle,
            directionCoordinates,
            initialState = {location: CONST.MAPBOX.DEFAULT_COORDINATE, zoom: CONST.MAPBOX.DEFAULT_ZOOM},
        },
        ref,
    ) => {
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

        useImperativeHandle(
            ref,
            () => ({
                flyTo: (location: [number, number], zoomLevel: number = CONST.MAPBOX.DEFAULT_ZOOM, animationDuration?: number) =>
                    mapRef?.flyTo({
                        center: location,
                        zoom: zoomLevel,
                        duration: animationDuration,
                    }),
                fitBounds: (ne: [number, number], sw: [number, number]) => mapRef?.fitBounds([ne, sw]),
            }),
            [mapRef],
        );

        return (
            <View style={style}>
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
                    {waypoints?.map(({coordinate, markerComponent}) => {
                        const MarkerComponent = markerComponent;
                        return (
                            <Marker
                                key={`${coordinate[0]},${coordinate[1]}`}
                                longitude={coordinate[0]}
                                latitude={coordinate[1]}
                            >
                                <MarkerComponent />
                            </Marker>
                        );
                    })}
                    {directionCoordinates && (
                        <Direction
                            coordinates={directionCoordinates}
                            directionStyle={directionStyle}
                        />
                    )}
                </Map>
            </View>
        );
    },
);

export default MapView;
