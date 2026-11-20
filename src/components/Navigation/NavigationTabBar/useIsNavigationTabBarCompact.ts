import type {LayoutChangeEvent} from 'react-native';

import {useState} from 'react';

/**
 * Tells whether the wide-layout tab bar should switch to its shorter rows, because the full-height rows don't fit above
 * the floating buttons, e.g. on an unfolded foldable phone in landscape. Spread `scrollViewProps` on the tab list's ScrollView.
 */
function useIsNavigationTabBarCompact() {
    const [viewportHeight, setViewportHeight] = useState(0);
    // The shorter rows change the content height, so it's only recorded while the rows are at full height
    const [fullContentHeight, setFullContentHeight] = useState(0);
    // The 1px margin absorbs fractional layout sizes, as the content fills the viewport when it fits
    const isCompact = viewportHeight > 0 && fullContentHeight > viewportHeight + 1;

    const onLayout = (event: LayoutChangeEvent) => setViewportHeight(event.nativeEvent.layout.height);

    const onContentSizeChange = (_contentWidth: number, contentHeight: number) => {
        if (isCompact) {
            return;
        }
        setFullContentHeight(contentHeight);
    };

    return {isCompact, scrollViewProps: {onLayout, onContentSizeChange}};
}

export default useIsNavigationTabBarCompact;
