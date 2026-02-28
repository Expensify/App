import React from 'react';
import MapView from '@components/MapView';
import type DistanceMapViewProps from './types';

function DistanceMapView({overlayStyle, ...rest}: DistanceMapViewProps) {
    // eslint-disable-next-line react/jsx-props-no-spreading
    return <MapView {...rest} />;
}

export default DistanceMapView;
