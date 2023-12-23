import React from 'react';
import MapView from '@components/MapView';
import DistanceMapViewProps from './types';

function DistanceMapView({accessToken, style, userLocation, directionCoordinates, initialState, mapPadding, onMapReady, pitchEnabled, styleURL, waypoints}: DistanceMapViewProps) {
    // Here we want to omit the overlayStyle prop
    return (
        <MapView
            accessToken={accessToken}
            style={style}
            userLocation={userLocation}
            directionCoordinates={directionCoordinates}
            initialState={initialState}
            mapPadding={mapPadding}
            onMapReady={onMapReady}
            pitchEnabled={pitchEnabled}
            styleURL={styleURL}
            waypoints={waypoints}
        />
    );
}

DistanceMapView.displayName = 'DistanceMapView';

export default DistanceMapView;
