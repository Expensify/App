import variables from '@styles/variables';

import {Dimensions} from 'react-native';

/**
 * Returns true when the window is wider than the side-panel breakpoint (1300px).
 * Side panel is docked on extra-large screens and shown as RHP below that width.
 */
export default function getIsExtraLargeScreenWidth(windowWidth = Dimensions.get('window').width) {
    return windowWidth > variables.sidePanelResponsiveWidthBreakpoint;
}
