import React from 'react';
import {View} from 'react-native';
import Badge from '@components/Badge';
import Icon from '@components/Icon';
import useEnvironment from '@hooks/useEnvironment';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import type {OptionData} from '@libs/ReportUtils';
import CONST from '@src/CONST';

type OptionRowInfoBadgeProps = {
    brickRoadIndicator: OptionData['brickRoadIndicator'];
    actionBadge: OptionData['actionBadge'];
};

function OptionRowInfoBadge({brickRoadIndicator, actionBadge}: OptionRowInfoBadgeProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {isProduction} = useEnvironment();
    const {DotIndicator} = useMemoizedLazyExpensifyIcons(['DotIndicator']);

    if (brickRoadIndicator !== CONST.BRICK_ROAD_INDICATOR_STATUS.INFO) {
        return null;
    }

    const actionBadgeText = !isProduction && actionBadge ? translate(`common.actionBadge.${actionBadge}`) : '';

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
