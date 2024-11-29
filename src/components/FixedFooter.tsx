import type {ReactNode} from 'react';
import React from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import useEdgeSpacing from '@hooks/useEdgeSpacing';
import useSafeAreaInsets from '@hooks/useSafeAreaInsets';
import useThemeStyles from '@hooks/useThemeStyles';

type FixedFooterProps = {
    /** Children to wrap in FixedFooter. */
    children: ReactNode;

    /** Styles to be assigned to Container */
    style?: StyleProp<ViewStyle>;
};

// ScreenWrapper (Web: 0, Mobile: 24/variable)
//  Component (All platforms: bottomPadding: 20) ?

function FixedFooter({style, children}: FixedFooterProps) {
    // const insets = useSafeAreaInsets();
    const {bottom} = useEdgeSpacing();
    const styles = useThemeStyles();

    if (!children) {
        return null;
    }

    // const shouldAddBottomPadding = !insets.bottom;

    return <View style={[styles.ph5, styles.pb5, styles.flexShrink0, style]}>{children}</View>;
}

FixedFooter.displayName = 'FixedFooter';

export default FixedFooter;
