import {useFocusEffect} from '@react-navigation/native';
import Mapbox, {setAccessToken} from '@rnmapbox/maps';
import {useEffect, useMemo, useRef, useState} from 'react';
import {Platform, View} from 'react-native';
import Button from '@components/Button';
import ImageSVG from '@components/ImageSVG';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {setUserLocation} from '@libs/actions/UserLocation';
import getCurrentPosition from '@libs/getCurrentPosition';
import CONST from '@src/CONST';
import useLocalize from '@src/hooks/useLocalize';
import useNetwork from '@src/hooks/useNetwork';
import Direction from './Direction';
import GPSWaypointLayer from './GPSWaypointLayer';
import type {Coordinate, GPSMapViewProps} from './MapViewTypes';
import PendingMapView from './PendingMapView';
import responder from './responder';
import useAnimatedTrailingDirectionCoordinate from './useAnimatedTrailingDirectionCoordinate';
import utils from './utils';

// The native Mapbox SDK renders the user-location puck on its own dedicated layer. We draw the route below
// that layer so the puck always stays on top of the line. The layer id differs per platform.
const LOCATION_PUCK_LAYER_ID = Platform.select({ios: 'puck', android: 'mapbox-location-indicator-layer'});

const CURRENT_LOCATION_PUCK_IMAGE = 'current-location-puck-image';

