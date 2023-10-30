import React from 'react';
import _ from 'underscore';
import MapView from '../MapView';
import * as distanceMapViewPropTypes from './distanceMapViewPropTypes';

function DistanceMapView(props) {
    // eslint-disable-next-line react/jsx-props-no-spreading
    return <MapView {..._.omit(props, 'overlayStyle')} />;
}

DistanceMapView.propTypes = distanceMapViewPropTypes.propTypes;
DistanceMapView.defaultProps = distanceMapViewPropTypes.defaultProps;
DistanceMapView.displayName = 'DistanceMapView';

export default DistanceMapView;
