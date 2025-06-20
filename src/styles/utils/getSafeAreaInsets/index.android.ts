import type {EdgeInsets} from 'react-native-safe-area-context';
import defaultInsets from './defaultInsets';

/**
 * On Android we want to use the StatusBar height rather than the top safe area inset.
 * @returns
 */
function getSafeAreaInsets(safeAreaInsets: EdgeInsets | null): EdgeInsets {
    const insets = safeAreaInsets ?? defaultInsets;

    return insets;
}

export default getSafeAreaInsets;
