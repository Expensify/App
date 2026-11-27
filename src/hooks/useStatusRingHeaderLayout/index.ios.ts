import useContentHeaderHeight from '@hooks/useContentHeaderHeight';
import useSafeAreaInsets from '@hooks/useSafeAreaInsets';

import isTablet from '@libs/isTablet';

import type {TopBarRegion} from '@expensify/nitro-utils';

import {WindowBarsNitroModule} from '@expensify/nitro-utils';
import {useSyncExternalStore} from 'react';

import type StatusRingHeaderLayout from './types';

/**
 * On a foldable iPhone's inner panel in portrait (the iPhone Duo), the clock and Wi-Fi ring sit in the top-right corner
 * of a tall top inset, while folded or in landscape they sit on a side edge. The safe area reports that inset as one
 * full-width band, so without this a screen's header sits below an empty band. UIKit's bar layout region tells where its
 * own navigation bars go in that band, and this tells where a header goes there too.
 */

// iPad apps in a window put the window controls in the top inset, where headers are not tested, so they stay below it.
const isTabletDevice = isTablet();

let lastRegion: TopBarRegion | undefined;

/** The native getter builds a new object on every read, while useSyncExternalStore needs the same object back until the region changes. */
function getTopBarRegion(): TopBarRegion | undefined {
    const region = WindowBarsNitroModule.topBarRegion;
    const hasRegionChanged = region?.top !== lastRegion?.top || region?.height !== lastRegion?.height || region?.left !== lastRegion?.left || region?.right !== lastRegion?.right;
    if (hasRegionChanged) {
        lastRegion = region;
    }
    return lastRegion;
}

const subscribe = (onChange: () => void) => WindowBarsNitroModule.addChangeListener(onChange);

function useStatusRingHeaderLayout(): StatusRingHeaderLayout | undefined {
    const insets = useSafeAreaInsets();
    const {contentHeaderHeight} = useContentHeaderHeight();
    const region = useSyncExternalStore(subscribe, getTopBarRegion, getTopBarRegion);

    if (isTabletDevice || !region) {
        return undefined;
    }

    // Centers the header's row where UIKit centers the content of its own bars.
    const topOffset = Math.max(0, region.top + (region.height - contentHeaderHeight) / 2);

    // A row that would start at or below the bottom of the inset gains no room from moving into it, so the header stays below it.
    if (insets.top <= topOffset) {
        return undefined;
    }

    const bottomOffset = Math.max(0, insets.top - topOffset - contentHeaderHeight);

    return {
        topOffset,
        bottomOffset,
        left: region.left,
        right: region.right,
        height: topOffset + contentHeaderHeight + bottomOffset,
    };
}

export default useStatusRingHeaderLayout;
