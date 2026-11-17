import variables from '@styles/variables';

import type {ViewStyle} from 'react-native';

import useIsMobileWebLandscape from './useIsMobileWebLandscape';
import useResponsiveLayout from './useResponsiveLayout';
import useThemeStyles from './useThemeStyles';

type ContentHeaderHeight = {
    /** Height of the page header bar for the current screen size */
    contentHeaderHeight: number;

    /** Style that applies the header bar height for the current screen size */
    contentHeaderHeightStyle: ViewStyle;
};

/**
 * Returns the height of the page header bar. Narrow layouts use a shorter header so that pages with several fixed
 * elements (header, footer button, tab bar) keep as much vertical space as possible for scrollable content. Mobile web
 * in landscape, where the browser's own chrome takes even more of the little height there is, goes shorter still.
 */
function useContentHeaderHeight(): ContentHeaderHeight {
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const isMobileWebLandscape = useIsMobileWebLandscape();

    if (isMobileWebLandscape) {
        return {
            contentHeaderHeight: variables.contentHeaderCompactHeight,
            contentHeaderHeightStyle: styles.headerBarCompactHeight,
        };
    }

    return {
        contentHeaderHeight: shouldUseNarrowLayout ? variables.contentHeaderNarrowHeight : variables.contentHeaderHeight,
        contentHeaderHeightStyle: shouldUseNarrowLayout ? styles.headerBarNarrowHeight : styles.headerBarHeight,
    };
}

export default useContentHeaderHeight;
