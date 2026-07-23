import Text from '@components/Text';

import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import type {StyleProp, TextStyle} from 'react-native';

import React from 'react';

type MenuItemRightLabelVariant = (typeof CONST.MENU_ITEM.RIGHT_LABEL_VARIANT)[keyof typeof CONST.MENU_ITEM.RIGHT_LABEL_VARIANT];

type MenuItemRightLabelProps = {
    /** The label text. Numbers are allowed so that 0 renders too (e.g. counters). */
    children?: string | number;

    /** Style variant. `label` (default) is the classic `rightLabel` look; `subtitle` is the classic `subtitle` look. */
    variant?: MenuItemRightLabelVariant;

    /** Any additional styles to apply to the label */
    style?: StyleProp<TextStyle>;
};

/**
 * A right-aligned supporting text cell for `MenuItem.Trailing` — covers both the classic
 * `rightLabel` and `subtitle` use cases.
 */
function MenuItemRightLabel({children, variant = CONST.MENU_ITEM.RIGHT_LABEL_VARIANT.LABEL, style}: MenuItemRightLabelProps) {
    const styles = useThemeStyles();

    // Numbers must render too, so only bail out on undefined/null/empty string
    if (children === undefined || children === null || children === '') {
        return null;
    }

    return <Text style={[styles.rightLabelMenuItem, variant === CONST.MENU_ITEM.RIGHT_LABEL_VARIANT.SUBTITLE && styles.textLabelSupporting, style]}>{children}</Text>;
}

MenuItemRightLabel.displayName = 'MenuItemRightLabel';

export type {MenuItemRightLabelProps, MenuItemRightLabelVariant};
export default MenuItemRightLabel;
