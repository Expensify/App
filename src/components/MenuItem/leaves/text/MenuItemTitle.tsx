import {useMenuItemState} from '@components/MenuItem/MenuItemContext';
import Text from '@components/Text';

import useThemeStyles from '@hooks/useThemeStyles';

import convertToLTR from '@libs/convertToLTR';

import CONST from '@src/CONST';

import type {ReactNode} from 'react';
import type {StyleProp, TextStyle} from 'react-native';

import React from 'react';

type MenuItemTitleVariant = (typeof CONST.MENU_ITEM.TITLE_VARIANT)[keyof typeof CONST.MENU_ITEM.TITLE_VARIANT];

type MenuItemTitleProps = {
    /** The title text. Strings are converted to LTR; custom nodes are rendered as-is. */
    children?: ReactNode;

    /** Used to truncate the text with an ellipsis after computing the text layout */
    numberOfLines?: number;

    /** Font weight variant. `strong` (default) is bold; `normal` uses the default weight. */
    variant?: MenuItemTitleVariant;

    /** Any additional styles to apply to the title (e.g. pass a non-bold text style for a basic title) */
    style?: StyleProp<TextStyle>;
};

/**
 * The title block of a `MenuItem.Content`. Bold by default, single line by default.
 */
function MenuItemTitle({children, numberOfLines = 1, variant = CONST.MENU_ITEM.TITLE_VARIANT.STRONG, style}: MenuItemTitleProps) {
    const styles = useThemeStyles();
    const {isDisabled, isInteractive} = useMenuItemState();

    return (
        <Text
            style={[
                styles.flexShrink1,
                styles.popoverMenuText,
                variant === CONST.MENU_ITEM.TITLE_VARIANT.STRONG && styles.textStrong,
                numberOfLines !== 1 ? styles.preWrap : styles.pre,
                isInteractive && isDisabled && styles.userSelectNone,
                styles.ltr,
                styles.mw100,
                style,
            ]}
            numberOfLines={numberOfLines || undefined}
            dataSet={{[CONST.SELECTION_SCRAPER_HIDDEN_ELEMENT]: isInteractive && isDisabled}}
        >
            {typeof children === 'string' ? convertToLTR(children) : children}
        </Text>
    );
}

MenuItemTitle.displayName = 'MenuItemTitle';

export type {MenuItemTitleProps, MenuItemTitleVariant};
export default MenuItemTitle;
