import {useMenuItemAccessibilityLabel} from '@components/MenuItem/MenuItemAccessibilityContext';
import {useMenuItemConfig} from '@components/MenuItem/MenuItemContext';
import Text from '@components/Text';

import useThemeStyles from '@hooks/useThemeStyles';

import convertToLTR from '@libs/convertToLTR';

import CONST from '@src/CONST';

import type {ReactElement} from 'react';

import React from 'react';

type MenuItemTitleProps =
    | {
          /** Text to render as the title */
          children: string | number;

          accessibilityLabel?: never;
      }
    | {
          /** Element to render in place of plain text, e.g. a `DisplayNames` with per-name tooltips */
          children: ReactElement;

          accessibilityLabel: string;
      };

/** The title block of a `MenuItem.Content`. Bold, single line */
function MenuItemTitle({children, accessibilityLabel}: MenuItemTitleProps) {
    const styles = useThemeStyles();
    const {isDisabled, isInteractive} = useMenuItemConfig();

    useMenuItemAccessibilityLabel('title', accessibilityLabel ?? String(children));

    return (
        <Text
            style={[styles.flexShrink1, styles.popoverMenuText, styles.textStrong, styles.pre, isInteractive && isDisabled && styles.userSelectNone, styles.ltr, styles.mw100]}
            numberOfLines={1}
            dataSet={{[CONST.SELECTION_SCRAPER_HIDDEN_ELEMENT]: isInteractive && isDisabled}}
        >
            {typeof children === 'string' ? convertToLTR(children) : children}
        </Text>
    );
}

export default MenuItemTitle;
