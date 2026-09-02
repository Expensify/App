import {useMenuItemAccessibilityLabel} from '@components/MenuItem/MenuItemAccessibilityContext';
import {useMenuItemConfig} from '@components/MenuItem/MenuItemContext';
import Text from '@components/Text';

import useThemeStyles from '@hooks/useThemeStyles';

import convertToLTR from '@libs/convertToLTR';

import CONST from '@src/CONST';

import type {StyleProp, TextStyle} from 'react-native';

import React from 'react';

import type MenuItemTitleProps from './types';

type BaseMenuItemTitleProps = MenuItemTitleProps & {
    /** Typography layered on top of the shared title base — each leaf brings its own weight and color */
    style?: StyleProp<TextStyle>;
};

/** Everything the title leaves have in common — the shared type face, LTR handling and label registration */
function BaseMenuItemTitle({children, accessibilityLabel, style}: BaseMenuItemTitleProps) {
    const styles = useThemeStyles();
    const {isDisabled, isInteractive} = useMenuItemConfig();

    useMenuItemAccessibilityLabel('title', accessibilityLabel ?? String(children));

    return (
        <Text
            style={[styles.flexShrink1, styles.popoverMenuText, styles.pre, isInteractive && isDisabled && styles.userSelectNone, styles.ltr, styles.mw100, style]}
            numberOfLines={1}
            dataSet={{[CONST.SELECTION_SCRAPER_HIDDEN_ELEMENT]: isInteractive && isDisabled}}
        >
            {typeof children === 'string' ? convertToLTR(children) : children}
        </Text>
    );
}

export default BaseMenuItemTitle;
