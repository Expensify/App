import {useMenuItemAccessibilityLabel} from '@components/MenuItem/MenuItemAccessibilityContext';
import Text from '@components/Text';

import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import type {ThemeStyles} from '@styles/index';
import type {StyleUtilsType} from '@styles/utils';
import variables from '@styles/variables';

import CONST from '@src/CONST';

import type {StyleProp, TextStyle} from 'react-native';
import type {ValueOf} from 'type-fest';

import React from 'react';

type MenuItemDescriptionVariant = ValueOf<typeof CONST.MENU_ITEM.DESCRIPTION_VARIANT>;

type MenuItemDescriptionVariantStyles = Record<MenuItemDescriptionVariant, StyleProp<TextStyle>>;

/** Typography applied on top of the shared supporting-label base, keyed by variant */
function getDescriptionVariantStyles(styles: ThemeStyles, StyleUtils: StyleUtilsType): MenuItemDescriptionVariantStyles {
    return {
        [CONST.MENU_ITEM.DESCRIPTION_VARIANT.SUPPORTING]: styles.textLineHeightNormal,
        [CONST.MENU_ITEM.DESCRIPTION_VARIANT.PROMINENT]: [StyleUtils.getFontSizeStyle(variables.fontSizeNormal), StyleUtils.getLineHeightStyle(variables.fontSizeNormalHeight)],
    };
}

type MenuItemDescriptionProps = {
    /** Text to render as the description */
    children: string | number;

    /** Maximum number of lines to render before the text is truncated */
    numberOfLines?: number;

    /**
     * Typography variant. `supporting` (default) is the small label look; `prominent` bumps the font
     * to the normal size — use it for description-only rows (no title).
     */
    variant?: MenuItemDescriptionVariant;
};

/** The supporting text block of a `MenuItem.Content` */
function MenuItemDescription({children, numberOfLines = 2, variant = CONST.MENU_ITEM.DESCRIPTION_VARIANT.SUPPORTING}: MenuItemDescriptionProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();

    useMenuItemAccessibilityLabel('description', String(children));

    const variantStyles = getDescriptionVariantStyles(styles, StyleUtils);

    return (
        <Text
            style={[styles.textLabelSupporting, variantStyles[variant], styles.breakWord]}
            numberOfLines={numberOfLines}
        >
            {children}
        </Text>
    );
}

export default MenuItemDescription;
