import variables from '@styles/variables';

import type {LayoutChangeEvent} from 'react-native';

import {useState} from 'react';

/**
 * Tells whether the wide-layout tab bar should switch to its shorter rows, because the full-height rows don't fit above
 * the floating buttons, e.g. on an unfolded foldable phone in landscape. Pass `onTabListLayout` to the tab list's ScrollView.
 */
function useIsNavigationTabBarCompact(rowCount: number) {
    const [viewportHeight, setViewportHeight] = useState(0);
    // Every row has the same fixed height, so the full height is known up front. The content can't be measured instead,
    // because it stretches to fill the tab list whenever the rows fit, which hides their real height.
    const isCompact = viewportHeight > 0 && viewportHeight < rowCount * variables.navigationTabBarSize;

    const onTabListLayout = (event: LayoutChangeEvent) => setViewportHeight(event.nativeEvent.layout.height);

    return {isCompact, onTabListLayout};
}

export default useIsNavigationTabBarCompact;
