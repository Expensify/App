import type {AnchorPosition} from '@styles/index';
import variables from '@styles/variables';
import {useSidePaneDisplayStatus} from './useSidePane';
import useWindowDimensions from './useWindowDimensions';

/**
 * Hook that calculates the anchor position for the three dots menu
 * based on the current screen width and the visibility of a side pane.
 */
function useThreeDotsAnchorPosition(anchorPositionStyle: (screenWidth: number) => AnchorPosition) {
    const {windowWidth} = useWindowDimensions();
    const {shouldHideSidePane} = useSidePaneDisplayStatus();

    return anchorPositionStyle(shouldHideSidePane ? windowWidth : windowWidth - variables.sideBarWidth);
}

export default useThreeDotsAnchorPosition;
