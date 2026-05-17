import React from 'react';
import MapView from '@components/MapView';
import type DistanceMapViewProps from './types';

function DistanceMapView({overlayStyle, ...rest}: DistanceMapViewProps) {
    return <MapView {...rest} />;
}

export default DistanceMapView;
