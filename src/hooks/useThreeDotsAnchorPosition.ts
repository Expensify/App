import type {AnchorPosition} from '@styles/index';
import variables from '@styles/variables';
import {useSidePanelDisplayStatus} from './useSidePanel';
import useWindowDimensions from './useWindowDimensions';

/**
 * Hook that calculates the anchor position for the three dots menu
 * based on the current screen width and the visibility of a Side Panel.
 */
function useThreeDotsAnchorPosition(anchorPositionStyle: (screenWidth: number) => AnchorPosition) {
    const {windowWidth} = useWindowDimensions();
    const {shouldHideSidePanel} = useSidePanelDisplayStatus();

    return anchorPositionStyle(shouldHideSidePanel ? windowWidth : windowWidth - variables.sideBarWidth);
}

export default useThreeDotsAnchorPosition;
