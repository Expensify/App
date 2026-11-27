import {WindowBarsNitroModule, VERTICAL_BAR_EDGE} from '@expensify/nitro-utils';
import {useSyncExternalStore} from 'react';

const subscribe = (onChange: () => void) => WindowBarsNitroModule.addChangeListener(onChange);

const getIsTabBarVertical = () => WindowBarsNitroModule.verticalBarEdge !== VERTICAL_BAR_EDGE.UNSPECIFIED;

/**
 * Whether UIKit lays the tab bar out as a column: it does so inside the vertical bar, the side column a foldable iPhone
 * gives the status bar and bar items whenever the window's trait collection names an edge for it.
 */
function useIsTabBarVertical(): boolean {
    return useSyncExternalStore(subscribe, getIsTabBarVertical, getIsTabBarVertical);
}

export default useIsTabBarVertical;
