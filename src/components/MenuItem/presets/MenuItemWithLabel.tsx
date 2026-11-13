import type {MenuItemRootProps} from '@components/MenuItem/layout/MenuItemRoot';
import MenuItemRoot from '@components/MenuItem/layout/MenuItemRoot';
import MenuItemLabel from '@components/MenuItem/leaves/content/MenuItemLabel';

import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import {callIfAuthenticated} from '@userActions/Session';

import ONYXKEYS from '@src/ONYXKEYS';

import {authTokenTypeSelector} from '@selectors/Session';
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
    const [session] = useOnyx(ONYXKEYS.SESSION, {selector: authTokenTypeSelector});
    const styles = useThemeStyles();
    // Built in one object so TypeScript keeps sentryLabel tied to onPress, which MenuItemRoot requires together.
    const pressProps = onPress ? {onPress: callIfAuthenticated(onPress, session), sentryLabel} : {sentryLabel};

    return (
        <View>
            <View style={[styles.ph5, styles.pv1, isDisabled && styles.opacitySemiTransparent]}>
                <MenuItemLabel>{label}</MenuItemLabel>
            </View>
            <MenuItemRoot
                {...pressProps}
                isDisabled={isDisabled}
                testID={testID}
                accessibilityLabel={accessibilityLabel}
            >
                {children}
            </MenuItemRoot>
        </View>
    );
}

export default MenuItemWithLabel;
