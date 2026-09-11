import type {NavigationLayoutMode} from '@libs/Navigation/PlatformStackNavigation/types';

import variables from '@styles/variables';

import type {EdgeInsets} from 'react-native-safe-area-context';

type WindowLayoutMetrics = {
    width: number;
    height: number;
    safeAreaInsets: EdgeInsets;
};

type WindowLayoutPolicyOptions = {
    forceNarrowInLandscape: boolean;
    includeNavigationRail: boolean;
    isEnabled?: boolean;
};

type WindowLayoutPolicy = {
    mode: NavigationLayoutMode;
    safeAreaInsets: EdgeInsets;
    availableRect: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    navigationRailWidth: number;
    lhnWidth: number;
    centralWidth: number;
};

function getNavigationLayoutPolicy(metrics: WindowLayoutMetrics, options: WindowLayoutPolicyOptions): WindowLayoutPolicy {
    const {width, height, safeAreaInsets} = metrics;
    const availableWidth = Math.max(0, width - safeAreaInsets.left - safeAreaInsets.right);
    const availableHeight = Math.max(0, height - safeAreaInsets.top - safeAreaInsets.bottom);
    const requiredNavigationRailWidth = options.includeNavigationRail ? variables.navigationTabBarSize : 0;
    const requiredWideWidth = requiredNavigationRailWidth + variables.sideBarWithLHBWidth + variables.navigationCentralPaneMinWidth;
    const isLandscape = width > height;
    const mode = options.isEnabled !== false && availableWidth >= requiredWideWidth && !(options.forceNarrowInLandscape && isLandscape) ? 'wide' : 'narrow';
    const navigationRailWidth = mode === 'wide' ? requiredNavigationRailWidth : 0;

    return {
        mode,
        safeAreaInsets,
        availableRect: {
            x: safeAreaInsets.left,
            y: safeAreaInsets.top,
            width: availableWidth,
            height: availableHeight,
        },
        navigationRailWidth,
        lhnWidth: mode === 'wide' ? variables.sideBarWithLHBWidth : 0,
        centralWidth: mode === 'wide' ? availableWidth - navigationRailWidth - variables.sideBarWithLHBWidth : availableWidth,
    };
}

export default getNavigationLayoutPolicy;
export type {WindowLayoutMetrics, WindowLayoutPolicy, WindowLayoutPolicyOptions};
