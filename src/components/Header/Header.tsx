import useContentHeaderHeight from '@hooks/useContentHeaderHeight';
import useIsInLandscapeMode from '@hooks/useIsInLandscapeMode';
import useThemeStyles from '@hooks/useThemeStyles';

import type {ReactNode} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';

import {Keyboard, View} from 'react-native';

/** Bar-level configuration for the composed `<Header>` (content lives in the child blocks). */
type HeaderProps = {
    /** The composed content of the header: primitive blocks and the `Header.Right` zone. */
    children: ReactNode;

    /** Additional styles to add to the outer header bar. */
    style?: StyleProp<ViewStyle>;
};

/** Composed counterpart of `HeaderWithBackButton`. Content is composed from primitive blocks and the `Header.Right` zone (see the barrel for a full example). */
function Header({children, style}: HeaderProps) {
    const isInLandscapeMode = useIsInLandscapeMode();
    const {contentHeaderHeightStyle} = useContentHeaderHeight();
    const styles = useThemeStyles();

    return (
        <View
            style={[styles.headerBar, contentHeaderHeightStyle, style]}
            onTouchStart={isInLandscapeMode ? () => Keyboard.dismiss() : undefined}
        >
            <View style={[styles.dFlex, styles.flexRow, styles.alignItemsCenter, styles.flexGrow1, styles.justifyContentBetween, styles.overflowHidden, styles.mr3]}>{children}</View>
        </View>
    );
}

export default Header;
