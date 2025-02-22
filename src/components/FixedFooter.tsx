import type {ReactNode} from 'react';
import React from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import useStyledSafeAreaInsets from '@hooks/useStyledSafeAreaInsets';
import useThemeStyles from '@hooks/useThemeStyles';

type FixedFooterProps = {
    /** Children to wrap in FixedFooter. */
    children: ReactNode;

    /** Styles to be assigned to Container */
    style?: StyleProp<ViewStyle>;

    /**
     * If enabled, the content will have a bottom padding equal to account for the safe bottom area inset.
     */
    addBottomSafeAreaPadding?: boolean;
};

function FixedFooter({style, children, addBottomSafeAreaPadding = false}: FixedFooterProps) {
    const styles = useThemeStyles();
    const {paddingBottom} = useStyledSafeAreaInsets(true);

    if (!children) {
        return null;
    }

    return <View style={[styles.ph5, addBottomSafeAreaPadding ? {paddingBottom: styles.pb5.paddingBottom + paddingBottom} : styles.pb5, styles.flexShrink0, style]}>{children}</View>;
}

FixedFooter.displayName = 'FixedFooter';

export default FixedFooter;