function GPSMapView({accessToken, style, mapPadding, styleURL, pitchEnabled, initialState, waypoints, directionCoordinates: directionCoordinatesProp, isTrackingGPS}: GPSMapViewProps) {
    const directionCoordinates = !directionCoordinatesProp || utils.isSingleSegmentRoute(directionCoordinatesProp) ? directionCoordinatesProp : directionCoordinatesProp.flat();

    const {isOffline} = useNetwork();
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const theme = useTheme();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Crosshair', 'MapCurrentLocationPuck']);
    const cameraRef = useRef<Mapbox.Camera>(null);
    const [userInteractedWithMap, setUserInteractedWithMap] = useState(false);
    const shouldInitializeCurrentPosition = useRef(true);
    const [isAccessTokenSet, setIsAccessTokenSet] = useState(false);
    const [lastLocation, setLastLocation] = useState<{longitude: number; latitude: number} | undefined>();
    const lastLocationSet = !!lastLocation;
    const [hasEverTrackedGPS, setHasEverTrackedGPS] = useState(!!isTrackingGPS);

    useEffect(() => {
        if (!isTrackingGPS) {
            return;
        }
        setHasEverTrackedGPS(true);
    }, [isTrackingGPS]);

    // Determines if map can be panned to user's detected
    // location without bothering the user. It will return
    // false if user has already started dragging the map or
    // if there are one or more waypoints present.
    const shouldFollowUserLocation = !userInteractedWithMap && (!waypoints || waypoints.length === 0 || isTrackingGPS);

    const followZoomLevel = initialState?.zoom ?? CONST.MAPBOX.DEFAULT_ZOOM;

    const prevWaypointsLength = useRef(waypoints?.length ?? 0);

    useEffect(() => {
        const currentLength = waypoints?.length ?? 0;
        // When the route/waypoints are cleared (e.g. discarding a GPS trip),
        // resume following the user's current location.
        if (prevWaypointsLength.current > 0 && currentLength === 0) {
            setUserInteractedWithMap(false);
        }
        prevWaypointsLength.current = currentLength;
    }, [waypoints?.length]);

    useFocusEffect(() => {
        if (isOffline) {
            return;
        }

        if (!shouldInitializeCurrentPosition.current) {
            return;
        }

        shouldInitializeCurrentPosition.current = false;

        getCurrentPosition(
            (params) => {
                const currentCoords = {longitude: params.coords.longitude, latitude: params.coords.latitude};
                setUserLocation(currentCoords);
            },
            () => {
                // ignore error
            },
        );
    });

    useFocusEffect(() => {
        if (!waypoints || waypoints.length === 0 || shouldFollowUserLocation || !lastLocationSet) {
            return;
        }

        if (waypoints.length === 1) {
            cameraRef.current?.setCamera({
                zoomLevel: CONST.MAPBOX.SINGLE_MARKER_ZOOM,
                animationDuration: 1500,
                centerCoordinate: waypoints.at(0)?.coordinate,
            });
        } else {
            const {southWest, northEast} = utils.getBounds(
                waypoints.map((waypoint) => waypoint.coordinate),
                directionCoordinates,
            );
            cameraRef.current?.fitBounds(northEast, southWest, mapPadding, 1000);
        }
    });

    useEffect(() => {
        setAccessToken(accessToken).then((token) => {
            if (!token) {
                return;
            }
            setIsAccessTokenSet(true);
        });
    }, [accessToken]);

    useEffect(() => {
        setAccessToken(accessToken).then((token) => {
            if (!token) {
                return;
            }
            setIsAccessTokenSet(true);
        });
    }, [accessToken]);

    const centerMap = () => {
        const waypointCoordinates = waypoints?.map((waypoint) => waypoint.coordinate) ?? [];
        if (!isTrackingGPS && (waypointCoordinates.length > 1 || (directionCoordinates ?? []).length > 1)) {
            const {southWest, northEast} = utils.getBounds(waypoints?.map((waypoint) => waypoint.coordinate) ?? [], directionCoordinates);
            cameraRef.current?.fitBounds(southWest, northEast, mapPadding, CONST.MAPBOX.ANIMATION_DURATION_ON_CENTER_ME);
            return;
        }
        setUserInteractedWithMap(false);
    };

    const getWaypointBounds = () => {
        if (!waypoints || (!waypoints.length && !directionCoordinates?.length)) {
            return undefined;
        }

        const {northEast, southWest} = utils.getBounds(
            waypoints.map((waypoint) => waypoint.coordinate),
            directionCoordinates,
        );
        return {ne: northEast, sw: southWest};
    };

    const waypointsBounds = getWaypointBounds();

    const trailingSegmentMetadata = useMemo(() => {
        const lastSegment = directionCoordinatesProp?.at(-1);

        if (!lastSegment?.length) {
            return {
                secondToLastCoordinate: undefined,
                lastSegmentStartCoordinate: undefined,
            };
        }

        const lastSegmentStartCoordinate = lastSegment.at(0);
        const secondToLastCoordinate = lastSegment.length === 1 ? lastSegmentStartCoordinate : lastSegment.at(-2);

        return {
            secondToLastCoordinate,
            lastSegmentStartCoordinate,
        };
    }, [directionCoordinatesProp]);

    const animatedTrailingCoordinate = useAnimatedTrailingDirectionCoordinate({
        isEnabled: !!isTrackingGPS,
        segmentCount: directionCoordinatesProp?.length ?? 0,
        lastSegmentStartLongitude: trailingSegmentMetadata.lastSegmentStartCoordinate?.at(0),
        lastSegmentStartLatitude: trailingSegmentMetadata.lastSegmentStartCoordinate?.at(1),
        secondToLastLongitude: trailingSegmentMetadata.secondToLastCoordinate?.at(0),
        secondToLastLatitude: trailingSegmentMetadata.secondToLastCoordinate?.at(1),
        targetLongitude: lastLocation?.longitude,
        targetLatitude: lastLocation?.latitude,
        durationMs: CONST.MAPBOX.GPS_ROUTE_ANIMATION_DURATION_MS,
    });

    const getCoordinates = () => {
        if (!isTrackingGPS || !lastLocation || !directionCoordinatesProp || directionCoordinatesProp.length === 0) {
            return directionCoordinatesProp;
        }

        const lastSegment = directionCoordinatesProp.at(-1);
        if (!lastSegment) {
            return directionCoordinatesProp;
        }

        if (lastSegment.length === 0) {
            return directionCoordinatesProp;
        }

        const lastLocationCoordinate: Coordinate = animatedTrailingCoordinate ?? [lastLocation.longitude, lastLocation.latitude];

        const newLastSegment = [...lastSegment.slice(0, lastSegment.length === 1 ? undefined : -1), lastLocationCoordinate];

        const newDirectionCoordinates = [...directionCoordinatesProp.slice(0, directionCoordinatesProp.length - 1), newLastSegment];
        return newDirectionCoordinates;
    };

    return !isOffline && isAccessTokenSet ? (
        <>
            <View style={style}>
                <Mapbox.MapView
                    style={{flex: 1}}
                    styleURL={styleURL}
                    onTouchStart={() => setUserInteractedWithMap(true)}
                    pitchEnabled={pitchEnabled}
                    attributionPosition={{...styles.r2, ...styles.b2}}
                    scaleBarEnabled={false}
                    // We use scaleBarPosition with top: -32 to hide the scale bar on iOS because scaleBarEnabled={false} not work on iOS
                    scaleBarPosition={{...styles.tn8, left: 0}}
                    compassEnabled
                    compassPosition={{...styles.l2, ...styles.t5}}
                    logoPosition={{...styles.l2, ...styles.b2}}
                    {...responder.panHandlers}
                >
                    <Mapbox.Camera
                        ref={cameraRef}
                        followUserLocation={shouldFollowUserLocation}
                        followZoomLevel={followZoomLevel}
                        bounds={waypointsBounds ? {...waypointsBounds, paddingLeft: mapPadding, paddingRight: mapPadding, paddingTop: mapPadding, paddingBottom: mapPadding} : undefined}
                    />

                    <Mapbox.Images>
                        <Mapbox.Image name={CURRENT_LOCATION_PUCK_IMAGE}>
                            <ImageSVG
                                src={expensifyIcons.MapCurrentLocationPuck}
                                width={CONST.MAP_MARKER_SIZES.CURRENT_LOCATION.width}
                                height={CONST.MAP_MARKER_SIZES.CURRENT_LOCATION.height}
                            />
                        </Mapbox.Image>
                    </Mapbox.Images>
                    <Mapbox.LocationPuck
                        pulsing={{
                            isEnabled: true,
                            color: '#0185FF',
                            radius: 40.0,
                        }}
                        topImage={CURRENT_LOCATION_PUCK_IMAGE}
                    />
                    <Mapbox.UserLocation
                        onUpdate={(update) => {
                            const coords = update.coords;
                            setLastLocation({longitude: coords.longitude, latitude: coords.latitude});
                        }}
                        visible={false}
                    />

                    {!!lastLocation && (
                        <GPSWaypointLayer
                            key={hasEverTrackedGPS || isTrackingGPS ? 'below-location-puck' : 'default'}
                            waypoints={waypoints}
                            belowLayerID={hasEverTrackedGPS || isTrackingGPS ? LOCATION_PUCK_LAYER_ID : undefined}
                        />
                    )}

                    {!!directionCoordinatesProp && !!lastLocation && (
                        <Direction
                            coordinates={getCoordinates()}
                            belowLayerID={CONST.MAP_VIEW_LAYERS.WAYPOINTS}
                        />
                    )}
                </Mapbox.MapView>
                <View style={[styles.pAbsolute, styles.p5, styles.t0, styles.r0, {zIndex: 1}]}>
                    <Button
                        onPress={centerMap}
                        iconFill={theme.icon}
                        icon={expensifyIcons.Crosshair}
                        accessibilityLabel={translate('common.center')}
                    />
                </View>
            </View>
            {!lastLocation && (
                <View style={styles.mapViewOverlay}>
                    <PendingMapView
                        title={translate('distance.mapPending.title')}
                        subtitle={isOffline ? translate('distance.mapPending.subtitle') : translate('distance.mapPending.onlineSubtitle')}
                        style={styles.mapEditView}
                    />
                </View>
            )}
        </>
    ) : (
        <PendingMapView
            title={translate('distance.mapPending.title')}
            subtitle={isOffline ? translate('distance.mapPending.subtitle') : translate('distance.mapPending.onlineSubtitle')}
            style={styles.mapEditView}
        />
    );
}

export default GPSMapView;
