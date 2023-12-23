import React, {useState} from 'react';
import {StyleSheet, View} from 'react-native';
import BlockingView from '@components/BlockingViews/BlockingView';
import * as Expensicons from '@components/Icon/Expensicons';
import MapView from '@components/MapView';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useThemeStyles from '@hooks/useThemeStyles';
import DistanceMapViewProps from './types';

function DistanceMapView({accessToken, style, userLocation, directionCoordinates, initialState, mapPadding, pitchEnabled, styleURL, waypoints, overlayStyle}: DistanceMapViewProps) {
    const styles = useThemeStyles();
    const [isMapReady, setIsMapReady] = useState(false);
    const {isOffline} = useNetwork();
    const {translate} = useLocalize();

    return (
        <>
            <MapView
                accessToken={accessToken}
                style={style}
                userLocation={userLocation}
                directionCoordinates={directionCoordinates}
                initialState={initialState}
                mapPadding={mapPadding}
                pitchEnabled={pitchEnabled}
                styleURL={styleURL}
                waypoints={waypoints}
                onMapReady={() => {
                    if (isMapReady) {
                        return;
                    }
                    setIsMapReady(true);
                }}
            />
            {!isMapReady && (
                <View style={StyleSheet.flatten([styles.mapViewOverlay, overlayStyle])}>
                    <BlockingView
                        icon={Expensicons.EmptyStateRoutePending}
                        title={translate('distance.mapPending.title')}
                        subtitle={isOffline ? translate('distance.mapPending.subtitle') : translate('distance.mapPending.onlineSubtitle')}
                        shouldShowLink={false}
                    />
                </View>
            )}
        </>
    );
}

DistanceMapView.displayName = 'DistanceMapView';

export default DistanceMapView;
