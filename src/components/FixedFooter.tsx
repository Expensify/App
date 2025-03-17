import type {ReactNode} from 'react';
import React, {useMemo} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import useSafeAreaPaddings from '@hooks/useSafeAreaPaddings';
import useThemeStyles from '@hooks/useThemeStyles';

type FixedFooterProps = {
    /** Children to wrap in FixedFooter. */
    children: ReactNode;

    /** Styles to be assigned to Container */
    style?: StyleProp<ViewStyle>;

    /** Whether to add bottom safe area padding to the content. */
    addBottomSafeAreaPadding?: boolean;

    /** Whether to stick the footer to the bottom of the screen. */
    shouldStickToBottom?: boolean;
};

function FixedFooter({style, children, addBottomSafeAreaPadding = false, shouldStickToBottom = false}: FixedFooterProps) {
    const styles = useThemeStyles();
    const {paddingBottom} = useSafeAreaPaddings(true);

    const footerStyle = useMemo<StyleProp<ViewStyle>>(() => {
        const totalPaddingBottom = styles.pb5.paddingBottom + paddingBottom;

        // If the footer should stick to the bottom, we use absolute positioning instead of flex.
        // In this case, we need to use style.bottom instead of style.paddingBottom.
        if (shouldStickToBottom) {
            return {position: 'absolute', left: 0, right: 0, bottom: addBottomSafeAreaPadding ? totalPaddingBottom : styles.pb5.paddingBottom};
        }

        // If the footer should not stick to the bottom, we use flex and add the safe area padding in styles.paddingBottom.
        if (addBottomSafeAreaPadding) {
            return {paddingBottom: totalPaddingBottom};
        }

        // Otherwise, we just use the default bottom padding.
        return styles.pb5;
    }, [addBottomSafeAreaPadding, paddingBottom, shouldStickToBottom, styles.pb5]);

    if (!children) {
        return null;
    }

    return <View style={[styles.ph5, styles.flexShrink0, footerStyle, style]}>{children}</View>;
}

FixedFooter.displayName = 'FixedFooter';

export default FixedFooter;
