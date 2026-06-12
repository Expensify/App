import Mapbox from '@rnmapbox/maps';
import {useMemo} from 'react';
import ImageSVG from '@components/ImageSVG';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import getMapMarkerSize from '@hooks/useMapMarkers/getMapMarkerSize';
import type {MapMarkerType} from '@hooks/useMapMarkers/types';
import CONST from '@src/CONST';
import type {WayPoint} from './MapViewTypes';

const WAYPOINT_ICON_NAMES: Record<MapMarkerType, string> = {
    START_WAYPOINT: 'map-start-waypoint-image',
    STOP_WAYPOINT: 'map-stop-waypoint-image',
    WAYPOINT: 'map-waypoint-image',
};

type GPSWaypointLayerProps = {
    waypoints?: WayPoint[];
    belowLayerID?: string;
};

function GPSWaypointLayer({waypoints, belowLayerID}: GPSWaypointLayerProps) {
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['MapStartWaypoint', 'MapStopWaypoint', 'MapWaypoint']);

    const waypointFeatures = useMemo(() => {
        if (!waypoints?.length) {
            return [];
        }

        return waypoints.flatMap((waypoint) => {
            if (!waypoint.markerType) {
                return [];
            }

            return [
                {
                    type: 'Feature' as const,
                    geometry: {
                        type: 'Point' as const,
                        coordinates: waypoint.coordinate,
                    },
                    properties: {
                        icon: WAYPOINT_ICON_NAMES[waypoint.markerType],
                    },
                },
            ];
        });
    }, [waypoints]);

    if (waypointFeatures.length === 0) {
        return null;
    }

    return (
        <>
            <Mapbox.Images>
                <Mapbox.Image name={WAYPOINT_ICON_NAMES.START_WAYPOINT}>
                    <ImageSVG
                        src={expensifyIcons.MapStartWaypoint}
                        width={getMapMarkerSize('START_WAYPOINT').width}
                        height={getMapMarkerSize('START_WAYPOINT').height}
                    />
                </Mapbox.Image>
                <Mapbox.Image name={WAYPOINT_ICON_NAMES.STOP_WAYPOINT}>
                    <ImageSVG
                        src={expensifyIcons.MapStopWaypoint}
                        width={getMapMarkerSize('STOP_WAYPOINT').width}
                        height={getMapMarkerSize('STOP_WAYPOINT').height}
                    />
                </Mapbox.Image>
                <Mapbox.Image name={WAYPOINT_ICON_NAMES.WAYPOINT}>
                    <ImageSVG
                        src={expensifyIcons.MapWaypoint}
                        width={getMapMarkerSize('WAYPOINT').width}
                        height={getMapMarkerSize('WAYPOINT').height}
                    />
                </Mapbox.Image>
            </Mapbox.Images>
            <Mapbox.ShapeSource
                id={CONST.MAP_VIEW_LAYERS.WAYPOINTS_SOURCE}
                shape={{
                    type: 'FeatureCollection',
                    features: waypointFeatures,
                }}
            >
                <Mapbox.SymbolLayer
                    id={CONST.MAP_VIEW_LAYERS.WAYPOINTS}
                    belowLayerID={belowLayerID}
                    style={{
                        iconImage: ['get', 'icon'],
                        iconAllowOverlap: true,
                        iconIgnorePlacement: true,
                    }}
                />
            </Mapbox.ShapeSource>
        </>
    );
}

export default GPSWaypointLayer;
