import React from 'react';
import MapView from './MapView';
import type {MapViewProps} from './MapViewTypes';

function MapViewComponent(props: MapViewProps) {
    // eslint-disable-next-line react/jsx-props-no-spreading
    return <MapView {...props} />;
}

export default MapViewComponent;
