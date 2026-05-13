import React from 'react';
import {View} from 'react-native';
import Badge from '@components/Badge';
import Icon from '@components/Icon';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import type {OptionData} from '@libs/ReportUtils';
import CONST from '@src/CONST';

type OptionRowInfoBadgeProps = {
    brickRoadIndicator: OptionData['brickRoadIndicator'];
    actionBadgeText: string;
};

function OptionRowInfoBadge({brickRoadIndicator, actionBadgeText}: OptionRowInfoBadgeProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {DotIndicator} = useMemoizedLazyExpensifyIcons(['DotIndicator']);

    if (brickRoadIndicator !== CONST.BRICK_ROAD_INDICATOR_STATUS.INFO) {
        return null;
    }

    if (actionBadgeText) {
        return (
            <Badge
                text={actionBadgeText}
                success
                isStrong
            />
        );
    }

    return (
        <View style={styles.ml2}>
            <Icon
                testID="GBR Icon"
                src={DotIndicator}
                fill={theme.success}
            />
        </View>
    );
}

OptionRowInfoBadge.displayName = 'OptionRowInfoBadge';

export default OptionRowInfoBadge;
