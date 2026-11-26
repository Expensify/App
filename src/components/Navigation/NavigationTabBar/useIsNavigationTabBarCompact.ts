import variables from '@styles/variables';

import type {LayoutChangeEvent} from 'react-native';

import {useState} from 'react';

/**
 * Tells whether the wide-layout tab bar should switch to its shorter rows, because the full-height rows don't fit above
 * the floating buttons, e.g. on an unfolded foldable phone in landscape. Pass `updateTabListHeight` to the tab list's ScrollView `onLayout`.
 */
function useIsNavigationTabBarCompact(rowCount: number) {
    const [tabListHeight, setTabListHeight] = useState(0);
    // Every row has the same fixed height, so the full height is known up front. The content can't be measured instead,
    // because it stretches to fill the tab list whenever the rows fit, which hides their real height.
    const isCompact = tabListHeight > 0 && tabListHeight < rowCount * variables.navigationTabBarSize;

    const updateTabListHeight = (event: LayoutChangeEvent) => setTabListHeight(event.nativeEvent.layout.height);

    return {isCompact, updateTabListHeight};
}

export default useIsNavigationTabBarCompact;
