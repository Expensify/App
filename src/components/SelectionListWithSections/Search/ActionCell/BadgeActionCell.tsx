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

    return (
        <View
            style={[StyleUtils.getHeight(variables.h20), styles.justifyContentCenter, shouldDisablePointerEvents && styles.pointerEventsNone]}
            accessible={!shouldDisablePointerEvents}
            accessibilityState={{disabled: shouldDisablePointerEvents}}
        >
            <Badge
                text={text}
                icon={action === CONST.SEARCH.ACTION_TYPES.DONE ? expensifyIcons.Checkbox : expensifyIcons.Checkmark}
                badgeStyles={[
                    styles.ml0,
                    styles.ph2,
                    styles.gap1,
                    isLargeScreenWidth ? styles.alignSelfCenter : styles.alignSelfEnd,
                    StyleUtils.getHeight(variables.h20),
                    StyleUtils.getMinimumHeight(variables.h20),
                    isSelected ? StyleUtils.getBorderColorStyle(theme.buttonHoveredBG) : StyleUtils.getBorderColorStyle(theme.border),
                ]}
                textStyles={StyleUtils.getFontSizeStyle(extraSmall ? variables.fontSizeExtraSmall : variables.fontSizeSmall)}
                iconStyles={styles.mr0}
                success
                shouldUseXXSmallIcon={extraSmall}
            />
        </View>
    );
}

export type {BadgeActionCellProps};
export default BadgeActionCell;
