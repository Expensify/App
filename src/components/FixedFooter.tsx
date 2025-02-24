import type {ReactNode} from 'react';
import React, {useMemo} from 'react';
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

    /**
     * Whether the footer should stick to the bottom of the screen.
     */
    shouldStickToBottom?: boolean;
};

function FixedFooter({style, children, addBottomSafeAreaPadding = false, shouldStickToBottom = false}: FixedFooterProps) {
    const styles = useThemeStyles();
    const {paddingBottom} = useStyledSafeAreaInsets(true);

    const footerStyle = useMemo<StyleProp<ViewStyle>>(() => {
        const totalPaddingBottom = styles.pb5.paddingBottom + paddingBottom;

        if (shouldStickToBottom) {
            return {position: 'absolute', left: 0, right: 0, bottom: totalPaddingBottom};
        }

        if (addBottomSafeAreaPadding) {
            return {paddingBottom: totalPaddingBottom};
        }

        return styles.pb5;
    }, [addBottomSafeAreaPadding, paddingBottom, shouldStickToBottom, styles.pb5]);

    if (!children) {
        return null;
    }

    return <View style={[styles.ph5, styles.flexShrink0, footerStyle, style]}>{children}</View>;
}

FixedFooter.displayName = 'FixedFooter';

export default FixedFooter;
