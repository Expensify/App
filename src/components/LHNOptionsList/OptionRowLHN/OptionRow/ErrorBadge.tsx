import React from 'react';
import {View} from 'react-native';
import Badge from '@components/Badge';
import Icon from '@components/Icon';
import getActionBadgeText from '@components/utils/getActionBadgeText';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import type {OptionData} from '@libs/ReportUtils';
import CONST from '@src/CONST';

type ErrorBadgeProps = {
    /** Brick road indicator for the row. The badge only renders when this equals ERROR (RBR). */
    brickRoadIndicator: OptionData['brickRoadIndicator'];

    /** Action badge key used to derive the badge label. */
    actionBadge: OptionData['actionBadge'];

    /** Whether to show the "Mark as Done" state for this row. */
    isMarkAsDone?: boolean;
};

function ErrorBadge({brickRoadIndicator, actionBadge, isMarkAsDone}: ErrorBadgeProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {DotIndicator} = useMemoizedLazyExpensifyIcons(['DotIndicator']);

    if (brickRoadIndicator !== CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR) {
        return null;
    }

    const actionBadgeText = getActionBadgeText(actionBadge, translate, isMarkAsDone);

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
