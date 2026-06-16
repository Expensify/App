import React from 'react';
import MapView from './MapView';
import type {MapViewProps} from './MapViewTypes';

function MapViewComponent(props: MapViewProps) {
    return <MapView {...props} />;
}

export default MapViewComponent;
