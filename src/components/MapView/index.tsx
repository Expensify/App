import React from 'react';
import MapView from './MapView';
import {ComponentProps} from './types';

function MapViewComponent(props: ComponentProps) {
    // eslint-disable-next-line react/jsx-props-no-spreading
    return <MapView {...props} />;
}

export default MapViewComponent;
