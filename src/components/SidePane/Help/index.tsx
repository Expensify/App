import React from 'react';
// eslint-disable-next-line no-restricted-imports
import {Animated} from 'react-native';
import useKeyboardShortcut from '@hooks/useKeyboardShortcut';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSafeAreaPaddings from '@hooks/useSafeAreaPaddings';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import HelpContent from './HelpContent';
import type HelpProps from './types';

function Help({sidePaneTranslateX, closeSidePane}: HelpProps) {
    const styles = useThemeStyles();
    const {isExtraLargeScreenWidth, shouldUseNarrowLayout} = useResponsiveLayout();
    const {paddingTop, paddingBottom} = useSafeAreaPaddings();

    useKeyboardShortcut(CONST.KEYBOARD_SHORTCUTS.ESCAPE, () => closeSidePane(), {isActive: !isExtraLargeScreenWidth});

    return <HelpContent />;
}

Help.displayName = 'Help';

export default Help;
