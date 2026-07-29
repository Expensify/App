import ImageSVG from '@components/ImageSVG';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';

import type IconAsset from '@src/types/utils/IconAsset';

import type {ReactNode} from 'react';

import React from 'react';

import type {MapMarkerType} from './types';

import getMapMarkerSize from './getMapMarkerSize';

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

export default useMapMarkers;
