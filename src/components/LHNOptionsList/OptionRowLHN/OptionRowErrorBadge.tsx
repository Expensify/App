import React from 'react';
import {View} from 'react-native';
import Badge from '@components/Badge';
import Icon from '@components/Icon';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import type {OptionData} from '@libs/ReportUtils';
import CONST from '@src/CONST';

type OptionRowErrorBadgeProps = {
    brickRoadIndicator: OptionData['brickRoadIndicator'];
    actionBadgeText: string;
};

function OptionRowErrorBadge({brickRoadIndicator, actionBadgeText}: OptionRowErrorBadgeProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {DotIndicator} = useMemoizedLazyExpensifyIcons(['DotIndicator']);

    if (brickRoadIndicator !== CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR) {
        return null;
    }

    return (
        <View style={[styles.alignItemsCenter, styles.justifyContentCenter]}>
            {actionBadgeText ? (
                <Badge
                    text={actionBadgeText}
                    error
                    isStrong
                />
            ) : (
                <Icon
                    testID="RBR Icon"
                    src={DotIndicator}
                    fill={theme.danger}
                />
            )}
        </View>
    );
}

OptionRowErrorBadge.displayName = 'OptionRowErrorBadge';

export default OptionRowErrorBadge;
