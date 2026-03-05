import React from 'react';
import {View} from 'react-native';
import Badge from '@components/Badge';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import type {SearchTransactionAction} from '@src/types/onyx/SearchResults';
import actionTranslationsMap from './actionTranslationsMap';

type BadgeActionCellProps = {
    action: SearchTransactionAction;
    isLargeScreenWidth: boolean;
    shouldDisablePointerEvents?: boolean;
};

function BadgeActionCell({action, isLargeScreenWidth, shouldDisablePointerEvents}: BadgeActionCellProps) {
    const {translate} = useLocalize();
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const text = translate(actionTranslationsMap[action]);

    const badgeTheme = action === CONST.SEARCH.ACTION_TYPES.PAID ? theme.reportStatusBadge.paid : theme.reportStatusBadge.approved;

    return (
        <View
            style={[StyleUtils.getHeight(variables.h20), styles.justifyContentCenter, shouldDisablePointerEvents && styles.pointerEventsNone]}
            accessible={!shouldDisablePointerEvents}
            accessibilityState={{disabled: shouldDisablePointerEvents}}
        >
            <Badge
                text={text}
                isCondensed
                badgeStyles={[
                    styles.ml0,
                    styles.borderNone,
                    isLargeScreenWidth ? styles.alignSelfCenter : styles.alignSelfEnd,
                    StyleUtils.getBackgroundColorStyle(badgeTheme.backgroundColor),
                ]}
                textStyles={StyleUtils.getColorStyle(badgeTheme.textColor)}
            />
        </View>
    );
}

export type {BadgeActionCellProps};
export default BadgeActionCell;
