import {View} from 'react-native';
import {useIsFocused} from '@react-navigation/native';
import Mapbox, {MapState, MarkerView, setAccessToken} from '@rnmapbox/maps';
import {forwardRef, useEffect, useImperativeHandle, useRef, useState} from 'react';

import utils from './utils';
import Direction from './Direction';
import CONST from '../../CONST';

import {MapViewProps, MapViewHandle} from './MapViewTypes';

const MapView = forwardRef<MapViewHandle, MapViewProps>(({accessToken, style, mapPadding, styleURL, pitchEnabled, initialState, waypoints, directionCoordinates, directionStyle}, ref) => {
    const isFocused = useIsFocused();
    const cameraRef = useRef<Mapbox.Camera>(null);
    const [isIdle, setIsIdle] = useState(false);

    useImperativeHandle(
        ref,
        () => ({
            flyTo: (location: [number, number], zoomLevel: number = CONST.MAPBOX.DEFAULT_ZOOM, animationDuration?: number) =>
                cameraRef.current?.setCamera({zoomLevel, centerCoordinate: location, animationDuration}),
            fitBounds: (ne: [number, number], sw: [number, number], paddingConfig?: number | number[] | undefined, animationDuration?: number | undefined) =>
                cameraRef.current?.fitBounds(ne, sw, paddingConfig, animationDuration),
        }),
        [],
    );

    useEffect(() => {
        if (isFocused) return;
        setIsIdle(false);
    }, [isFocused]);

    useEffect(() => {
        if (!waypoints?.length || !isIdle || !isFocused) return;

        if (waypoints.length === 1) {
            cameraRef.current?.setCamera({
                zoomLevel: 15,
                centerCoordinate: waypoints[0].coordinate,
            });
        } else {
            const {southWest, northEast} = utils.getBounds(waypoints.map((waypoint) => waypoint.coordinate));
            cameraRef.current?.fitBounds(northEast, southWest, mapPadding, 1000);
        }
    }, [mapPadding, waypoints, isFocused, isIdle]);

    useEffect(() => {
        setAccessToken(accessToken);
    }, [accessToken]);

    const setMapIdle = (e: MapState) => {
        if (e.gestures.isGestureActive) return;
        setIsIdle(true);
    };

    return (
        <View style={style}>
            <Mapbox.MapView
                style={{flex: 1}}
                styleURL={styleURL}
                onMapIdle={setMapIdle}
                pitchEnabled={pitchEnabled}
            >
                <Mapbox.Camera
                    ref={cameraRef}
                    defaultSettings={{
                        centerCoordinate: initialState?.location,
                        zoomLevel: initialState?.zoom,
                    }}
                />

                {waypoints?.map(({coordinate, markerComponent}) => {
                    const MarkerComponent = markerComponent;
                    return (
                        <MarkerView
                            id={`${coordinate[0]},${coordinate[1]}`}
                            key={`${coordinate[0]},${coordinate[1]}`}
                            coordinate={coordinate}
                        >
                            <MarkerComponent />
                        </MarkerView>
                    );
                })}

                {directionCoordinates && (
                    <Direction
                        coordinates={directionCoordinates}
                        directionStyle={directionStyle}
                    />
                )}
            </Mapbox.MapView>
        </View>
    );
});

export default MapView;
