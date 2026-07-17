import MapView from '@components/MapView';

import React from 'react';

import type DistanceMapViewProps from './types';

function DistanceMapView({overlayStyle, ...rest}: DistanceMapViewProps) {
    return <MapView {...rest} />;
}

export default DistanceMapView;
