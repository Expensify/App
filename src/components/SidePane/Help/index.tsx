import React from 'react';
import useKeyboardShortcut from '@hooks/useKeyboardShortcut';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSidePane from '@hooks/useSidePane';
import CONST from '@src/CONST';
import HelpContent from './HelpContent';

function Help() {
    const {isExtraLargeScreenWidth} = useResponsiveLayout();
    const {closeSidePane} = useSidePane();

    useKeyboardShortcut(CONST.KEYBOARD_SHORTCUTS.ESCAPE, () => closeSidePane(), {isActive: !isExtraLargeScreenWidth});

    return <HelpContent />;
}

Help.displayName = 'Help';

export default Help;
