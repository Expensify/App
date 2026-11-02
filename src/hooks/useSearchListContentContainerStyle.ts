import type {ViewStyle} from 'react-native';

import useIsMobileWebLandscape from './useIsMobileWebLandscape';
import useThemeStyles from './useThemeStyles';

/**
 * Top padding the narrow Search page's list (or whatever it renders instead: skeleton, empty state, error view)
 * needs so its first row clears the header floating above it.
 *
 * `undefined` where the header scrolls as part of the list's content (mweb landscape) instead of floating above it.
 */
function useSearchListContentContainerStyle(hasFilterBars: boolean, isTabRowHidden = false): ViewStyle | undefined {
    const styles = useThemeStyles();
    const shouldScrollMainHeader = useIsMobileWebLandscape();

    return shouldScrollMainHeader ? undefined : styles.searchListContentContainerStyles(hasFilterBars, isTabRowHidden);
}

export default useSearchListContentContainerStyle;
