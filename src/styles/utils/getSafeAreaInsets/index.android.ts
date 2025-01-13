import type {EdgeInsets} from 'react-native-safe-area-context';
import StatusBar from '@libs/StatusBar';
import defaultInsets from './defaultInsets';

/**
 * On Android we want to use the StatusBar height rather than the top safe area inset.
 * @returns
 */
function getSafeAreaInsets(safeAreaInsets: EdgeInsets | null): EdgeInsets {
    const insets = safeAreaInsets ?? defaultInsets;

    return {
        ...insets,
        top: StatusBar.currentHeight ?? insets.top,
    };
}

export default getSafeAreaInsets;
