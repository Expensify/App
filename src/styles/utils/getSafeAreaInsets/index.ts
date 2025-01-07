import type {EdgeInsets} from 'react-native-safe-area-context';
import defaultInsets from './defaultInsets';

/**
 * Noop on web and iOS. This utility function is only needed on Android.
 * @returns
 */
function getSafeAreaInsets(safeAreaInsets: EdgeInsets | null): EdgeInsets {
    const insets = safeAreaInsets ?? defaultInsets;
    return insets;
}

export default getSafeAreaInsets;
