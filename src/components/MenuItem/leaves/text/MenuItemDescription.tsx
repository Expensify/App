import Text from '@components/Text';

import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import type {ReactNode} from 'react';
import type {StyleProp, TextStyle} from 'react-native';

import React from 'react';

type MenuItemDescriptionVariant = (typeof CONST.MENU_ITEM.DESCRIPTION_VARIANT)[keyof typeof CONST.MENU_ITEM.DESCRIPTION_VARIANT];

type MenuItemDescriptionProps = {
    /** The description text */
    children?: ReactNode;

    /** Used to truncate the description with an ellipsis after computing the text layout */
    numberOfLines?: number;

    /** Typography variant. `supporting` (default) is the small label look; `prominent` bumps the font
     * to the normal size — use it for description-only rows (no title), matching the classic MenuItem. */
    variant?: MenuItemDescriptionVariant;

    /** Any additional styles to apply to the description */
    style?: StyleProp<TextStyle>;
};

/**
 * The supporting text block of a `MenuItem.Content`. Place it before or after `MenuItem.Title`
 * to render the description above or below the title.
 */
function MenuItemDescription({children, numberOfLines = 2, variant = CONST.MENU_ITEM.DESCRIPTION_VARIANT.SUPPORTING, style}: MenuItemDescriptionProps) {
    const styles = useThemeStyles();

    return (
        <Text
            style={[
                styles.textLabelSupporting,
                styles.textLineHeightNormal,
                styles.breakWord,
                variant === CONST.MENU_ITEM.DESCRIPTION_VARIANT.PROMINENT && styles.textSupportingNormal,
                style,
            ]}
            numberOfLines={numberOfLines}
        >
            {children}
        </Text>
    );
}

MenuItemDescription.displayName = 'MenuItemDescription';

export type {MenuItemDescriptionProps, MenuItemDescriptionVariant};
export default MenuItemDescription;
