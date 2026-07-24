import {useMenuItemState} from '@components/MenuItem/MenuItemContext';
import Text from '@components/Text';

import useThemeStyles from '@hooks/useThemeStyles';

import convertToLTR from '@libs/convertToLTR';

import CONST from '@src/CONST';

import type {PropsWithChildren} from 'react';
import type {StyleProp, TextStyle} from 'react-native';
import type {ValueOf} from 'type-fest';

import React from 'react';

type MenuItemTitleWeight = ValueOf<typeof CONST.MENU_ITEM.TITLE_WEIGHT>;

type MenuItemTitleProps = PropsWithChildren & {
    /** Used to truncate the text with an ellipsis after computing the text layout */
    numberOfLines?: number;

    /** Font weight. `strong` (default) is bold; `normal` uses the default weight. */
    weight?: MenuItemTitleWeight;

    /** Any additional styles to apply to the title */
    style?: StyleProp<TextStyle>;
};

/**
 * The title block of a `MenuItem.Content`. Bold by default, single line by default.
 */
function MenuItemTitle({children, numberOfLines = 1, weight = CONST.MENU_ITEM.TITLE_WEIGHT.STRONG, style}: MenuItemTitleProps) {
    const styles = useThemeStyles();
    const {isDisabled, isInteractive} = useMenuItemState();

    return (
        <Text
            style={[
                styles.flexShrink1,
                styles.popoverMenuText,
                weight === CONST.MENU_ITEM.TITLE_WEIGHT.STRONG && styles.textStrong,
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

export default MenuItemTitle;
