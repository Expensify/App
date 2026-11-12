import PaneResizeHandle from '@components/ResizeHandle/PaneResizeHandle';

import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSidePanelState from '@hooks/useSidePanelState';
import useThemeStyles from '@hooks/useThemeStyles';

import {sidePanelWidthVariable} from '@libs/Navigation/helpers/sidePanelWidth';

import variables from '@styles/variables';

import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';

/** Drags the side panel's left edge. A child of the panel, so it slides in and out with it. Only shown on a wide layout, where the panel isn't full-screen. */
function SidePanelResizeHandle() {
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {sidePanelWidth, sidePanelWidthBounds, isSidePanelResizable} = useSidePanelState();

    if (!isSidePanelResizable || shouldUseNarrowLayout) {
        return null;
    }

    return (
        <PaneResizeHandle
            onyxKey={ONYXKEYS.SIDE_PANEL_WIDTH}
            width={sidePanelWidth}
            bounds={sidePanelWidthBounds}
            defaultWidth={variables.resizableSidePanelDefaultWidth}
            liveWidth={sidePanelWidthVariable}
            style={styles.sidePanelResizeHandle}
        />
    );
}

export default SidePanelResizeHandle;
