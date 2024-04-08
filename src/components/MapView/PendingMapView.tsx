import _ from 'lodash';
import React from 'react';
import {View} from 'react-native';
import BlockingView from '@components/BlockingViews/BlockingView';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import type {PendingMapViewProps} from './MapViewTypes';

function PendingMapView({title = '', subtitle = '', style}: PendingMapViewProps) {
    const hasTextContent = !_.isEmpty(title) || !_.isEmpty(subtitle);
    const styles = useThemeStyles();
    const theme = useTheme();
    return (
        <View style={[styles.mapPendingView, style]}>
            {hasTextContent ? (
                <BlockingView
                    icon={Expensicons.EmptyStateRoutePending}
                    iconColor={theme.border}
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
                        fill={theme.border}
                    />
                </View>
            )}
        </View>
    );
}

PendingMapView.displayName = 'PendingMapView';

export default PendingMapView;
