import MenuItemRoot from '@components/MenuItem/layout/MenuItemRoot';
import type {MenuItemRootProps} from '@components/MenuItem/layout/MenuItemRoot';

import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

import type {RefObject} from 'react';

import React from 'react';
import {View} from 'react-native';

type MenuItemSectionRowProps = MenuItemRootProps & {
    /** Ref to the bleed wrapper. Use it when a popover needs to anchor on the row. */
    ref?: RefObject<View | null>;
};

/** A `MenuItem.Root` that spans the full width of a `Section`, ignoring the section's own horizontal padding */
function MenuItemSectionRow({children, onPress, isDisabled = false, sentryLabel, testID, accessibilityLabel, ref}: MenuItemSectionRowProps) {
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    return (
        <View
            ref={ref}
            style={shouldUseNarrowLayout ? styles.mhn5 : styles.mhn8}
        >
            <MenuItemRoot
                onPress={onPress}
                isDisabled={isDisabled}
                sentryLabel={sentryLabel}
                testID={testID}
                accessibilityLabel={accessibilityLabel}
            >
                <View style={!shouldUseNarrowLayout && styles.ph3}>{children}</View>
            </MenuItemRoot>
        </View>
    );
}

export default MenuItemSectionRow;
