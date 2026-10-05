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

    /** Whether to render the 28px Small Ghost trigger instead of the 40px Medium Ghost one */
    isSmall?: boolean;

    testID?: string;
    sentryLabel?: string;
};

/**
 * Widget header three-dots menu: a Ghost trigger whose negative margins let it overflow the header
 * rather than grow it, so every card header keeps the same height. Built on `ThreeDotsMenu`.
 */
function WidgetHeaderMenu({menuItems, isSmall = false, testID, sentryLabel}: WidgetHeaderMenuProps) {
    const styles = useThemeStyles();

    return (
        <ThreeDotsMenu
            menuItems={menuItems}
            shouldSelfPosition
            anchorAlignment={ANCHOR_ALIGNMENT}
            iconStyles={isSmall ? [styles.widgetHeaderMenuButtonSmall, styles.widgetHeaderMenuButtonSmallWrapper] : [styles.widgetHeaderMenuButton, styles.widgetHeaderMenuButtonWrapper]}
            iconHoverStyle={styles.widgetHeaderMenuButtonHovered}
            iconWidth={variables.iconSizeSmall}
            iconHeight={variables.iconSizeSmall}
            shouldChangeFillOnOpen={false}
            testID={testID}
            sentryLabel={sentryLabel}
        />
    );
}

export default WidgetHeaderMenu;
