import React, {useState} from 'react';
import {View} from 'react-native';
import _ from 'underscore';
import BlockingView from '@components/BlockingViews/BlockingView';
import * as Expensicons from '@components/Icon/Expensicons';
import MapView from '@components/MapView';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import * as StyleUtils from '@styles/StyleUtils';
import useThemeStyles from '@styles/useThemeStyles';
import * as distanceMapViewPropTypes from './distanceMapViewPropTypes';

function DistanceMapView(props) {
    const styles = useThemeStyles();
    const [isMapReady, setIsMapReady] = useState(false);
    const {isOffline} = useNetwork();
    const {translate} = useLocalize();

    return (
        <>
            <MapView
                // eslint-disable-next-line react/jsx-props-no-spreading
                {..._.omit(props, 'overlayStyle')}
                onMapReady={() => {
                    if (isMapReady) {
                        return;
                    }
                    setIsMapReady(true);
                }}
            />
            {!isMapReady && (
                <View style={StyleUtils.combineStyles(styles.mapViewOverlay, props.overlayStyle)}>
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

DistanceMapView.propTypes = distanceMapViewPropTypes.propTypes;
DistanceMapView.defaultProps = distanceMapViewPropTypes.defaultProps;
DistanceMapView.displayName = 'DistanceMapView';

export default DistanceMapView;
