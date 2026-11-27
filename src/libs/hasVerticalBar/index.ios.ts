import {VERTICAL_BAR_EDGE, WindowBarsNitroModule} from '@expensify/nitro-utils';

/**
 * Whether the window has a vertical bar: the column a foldable iPhone gives the status bar and bar items along a side
 * edge, folded or open in landscape. Its width is the side safe area inset of that edge.
 */
function hasVerticalBar(): boolean {
    return WindowBarsNitroModule.verticalBarEdge !== VERTICAL_BAR_EDGE.UNSPECIFIED;
}

export default hasVerticalBar;
