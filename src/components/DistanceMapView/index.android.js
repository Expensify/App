import React, {useState} from 'react';
import {View} from 'react-native';
import _ from 'underscore';
import BlockingView from '../BlockingViews/BlockingView';
import MapView from '../MapView';
import styles from '../../styles/styles';
import useNetwork from '../../hooks/useNetwork';
import useLocalize from '../../hooks/useLocalize';
import * as Expensicons from '../Icon/Expensicons';
import * as StyleUtils from '../../styles/StyleUtils';
import * as distanceMapViewPropTypes from './distanceMapViewPropTypes';

function DistanceMapView(props) {
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
