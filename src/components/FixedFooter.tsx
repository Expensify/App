import type {ReactNode} from 'react';
import React, {useMemo} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import useBottomSafeSafeAreaPaddingStyle from '@hooks/useBottomSafeSafeAreaPaddingStyle';
import useThemeStyles from '@hooks/useThemeStyles';

type FixedFooterProps = {
    /** Children to wrap in FixedFooter. */
    children: ReactNode;

    /** Styles to be assigned to Container */
    style?: StyleProp<ViewStyle>;

    /** Whether to add bottom safe area padding to the content. */
    addBottomSafeAreaPadding?: boolean;

    /** Whether to add bottom safe area padding to the content. */
    addOfflineIndicatorBottomSafeAreaPadding?: boolean;

    /** Whether to stick the footer to the bottom of the screen. */
    shouldStickToBottom?: boolean;
};

function FixedFooter({style, children, addBottomSafeAreaPadding, addOfflineIndicatorBottomSafeAreaPadding, shouldStickToBottom = false}: FixedFooterProps) {
    const styles = useThemeStyles();

    const bottomSafeAreaPaddingStyle = useBottomSafeSafeAreaPaddingStyle({
        addBottomSafeAreaPadding,
        addOfflineIndicatorBottomSafeAreaPadding,
        additionalPaddingBottom: styles.pb5.paddingBottom,
        styleProperty: shouldStickToBottom ? 'bottom' : 'paddingBottom',
    });

    const footerStyle = useMemo<StyleProp<ViewStyle>>(
        () => [shouldStickToBottom && styles.stickToBottom, bottomSafeAreaPaddingStyle],
        [bottomSafeAreaPaddingStyle, shouldStickToBottom, styles.stickToBottom],
    );

    if (!children) {
        return null;
    }

    return <View style={[styles.ph5, styles.flexShrink0, footerStyle, style]}>{children}</View>;
}

export default FixedFooter;
