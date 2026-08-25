import {useMenuItemAccessibilityLabel} from '@components/MenuItem/MenuItemAccessibilityContext';
import Text from '@components/Text';

import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import type {ValueOf} from 'type-fest';

import React from 'react';

const MENU_ITEM_DESCRIPTION_VARIANT = {
    /** The small supporting-label look, for a description that sits under a title */
    SUPPORTING: 'supporting',

    /** Normal-size text, for a description-only row */
    PLACEHOLDER: 'placeholder',
} as const;

type MenuItemDescriptionVariant = ValueOf<typeof MENU_ITEM_DESCRIPTION_VARIANT>;

type MenuItemDescriptionProps = {
    /** Text to render as the description */
    children: string | number;

    /** Maximum number of lines to render before the text is truncated */
    numberOfLines?: number;

    /** The visual variant of the description, which controls its font size and line height */
    variant?: MenuItemDescriptionVariant;
};

/** The supporting text block of a `MenuItem.Content` */
function MenuItemDescription({children, numberOfLines = 2, variant = MENU_ITEM_DESCRIPTION_VARIANT.SUPPORTING}: MenuItemDescriptionProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();

    useMenuItemAccessibilityLabel('description', String(children));

    /** Typography applied on top of the shared supporting-label base, keyed by variant */
    const variantStyles = {
        [MENU_ITEM_DESCRIPTION_VARIANT.SUPPORTING]: styles.textLineHeightNormal,
        [MENU_ITEM_DESCRIPTION_VARIANT.PLACEHOLDER]: [StyleUtils.getFontSizeStyle(variables.fontSizeNormal), StyleUtils.getLineHeightStyle(variables.fontSizeNormalHeight)],
    };

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
export {MENU_ITEM_DESCRIPTION_VARIANT};
