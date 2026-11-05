import PaneResizeHandle from '@components/ResizeHandle/PaneResizeHandle';

import useSidePanelWidth from '@hooks/useSidePanelWidth';
import useThemeStyles from '@hooks/useThemeStyles';

import {resetSidePanelWidth, setSidePanelWidth} from '@libs/actions/SidePanelWidth';
import {clearLiveSidePanelWidth, writeLiveSidePanelWidth} from '@libs/Navigation/helpers/sidePanelWidth';

import variables from '@styles/variables';

import React from 'react';

/** Drags the side panel's left edge. A child of the panel, so it slides in and out with it. */
function SidePanelResizeHandle() {
    const styles = useThemeStyles();
    const {width, min, max} = useSidePanelWidth();

    return (
        <PaneResizeHandle
            width={width}
            min={min}
            max={max}
            defaultWidth={variables.sidePanelWidth}
            writeLiveWidth={writeLiveSidePanelWidth}
            clearLiveWidth={clearLiveSidePanelWidth}
            onCommit={setSidePanelWidth}
            onReset={resetSidePanelWidth}
            style={styles.sidePanelResizeHandle}
        />
    );
}

export default SidePanelResizeHandle;
