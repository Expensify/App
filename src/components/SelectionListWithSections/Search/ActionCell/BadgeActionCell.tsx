import React from 'react';
import {View} from 'react-native';
import Badge from '@components/Badge';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
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
    isSelected: boolean;
    extraSmall: boolean;
    shouldDisablePointerEvents?: boolean;
};

function BadgeActionCell({action, isLargeScreenWidth, isSelected, extraSmall, shouldDisablePointerEvents}: BadgeActionCellProps) {
    const {translate} = useLocalize();
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Checkmark', 'Checkbox']);
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
                icon={action === CONST.SEARCH.ACTION_TYPES.DONE ? expensifyIcons.Checkbox : expensifyIcons.Checkmark}
                badgeStyles={[
                    styles.ml0,
                    styles.gap1,
                    styles.borderNone,
                    isLargeScreenWidth ? styles.alignSelfCenter : styles.alignSelfEnd,
                    StyleUtils.getBackgroundColorStyle(badgeTheme.backgroundColor),
                ]}
                textStyles={StyleUtils.getColorStyle(badgeTheme.textColor)}
                iconStyles={styles.mr0}
                shouldUseXXSmallIcon={extraSmall}
            />
        </View>
    );
}

export type {BadgeActionCellProps};
export default BadgeActionCell;
