import variables from '@styles/variables';

import type {ViewStyle} from 'react-native';

import useResponsiveLayout from './useResponsiveLayout';
import useThemeStyles from './useThemeStyles';

type ContentHeaderHeight = {
    /** Height of the page header bar for the current screen size */
    contentHeaderHeight: number;

    /** Style that applies the header bar height for the current screen size */
    contentHeaderHeightStyle: ViewStyle;
};

/**
 * Returns the height of the page header bar. Mobile uses a shorter header so that pages with several fixed elements
 * (header, footer button, tab bar) keep as much vertical space as possible for scrollable content.
 */
function useContentHeaderHeight(): ContentHeaderHeight {
    const styles = useThemeStyles();
    // The shorter header is a mobile-only change, so the RHP on a wide screen must keep the taller header.
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();

    return {
        contentHeaderHeight: isSmallScreenWidth ? variables.contentHeaderMobileHeight : variables.contentHeaderHeight,
        contentHeaderHeightStyle: isSmallScreenWidth ? styles.headerBarMobileHeight : styles.headerBarHeight,
    };
}

export default useContentHeaderHeight;
