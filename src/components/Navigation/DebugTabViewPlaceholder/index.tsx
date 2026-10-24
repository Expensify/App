import DebugTabView from '@components/Navigation/DebugTabView';

import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';

import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';

import type DebugTabViewPlaceholderProps from './types';

/**
 * On narrow web the Account and Inbox sidebars are fixed to the viewport, so unlike screens laid out in the tab scene,
 * they don't shrink when the debug banner is drawn above the tab bar. An invisible copy of the banner keeps its space,
 * at its real height and only while it shows, so the end of the list stays above the banner.
 */
function DebugTabViewPlaceholder({selectedTab}: DebugTabViewPlaceholderProps) {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const [isDebugModeEnabled] = useOnyx(ONYXKEYS.IS_DEBUG_MODE_ENABLED);

    if (!shouldUseNarrowLayout || !isDebugModeEnabled) {
        return null;
    }

    return (
        <DebugTabView
            selectedTab={selectedTab}
            isPlaceholder
        />
    );
}

export default DebugTabViewPlaceholder;
