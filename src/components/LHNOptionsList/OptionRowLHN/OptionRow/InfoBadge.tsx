import React from 'react';
import {View} from 'react-native';
import Badge from '@components/Badge';
import Icon from '@components/Icon';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import type {OptionData} from '@libs/ReportUtils';
import CONST from '@src/CONST';

type InfoBadgeProps = {
    /** Brick road indicator for the row. The badge only renders when this equals INFO. */
    brickRoadIndicator: OptionData['brickRoadIndicator'];

    /** Action badge key used to derive the badge label. */
    actionBadge: OptionData['actionBadge'];
};

function InfoBadge({brickRoadIndicator, actionBadge}: InfoBadgeProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {DotIndicator} = useMemoizedLazyExpensifyIcons(['DotIndicator']);

    if (brickRoadIndicator !== CONST.BRICK_ROAD_INDICATOR_STATUS.INFO) {
        return null;
    }

    const actionBadgeText = actionBadge ? translate(`common.actionBadge.${actionBadge}`) : '';

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

InfoBadge.displayName = 'OptionRow.InfoBadge';

export default InfoBadge;
