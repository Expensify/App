import type {PopoverMenuItem} from '@components/PopoverMenu';
import ThreeDotsMenu from '@components/ThreeDotsMenu';

import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import CONST from '@src/CONST';

import React from 'react';

const ANCHOR_ALIGNMENT = {
    horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT,
    vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
} as const;

type WidgetHeaderMenuProps = {
    /** Items shown in the popover opened by the three-dots trigger */
    menuItems: PopoverMenuItem[];

    /** Test ID for the trigger */
    testID?: string;

    /** Sentry label for the trigger */
    sentryLabel?: string;
};

/**
 * Widget header three-dots menu: a Medium Ghost trigger whose negative margins let it overflow the header
 * rather than grow it, so every card header keeps the same height. Built on `ThreeDotsMenu`.
 */
function WidgetHeaderMenu({menuItems, testID, sentryLabel}: WidgetHeaderMenuProps) {
    const styles = useThemeStyles();

    return (
        <ThreeDotsMenu
            menuItems={menuItems}
            shouldSelfPosition
            anchorAlignment={ANCHOR_ALIGNMENT}
            iconStyles={[styles.widgetHeaderMenuButton, styles.widgetHeaderMenuButtonWrapper]}
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
