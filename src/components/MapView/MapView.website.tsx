// Explanation: Different Mapbox libraries are required for web and native mobile platforms.
// This is why we have separate components for web and native to handle the specific implementations.
// For the web version, we use the Mapbox Web library called react-map-gl, while for the native mobile version,
// we utilize a different Mapbox library @rnmapbox/maps tailored for mobile development.
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import React, {forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState} from 'react';
import type {MapRef} from 'react-map-gl';
import Map, {Marker} from 'react-map-gl';
import {View} from 'react-native';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import {PressableWithoutFeedback} from '@components/Pressable';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import useLocalize from '@src/hooks/useLocalize';
import useNetwork from '@src/hooks/useNetwork';
import Direction from './Direction';
import './mapbox.css';
import type {MapViewHandle, MapViewProps} from './MapViewTypes';
import PendingMapView from './PendingMapView';
import responder from './responder';
import useCurrentPosition from './useCurrentPosition';
import utils from './utils';

const MapView = forwardRef<MapViewHandle, MapViewProps>(
    (
        {
            style,
            styleURL,
            waypoints,
            mapPadding,
            accessToken,
            directionCoordinates,
            initialState = {location: CONST.MAPBOX.DEFAULT_COORDINATE, zoom: CONST.MAPBOX.DEFAULT_ZOOM},
            interactive = true,
        },
        ref,
    ) => {
        const {isOffline} = useNetwork();
        const {translate} = useLocalize();

        const theme = useTheme();
        const styles = useThemeStyles();
        const StyleUtils = useStyleUtils();

        const [mapRef, setMapRef] = useState<MapRef | null>(null);
        const [shouldResetBoundaries, setShouldResetBoundaries] = useState<boolean>(false);
        const setRef = useCallback((newRef: MapRef | null) => setMapRef(newRef), []);

        const flyTo = useCallback(
            (location: [number, number], zoomLevel: number = CONST.MAPBOX.DEFAULT_ZOOM, animationDuration?: number) =>
                mapRef?.flyTo({
                    center: location,
                    zoom: zoomLevel,
                    duration: animationDuration,
                }),
            [mapRef],
        );

        const {currentPosition, setHasUserInteractedWithMap} = useCurrentPosition({
            initialPosition: initialState.location,
            waypoints,
            flyTo,
        });

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

        const centerMap = useCallback(() => {
            if (!mapRef) {
                return;
            }
            if (directionCoordinates && directionCoordinates.length > 1) {
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
        }, [directionCoordinates, currentPosition, mapRef, waypoints, mapPadding]);

        return !isOffline && Boolean(accessToken) && Boolean(currentPosition) ? (
            <View
                style={style}
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...responder.panHandlers}
            >
                <Map
                    onDrag={() => setHasUserInteractedWithMap(true)}
                    ref={setRef}
                    mapLib={mapboxgl}
                    mapboxAccessToken={accessToken}
                    initialViewState={{
                        longitude: currentPosition?.longitude,
                        latitude: currentPosition?.latitude,
                        zoom: initialState.zoom,
                    }}
                    style={StyleUtils.getTextColorStyle(theme.mapAttributionText)}
                    mapStyle={styleURL}
                    interactive={interactive}
                >
                    <Marker
                        key="Current-position"
                        longitude={currentPosition?.longitude ?? 0}
                        latitude={currentPosition?.latitude ?? 0}
                    >
                        <View style={styles.currentPositionDot} />
                    </Marker>
                    {waypoints?.map(({coordinate, markerComponent, id}) => {
                        const MarkerComponent = markerComponent;
                        if (utils.areSameCoordinate([coordinate[0], coordinate[1]], [currentPosition?.longitude ?? 0, currentPosition?.latitude ?? 0])) {
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
                    {directionCoordinates && <Direction coordinates={directionCoordinates} />}
                </Map>
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

export default MapView;
