import isEmpty from 'lodash/isEmpty';
import React from 'react';
import {View} from 'react-native';
import BlockingView from '@components/BlockingViews/BlockingView';
import Icon from '@components/Icon';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import type {PendingMapViewProps} from './MapViewTypes';

function PendingMapView({title = '', subtitle = '', style, isSmallerIcon = false}: PendingMapViewProps) {
    const hasTextContent = !isEmpty(title) || !isEmpty(subtitle);
    const styles = useThemeStyles();
    const theme = useTheme();
    const icons = useMemoizedLazyExpensifyIcons(['EmptyStateRoutePending'] as const);
    const iconSize = isSmallerIcon ? variables.iconSizeSuperLarge : variables.iconSizeUltraLarge;
    return (
        <View style={[styles.mapPendingView, style]}>
            {hasTextContent ? (
                <BlockingView
                    icon={icons.EmptyStateRoutePending}
                    iconColor={theme.border}
                    title={title}
                    subtitle={subtitle}
                    subtitleStyle={styles.textSupporting}
                />
            ) : (
                <View style={[styles.flex1, styles.alignItemsCenter, styles.justifyContentCenter, styles.ph10]}>
                    <Icon
                        src={icons.EmptyStateRoutePending}
                        width={iconSize}
                        height={iconSize}
                        fill={theme.border}
                    />
                </View>
            )}
        </View>
    );
}

PendingMapView.displayName = 'PendingMapView';

export default PendingMapView;
