import React from 'react';
import type {ReactNode} from 'react';
import ImageSVG from '@components/ImageSVG';
import getMapMarkerSize from './getMapMarkerSize';
import type {MapMarkerType} from './types';
import useMapMarkerIconAsset from './useMapMarkerIconAsset';

function useMapMarkers() {
    const getMapMarkerIconAsset = useMapMarkerIconAsset();

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
