import PaneResizeHandle from '@components/ResizeHandle/PaneResizeHandle';

import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSidePanelState from '@hooks/useSidePanelState';
import useSingleRHPWidth from '@hooks/useSingleRHPWidth';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';

import {subscribeToLiveSidePanelWidth} from '@libs/Navigation/helpers/sidePanelWidth';
import {singleRHPWidthVariable} from '@libs/Navigation/helpers/singleRHPWidth';
import getSingleRHPWidthBounds from '@libs/Navigation/helpers/singleRHPWidth/getSingleRHPWidthBounds';

import variables from '@styles/variables';

import ONYXKEYS from '@src/ONYXKEYS';

import lodashClamp from 'lodash/clamp';
import React, {useEffect} from 'react';

import type RHPResizeHandleProps from './types';

/**
 * Drags the single RHP card's left edge. A sibling of the card rather than a child, because the card clips its overflow,
 * and rendered after the overlay so it wins hit-testing over the scrim that closes the RHP.
 */
function RHPResizeHandle({ref}: RHPResizeHandleProps) {
    const styles = useThemeStyles();
    const {width, bounds} = useSingleRHPWidth();
    const [storedWidth] = useOnyx(ONYXKEYS.SINGLE_RHP_WIDTH);
    const {windowWidth} = useWindowDimensions();
    const {isExtraLargeScreenWidth} = useResponsiveLayout();
    const {shouldHideSidePanel} = useSidePanelState();

    // Mirrors when SidePanelContextProvider shifts the RHP left by the panel's width.
    const isBesideDockedSidePanel = isExtraLargeScreenWidth && !shouldHideSidePanel;

    // A drag of a docked panel shifts the card left without rendering, so the card's width follows the drag too, or it slides off-screen until the drag ends.
    // The panel drops its live width in the commit that renders its saved width, which also re-clamps this card, so clearing here never snaps.
    useEffect(() => {
        if (!isBesideDockedSidePanel) {
            return;
        }

        return subscribeToLiveSidePanelWidth((liveSidePanelWidth) => {
            if (liveSidePanelWidth === undefined) {
                singleRHPWidthVariable.clear();
                return;
            }

            const {min, max} = getSingleRHPWidthBounds(windowWidth, liveSidePanelWidth);
            singleRHPWidthVariable.write(lodashClamp(storedWidth ?? variables.rhpWidth, min, max));
        });
    }, [isBesideDockedSidePanel, windowWidth, storedWidth]);

    return (
        <PaneResizeHandle
            onyxKey={ONYXKEYS.SINGLE_RHP_WIDTH}
            width={width}
            bounds={bounds}
            defaultWidth={variables.rhpWidth}
            liveWidth={singleRHPWidthVariable}
            style={styles.rhpResizeHandle(width)}
            ref={ref}
        />
    );
}

export default RHPResizeHandle;
