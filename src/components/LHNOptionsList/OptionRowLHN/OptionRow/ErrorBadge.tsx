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

type ErrorBadgeProps = {
    brickRoadIndicator: OptionData['brickRoadIndicator'];
    actionBadge: OptionData['actionBadge'];
};

function ErrorBadge({brickRoadIndicator, actionBadge}: ErrorBadgeProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {isProduction} = useEnvironment();
    const {DotIndicator} = useMemoizedLazyExpensifyIcons(['DotIndicator']);

    if (brickRoadIndicator !== CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR) {
        return null;
    }

    const actionBadgeText = !isProduction && actionBadge ? translate(`common.actionBadge.${actionBadge}`) : '';

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

ErrorBadge.displayName = 'OptionRow.ErrorBadge';

export default ErrorBadge;
