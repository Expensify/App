import useContentHeaderHeight from '@hooks/useContentHeaderHeight';
import useIsInLandscapeMode from '@hooks/useIsInLandscapeMode';
import useThemeStyles from '@hooks/useThemeStyles';

import {Keyboard, View} from 'react-native';

import type HeaderProps from './types';

/** Composed counterpart of `HeaderWithBackButton`. Content is composed from primitive blocks and the `Header.Right` zone (see the barrel for a full example). */
function Header({children, style}: HeaderProps) {
    const isInLandscapeMode = useIsInLandscapeMode();
    const {contentHeaderHeightStyle} = useContentHeaderHeight();
    const styles = useThemeStyles();

    return (
        // styles.borderBottom should be applied inline through styles instead of using shouldShowBorderBottom
        <View
            style={[styles.headerBar, contentHeaderHeightStyle, style]}
            onTouchStart={isInLandscapeMode ? () => Keyboard.dismiss() : undefined}
        >
            <View style={[styles.dFlex, styles.flexRow, styles.alignItemsCenter, styles.flexGrow1, styles.justifyContentBetween, styles.overflowHidden, styles.mr3]}>{children}</View>
        </View>
    );
}

export default Header;
