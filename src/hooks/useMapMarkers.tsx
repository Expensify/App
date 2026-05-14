import React from 'react';
import type {ReactNode} from 'react';
import ImageSVG from '@components/ImageSVG';
import CONST from '@src/CONST';
import type IconAsset from '@src/types/utils/IconAsset';
import {useMemoizedLazyExpensifyIcons} from './useLazyAsset';

type MapMarkerType = Exclude<keyof typeof CONST.MAP_MARKER_SIZES, 'CURRENT_LOCATION'>;

function getMapMarkerSize(markerType: MapMarkerType): {width: number; height: number} {
    return CONST.MAP_MARKER_SIZES[markerType];
}

function useMapMarkers() {
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['MapStartWaypoint', 'MapStopWaypoint', 'MapWaypoint']);

    const getMapMarkerIconAsset = (markerType: MapMarkerType): IconAsset => {
        switch (markerType) {
            case 'START_WAYPOINT':
                return expensifyIcons.MapStartWaypoint;
            case 'STOP_WAYPOINT':
                return expensifyIcons.MapStopWaypoint;
            default:
                return expensifyIcons.MapWaypoint;
        }
    };

    const getMapMarkerIconComponent = (markerType: MapMarkerType): ReactNode => {
        const size = getMapMarkerSize(markerType);
        return (
            <ImageSVG
                src={getMapMarkerIconAsset(markerType)}
                width={size.width}
                height={size.height}
            />
        );
    };

    return getMapMarkerIconComponent;
}

export type {MapMarkerType};
export default useMapMarkers;
