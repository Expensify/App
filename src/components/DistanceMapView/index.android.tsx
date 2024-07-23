import React, {useState} from 'react';
import {View} from 'react-native';
import BlockingView from '@components/BlockingViews/BlockingView';
import * as Expensicons from '@components/Icon/Expensicons';
import MapView from '@components/MapView';
import PendingMapView from '@components/MapView/PendingMapView';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import type DistanceMapViewProps from './types';

function DistanceMapView({overlayStyle, requireRouteToDisplayMap, ...rest}: DistanceMapViewProps) {
    const styles = useThemeStyles();
    const [isMapReady, setIsMapReady] = useState(false);
    const {isOffline} = useNetwork();
    const {translate} = useLocalize();
    const theme = useTheme();
    const StyleUtils = useStyleUtils();

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
                <View style={[styles.mapViewOverlay, overlayStyle, requireRouteToDisplayMap && StyleUtils.getBorderRadiusStyle(0)]}>
                    {/* The "map pending" text should only be shown in the IOU create flow. In the created IOU preview, only the icon should be shown. */}
                    {!requireRouteToDisplayMap ? (
                        <BlockingView
                            icon={Expensicons.EmptyStateRoutePending}
                            title={translate('distance.mapPending.title')}
                            subtitle={isOffline ? translate('distance.mapPending.subtitle') : translate('distance.mapPending.onlineSubtitle')}
                            shouldShowLink={false}
                            iconColor={theme.border}
                        />
                    ) : (
                        <PendingMapView
                            isSmallerIcon
                            style={StyleUtils.getBorderRadiusStyle(0)}
                        />
                    )}
                </View>
            )}
        </>
    );
}

DistanceMapView.displayName = 'DistanceMapView';

export default DistanceMapView;
