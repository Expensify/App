import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import CONST from '@src/CONST';

import type {StyleProp, ViewStyle} from 'react-native';

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

    /** Styles for the trigger button, replacing its default size and margins */
    iconStyles?: StyleProp<ViewStyle>;

    /** Width and height of the three-dots icon */
    iconSize?: number;

    testID?: string;
    sentryLabel?: string;
};

/**
 * Widget header three-dots menu: a Ghost trigger whose negative margins let it overflow the header
 * rather than grow it, so every card header keeps the same height. Built on `ThreeDotsMenu`.
 */
function WidgetHeaderMenu({menuItems, iconStyles, iconSize = variables.iconSizeSmall, testID, sentryLabel}: WidgetHeaderMenuProps) {
    const styles = useThemeStyles();

    return (
        <ThreeDotsMenu
            menuItems={menuItems}
            shouldSelfPosition
            anchorAlignment={ANCHOR_ALIGNMENT}
            iconStyles={iconStyles ?? [styles.widgetHeaderMenuButton, styles.widgetHeaderMenuButtonWrapper]}
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
