import type {ViewStyle} from 'react-native';

import useShouldScrollMainHeader from './useShouldScrollMainHeader';
import useThemeStyles from './useThemeStyles';

/**
 * Top padding the narrow Search page's list (or whatever it renders instead — skeleton, empty state, error view)
 * needs so its first row clears the header floating above it.
 *
 * `undefined` where the header scrolls as part of the list's content instead of floating above it: there it occupies
 * real space, so reserving more would leave a gap — see useShouldScrollMainHeader. Having a single owner for this
 * keeps the many places that render into that space from disagreeing about it.
 */
function useSearchListContentContainerStyle(hasFilterBars: boolean): ViewStyle | undefined {
    const styles = useThemeStyles();
    const shouldScrollMainHeader = useShouldScrollMainHeader();

    return shouldScrollMainHeader ? undefined : styles.searchListContentContainerStyles(hasFilterBars);
}

export default useSearchListContentContainerStyle;
