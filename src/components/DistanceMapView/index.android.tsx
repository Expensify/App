import React, {useState} from 'react';
import {View} from 'react-native';
import BlockingView from '@components/BlockingViews/BlockingView';
import * as Expensicons from '@components/Icon/Expensicons';
import MapView from '@components/MapView';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import type DistanceMapViewProps from './types';

function DistanceMapView({overlayStyle, ...rest}: DistanceMapViewProps) {
    const styles = useThemeStyles();
    const [isMapReady, setIsMapReady] = useState(false);
    const {isOffline} = useNetwork();
    const {translate} = useLocalize();
    const theme = useTheme();

    return (
        <>
            <MapView
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...rest}
                onMapReady={() => {
                    if (isMapReady) {
                        return;
                    }
                    setIsMapReady(true);
                }}
            />
            {!isMapReady && (
                <View style={[styles.mapViewOverlay, overlayStyle]}>
                    <BlockingView
                        icon={Expensicons.EmptyStateRoutePending}
                        title={translate('distance.mapPending.title')}
                        subtitle={isOffline ? translate('distance.mapPending.subtitle') : translate('distance.mapPending.onlineSubtitle')}
                        shouldShowLink={false}
                        iconColor={theme.border}
                    />
                </View>
            )}
        </>
    );
}

DistanceMapView.displayName = 'DistanceMapView';

export default DistanceMapView;
