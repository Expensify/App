import type {ReactNode} from 'react';
import React from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import useSafeAreaInsets from '@hooks/useSafeAreaInsets';
import useThemeStyles from '@hooks/useThemeStyles';

type FixedFooterProps = {
    /** Children to wrap in FixedFooter. */
    children: ReactNode;

    /** Styles to be assigned to Container */
    style?: StyleProp<ViewStyle>;
};

function FixedFooter({style, children}: FixedFooterProps) {
    const insets = useSafeAreaInsets();
    const styles = useThemeStyles();

    if (!children) {
        return null;
    }

    return <View style={[styles.ph5, {paddingBottom: insets.bottom}, styles.flexShrink0, style]}>{children}</View>;
}

FixedFooter.displayName = 'FixedFooter';

export default FixedFooter;
