import {View} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import Mapbox, {MapState, MarkerView, setAccessToken} from '@rnmapbox/maps';
import {forwardRef, memo, useCallback, useEffect, useImperativeHandle, useRef, useState} from 'react';
import styles from '../../styles/styles';

import responder from './responder';
import utils from './utils';
import Direction from './Direction';
import CONST from '../../CONST';

import {MapViewProps, MapViewHandle} from './MapViewTypes';

const MapView = forwardRef<MapViewHandle, MapViewProps>(({accessToken, style, mapPadding, styleURL, pitchEnabled, initialState, waypoints, directionCoordinates, onMapReady}, ref) => {
    const cameraRef = useRef<Mapbox.Camera>(null);
    const [isIdle, setIsIdle] = useState(false);

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
            if (waypoints?.length && isIdle) {
                if (waypoints.length === 1) {
                    cameraRef.current?.setCamera({
                        zoomLevel: 15,
                        animationDuration: 1500,
                        centerCoordinate: waypoints[0].coordinate,
                    });
                } else {
                    const {southWest, northEast} = utils.getBounds(waypoints.map((waypoint) => waypoint.coordinate));
                    cameraRef.current?.fitBounds(northEast, southWest, mapPadding, 1000);
                }
            }
            return () => {
                setIsIdle(false);
            };
        }, [mapPadding, waypoints, isIdle]),
    );

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

    return (
        <View style={style}>
            <Mapbox.MapView
                style={{flex: 1}}
                styleURL={styleURL}
                onMapIdle={setMapIdle}
                pitchEnabled={pitchEnabled}
                attributionPosition={{...styles.r2, ...styles.b2}}
                logoPosition={{...styles.l2, ...styles.b2}}
                // eslint-disable-next-line
                {...responder.panHandlers}
            >
                <Mapbox.Camera
                    ref={cameraRef}
                    defaultSettings={{
                        centerCoordinate: initialState?.location,
                        zoomLevel: initialState?.zoom,
                    }}
                />

                {waypoints?.map(({coordinate, markerComponent, id}) => {
                    const MarkerComponent = markerComponent;
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
        </View>
    );
});

export default memo(MapView);
