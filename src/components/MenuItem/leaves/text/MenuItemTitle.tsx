import {useMenuItemAccessibilityLabel} from '@components/MenuItem/MenuItemAccessibilityContext';
import {useMenuItemConfig} from '@components/MenuItem/MenuItemContext';
import Text from '@components/Text';

import useThemeStyles from '@hooks/useThemeStyles';

import convertToLTR from '@libs/convertToLTR';

import CONST from '@src/CONST';

import type {ReactElement} from 'react';
import type {ValueOf} from 'type-fest';

import React from 'react';

const MENU_ITEM_TITLE_VARIANT = {
    /** Bold, for a title that carries the row on its own — a navigation destination, a menu action, an entity name */
    STRONG: 'strong',

    /** Regular weight, for a value the user picked, sitting under the description naming its field */
    BASIC: 'basic',
} as const;

type MenuItemTitleVariant = ValueOf<typeof MENU_ITEM_TITLE_VARIANT>;

type MenuItemTitleProps = {
    /**
     * Typography variant. `strong` (default) is the bold look; `basic` drops back to regular weight —
     * use it on field rows, where the bold text is the description above rather than the title itself.
     */
    variant?: MenuItemTitleVariant;
} & (
    | {
          /** Text to render as the title */
          children: string | number;

          accessibilityLabel?: never;
      }
    | {
          /** Element to render in place of plain text, e.g. a `DisplayNames` with per-name tooltips */
          children: ReactElement;

          accessibilityLabel: string;
      }
);

/** The title block of a `MenuItem.Content`. Single line */
function MenuItemTitle({children, accessibilityLabel, variant = MENU_ITEM_TITLE_VARIANT.STRONG}: MenuItemTitleProps) {
    const styles = useThemeStyles();
    const {isDisabled, isInteractive} = useMenuItemConfig();

    useMenuItemAccessibilityLabel('title', accessibilityLabel ?? String(children));

    /** Typography applied on top of the shared title base, keyed by variant */
    const variantStyles = {
        [MENU_ITEM_TITLE_VARIANT.STRONG]: styles.textStrong,
        [MENU_ITEM_TITLE_VARIANT.BASIC]: undefined,
    };

    return (
        <Text
            style={[styles.flexShrink1, styles.popoverMenuText, variantStyles[variant], styles.pre, isInteractive && isDisabled && styles.userSelectNone, styles.ltr, styles.mw100]}
            numberOfLines={1}
            dataSet={{[CONST.SELECTION_SCRAPER_HIDDEN_ELEMENT]: isInteractive && isDisabled}}
        >
            {typeof children === 'string' ? convertToLTR(children) : children}
        </Text>
    );
}

export default MenuItemTitle;
export {MENU_ITEM_TITLE_VARIANT};
