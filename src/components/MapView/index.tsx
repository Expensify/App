import React from 'react';

import type {MapViewProps} from './MapViewTypes';

import MapView from './MapView';

function MapViewComponent(props: MapViewProps) {
    return <MapView {...props} />;
}

export default MapViewComponent;
