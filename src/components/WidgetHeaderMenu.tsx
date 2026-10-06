import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import CONST from '@src/CONST';

import React from 'react';

import type {PopoverMenuItem} from './PopoverMenu';

import ThreeDotsMenu from './ThreeDotsMenu';

const ANCHOR_ALIGNMENT = {
    horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT,
    vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
} as const;

type WidgetHeaderMenuProps = {
    /** Items shown in the popover opened by the three-dots trigger */
    menuItems: PopoverMenuItem[];

    /** Size of the three-dots button */
    size?: typeof CONST.BUTTON_SIZE.SMALL | typeof CONST.BUTTON_SIZE.MEDIUM;

    testID?: string;
    sentryLabel?: string;
};

/**
 * Widget header three-dots menu: a Ghost trigger whose negative margins let it overflow the header
 * rather than grow it, so every card header keeps the same height. Built on `ThreeDotsMenu`.
 */
function WidgetHeaderMenu({menuItems, size = CONST.BUTTON_SIZE.MEDIUM, testID, sentryLabel}: WidgetHeaderMenuProps) {
    const styles = useThemeStyles();
    const isSmall = size === CONST.BUTTON_SIZE.SMALL;
    const iconSize = isSmall ? variables.iconSizeExtraSmall : variables.iconSizeSmall;

    return (
        <ThreeDotsMenu
            menuItems={menuItems}
            shouldSelfPosition
            anchorAlignment={ANCHOR_ALIGNMENT}
            iconStyles={styles.getWidgetHeaderMenuButtonStyle(isSmall ? variables.componentSizeSmall : variables.componentSizeNormal)}
            iconHoverStyle={styles.widgetHeaderMenuButtonHovered}
            iconWidth={iconSize}
            iconHeight={iconSize}
            shouldChangeFillOnOpen={false}
            testID={testID}
            sentryLabel={sentryLabel}
        />
    );
}

export default WidgetHeaderMenu;
