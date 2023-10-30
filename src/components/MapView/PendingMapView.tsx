import React from 'react';
import {View} from 'react-native';
import _ from 'lodash';
import variables from '../../styles/variables';
import styles from '../../styles/styles';
import Icon from '../Icon';
import {PendingMapViewProps} from './MapViewTypes';
import BlockingView from '../BlockingViews/BlockingView';
import * as Expensicons from '../Icon/Expensicons';

function PendingMapView({title = '', subtitle = '', style}: PendingMapViewProps) {
    const hasTextContent = !_.isEmpty(title) || !_.isEmpty(subtitle);

    return (
        <View style={[styles.mapPendingView, style]}>
            {hasTextContent ? (
                <BlockingView
                    icon={Expensicons.EmptyStateRoutePending}
                    title={title}
                    subtitle={subtitle}
                    shouldShowLink={false}
                />
            ) : (
                <View style={[styles.flex1, styles.alignItemsCenter, styles.justifyContentCenter, styles.ph10]}>
                    <Icon
                        src={Expensicons.EmptyStateRoutePending}
                        width={variables.iconSizeUltraLarge}
                        height={variables.iconSizeUltraLarge}
                    />
                </View>
            )}
        </View>
    );
}

export default PendingMapView;
