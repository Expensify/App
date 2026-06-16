import {useFocusEffect} from '@react-navigation/native';
import Mapbox from '@rnmapbox/maps';
import {useEffect, useRef, useState} from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import ImageSVG from '@components/ImageSVG';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import useLocalize from '@src/hooks/useLocalize';
import useNetwork from '@src/hooks/useNetwork';
import GPSDirection from './GPSDirection';
import GPSWaypointLayer from './GPSWaypointLayer';
import LOCATION_PUCK_LAYER_ID from './locationPuckLayerId';
import type {GPSMapViewProps} from './MapViewTypes';
import PendingMapView from './PendingMapView';
import responder from './responder';
import useAccessToken from './useAccessToken';
import utils from './utils';

const LOCATION_PUCK_PULSING = {
    isEnabled: true,
    color: CONST.MAP_CURRENT_LOCATION_FILL_COLOR,
    radius: 40.0,
};

const CURRENT_LOCATION_PUCK_IMAGE = 'current-location-puck-image';

function GPSMapView({accessToken, style, mapPadding, styleURL, pitchEnabled, waypoints, directionCoordinates: directionCoordinatesProp, isTrackingGPS, hasEverTrackedGPS}: GPSMapViewProps) {
    const directionCoordinates = !directionCoordinatesProp || utils.isSingleSegmentRoute(directionCoordinatesProp) ? directionCoordinatesProp : directionCoordinatesProp.flat();
    const noWaypoints = !waypoints || waypoints.length === 0;

    const {isOffline} = useNetwork();
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const theme = useTheme();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Crosshair', 'MapCurrentLocationPuck']);
    const isAccessTokenSet = useAccessToken({accessToken});

    const cameraRef = useRef<Mapbox.Camera>(null);

    const [userInteractedWithMap, setUserInteractedWithMap] = useState(false);
    const [shouldUseImmediateFollowTransition, setShouldUseImmediateFollowTransition] = useState(noWaypoints);
    const [lastLocation, setLastLocation] = useState<{longitude: number; latitude: number} | undefined>();

    // Determines if map can be panned to user's detected location without bothering the user. It will return
    // false if user has already started dragging the map or if there are one or more waypoints present and the GPS trip is not active.
    const shouldFollowUserLocation = !userInteractedWithMap && (noWaypoints || isTrackingGPS);

    // When the route/waypoints are cleared (e.g. discarding a GPS trip),
    // resume following the user's current location.
    const prevWaypointsLength = useRef(waypoints?.length ?? 0);
    useEffect(() => {
        const currentLength = waypoints?.length ?? 0;
        if (prevWaypointsLength.current > 0 && currentLength === 0) {
            setUserInteractedWithMap(false);
        }
        prevWaypointsLength.current = currentLength;
    }, [waypoints?.length]);

    useFocusEffect(() => {
        if (noWaypoints || shouldFollowUserLocation || !!lastLocation || userInteractedWithMap) {
            return;
        }

        const {southWest, northEast} = utils.getBounds(
            waypoints.map((waypoint) => waypoint.coordinate),
            directionCoordinates,
        );
        cameraRef.current?.fitBounds(northEast, southWest, mapPadding, CONST.MAPBOX.ANIMATION_DURATION_ON_CENTER_ME);
    });

    const centerMap = () => {
        const waypointCoordinates = waypoints?.map((waypoint) => waypoint.coordinate) ?? [];
        if (!isTrackingGPS && (waypointCoordinates.length > 1 || (directionCoordinates ?? []).length > 1)) {
            const {southWest, northEast} = utils.getBounds(waypointCoordinates, directionCoordinates);
            cameraRef.current?.fitBounds(southWest, northEast, mapPadding, CONST.MAPBOX.ANIMATION_DURATION_ON_CENTER_ME);
            return;
        }
        setUserInteractedWithMap(false);
    };

    const getWaypointBounds = () => {
        if (!waypoints || userInteractedWithMap || (!waypoints.length && !directionCoordinates?.length)) {
            return undefined;
        }

        const {northEast, southWest} = utils.getBounds(
            waypoints.map((waypoint) => waypoint.coordinate),
            directionCoordinates,
        );
        return {ne: northEast, sw: southWest};
    };

    const waypointsBounds = getWaypointBounds();

    const onUserLocationUpdate = (update: Mapbox.Location) => {
        const coords = update.coords;
        setLastLocation({longitude: coords.longitude, latitude: coords.latitude});
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
                    <Mapbox.Viewport
                        onStatusChanged={(event) => {
                            if (!shouldUseImmediateFollowTransition) {
                                return;
                            }

                            if (event.from.kind === 'transition' && event.from.toState.kind === 'followPuck') {
                                setShouldUseImmediateFollowTransition(false);
                            }
                        }}
                    />
                    <Mapbox.Camera
                        ref={cameraRef}
                        followUserLocation={shouldFollowUserLocation}
                        followUserLocationUseImmediateTransition={shouldUseImmediateFollowTransition}
                        followZoomLevel={CONST.MAPBOX.DEFAULT_ZOOM}
                        bounds={waypointsBounds ? {...waypointsBounds, paddingLeft: mapPadding, paddingRight: mapPadding, paddingTop: mapPadding, paddingBottom: mapPadding} : undefined}
                        // defaultSettings with bounds ensures there is immediate snap to GPS trip on map load
                        defaultSettings={{bounds: waypointsBounds}}
                    />

                    {/** We want to use our custom current location marker instead of the default one */}
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
                        pulsing={LOCATION_PUCK_PULSING}
                        topImage={CURRENT_LOCATION_PUCK_IMAGE}
                    />
                    <Mapbox.UserLocation
                        onUpdate={onUserLocationUpdate}
                        visible={false}
                    />

                    <GPSWaypointLayer
                        waypoints={waypoints}
                        // To ensure that waypoints are shown below the location puck we need to pass its belowLayerID
                        // which on iOS is not ready on the first render, so we pass it only after user has started a GPS trip
                        // Android does not support dynamic belowLayerID prop change, so we pass key to remount this component instead
                        key={hasEverTrackedGPS ? 'below-location-puck' : 'default'}
                        // The native Mapbox SDK renders the user-location puck on its own dedicated layer. We render waypoints below
                        // that layer so the puck always stays on top of the line. The layer id differs per platform.
                        belowLayerID={hasEverTrackedGPS ? LOCATION_PUCK_LAYER_ID : undefined}
                    />

                    <GPSDirection
                        directionCoordinates={directionCoordinatesProp}
                        isTrackingGPS={isTrackingGPS}
                        lastLocation={lastLocation}
                    />
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
                    <GPSPendingMapView />
                </View>
            )}
        </>
    ) : (
        <GPSPendingMapView />
    );
}

function GPSPendingMapView() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {isOffline} = useNetwork();

    return (
        <PendingMapView
            title={translate('distance.mapPending.title')}
            subtitle={isOffline ? translate('distance.mapPending.subtitle') : translate('distance.mapPending.onlineSubtitle')}
            style={styles.mapEditView}
        />
    );
}

export default GPSMapView;
