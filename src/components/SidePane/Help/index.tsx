import React from 'react';
// eslint-disable-next-line no-restricted-imports
import {Animated} from 'react-native';
import useKeyboardShortcut from '@hooks/useKeyboardShortcut';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyledSafeAreaInsets from '@hooks/useStyledSafeAreaInsets';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import HelpContent from './HelpContent';
import type HelpProps from './types';

function Help({sidePaneTranslateX, closeSidePane}: HelpProps) {
    const styles = useThemeStyles();
    const {isExtraLargeScreenWidth, shouldUseNarrowLayout} = useResponsiveLayout();
    const {paddingTop, paddingBottom} = useStyledSafeAreaInsets();

    useKeyboardShortcut(CONST.KEYBOARD_SHORTCUTS.ESCAPE, () => closeSidePane(), {isActive: !isExtraLargeScreenWidth});

    return (
        <Animated.View style={[styles.sidePaneContainer(shouldUseNarrowLayout, isExtraLargeScreenWidth), {transform: [{translateX: sidePaneTranslateX.current}], paddingTop, paddingBottom}]}>
            <HelpContent />
        </Animated.View>
    );
}

Help.displayName = 'Help';

export default Help;
