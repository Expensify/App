import {VERTICAL_BAR_EDGE, WindowBarsNitroModule} from '@expensify/nitro-utils';
import {useSyncExternalStore} from 'react';

const subscribe = (onChange: () => void) => WindowBarsNitroModule.addChangeListener(onChange);

const getHasVerticalBar = () => WindowBarsNitroModule.verticalBarEdge !== VERTICAL_BAR_EDGE.UNSPECIFIED;

/**
 * Whether the window has a vertical bar: the column a foldable iPhone gives the status bar, the tab bar and the bar items
 * along a side edge, folded or open in landscape, whenever the window's trait collection names an edge for it. Its width
 * is the side safe area inset of that edge.
 */
function useHasVerticalBar(): boolean {
    return useSyncExternalStore(subscribe, getHasVerticalBar, getHasVerticalBar);
}

export default useHasVerticalBar;
