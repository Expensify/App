import type {MenuItemRootProps} from '@components/MenuItem/layout/MenuItemRoot';
import MenuItemRoot from '@components/MenuItem/layout/MenuItemRoot';
import Text from '@components/Text';

import useThemeStyles from '@hooks/useThemeStyles';

import {callFunctionIfActionIsAllowed} from '@userActions/Session';

import React from 'react';
import {View} from 'react-native';

type MenuItemWithLabelProps = MenuItemRootProps & {
    /** Text above the row, naming what the row holds */
    label: string;
};

/**
 * The labeled MenuItem preset — a `Root` with a label above it. The label sits outside `Root`, so
 * it stays out of the press target and does not pick up the row's hover background.
 */
function MenuItemWithLabel({label, onPress, isDisabled = false, sentryLabel, testID, accessibilityLabel, children}: MenuItemWithLabelProps) {
    const styles = useThemeStyles();

    return (
        <View>
            <View style={[styles.ph5, styles.pv1, isDisabled && styles.opacitySemiTransparent]}>
                <Text style={[styles.sidebarLinkText, styles.optionAlternateText, styles.textLabelSupporting, styles.pre]}>{label}</Text>
            </View>
            <MenuItemRoot
                onPress={onPress ? callFunctionIfActionIsAllowed(onPress) : undefined}
                isDisabled={isDisabled}
                sentryLabel={sentryLabel}
                testID={testID}
                accessibilityLabel={accessibilityLabel}
            >
                {children}
            </MenuItemRoot>
        </View>
    );
}

export default MenuItemWithLabel;
