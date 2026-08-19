import useIsInLandscapeMode from '@hooks/useIsInLandscapeMode';
import useThemeStyles from '@hooks/useThemeStyles';

import React from 'react';
import {Keyboard, View} from 'react-native';

import type HeaderProps from './types';

import HeaderContext from './context';

/** Composed counterpart of `HeaderWithBackButton`. Content is composed from primitive blocks and the `Header.Right` zone (see the barrel for a full example). */
function Header({children, shouldUseHeadlineHeader = false, style}: HeaderProps) {
    const isInLandscapeMode = useIsInLandscapeMode();
    const styles = useThemeStyles();

    return (
        <View
            style={[styles.headerBar, shouldUseHeadlineHeader && styles.headerBarHeight, style]}
            onTouchStart={isInLandscapeMode ? () => Keyboard.dismiss() : undefined}
        >
            <View style={[styles.dFlex, styles.flexRow, styles.alignItemsCenter, styles.flexGrow1, styles.justifyContentBetween, styles.overflowHidden, styles.mr3]}>
                <HeaderContext.Provider
                    value={{
                        shouldUseHeadlineHeader,
                    }}
                >
                    {children}
                </HeaderContext.Provider>
            </View>
        </View>
    );
}

export default Header;
