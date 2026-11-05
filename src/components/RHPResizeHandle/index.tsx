import PaneResizeHandle from '@components/ResizeHandle/PaneResizeHandle';

import useSingleRHPWidth from '@hooks/useSingleRHPWidth';
import useThemeStyles from '@hooks/useThemeStyles';

import {singleRHPWidthVariable} from '@libs/Navigation/helpers/singleRHPWidth';

import variables from '@styles/variables';

import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';

/**
 * Drags the single RHP card's left edge. A sibling of the card rather than a child, because the card clips its overflow,
 * and rendered after the overlay so it wins hit-testing over the scrim that closes the RHP.
 */
function RHPResizeHandle() {
    const styles = useThemeStyles();
    const {width, bounds} = useSingleRHPWidth();

    return (
        <PaneResizeHandle
            onyxKey={ONYXKEYS.SINGLE_RHP_WIDTH}
            width={width}
            bounds={bounds}
            defaultWidth={variables.rhpWidth}
            liveWidth={singleRHPWidthVariable}
            style={styles.rhpResizeHandle(width)}
        />
    );
}

export default RHPResizeHandle;
