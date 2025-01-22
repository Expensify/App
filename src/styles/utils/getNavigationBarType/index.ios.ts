import type {EdgeInsets} from 'react-native-safe-area-context';
import type {NavigationBarType} from './types';

function getNavigationBarType(insets?: EdgeInsets): NavigationBarType {
    const bottomInset = insets?.bottom ?? 0;

    // On iOS, if there is a bottom safe area inset, it means the device uses a gesture bar.
    if (bottomInset > 0) {
        return 'gesture-bar';
    }

    // If there is no bottom safe area inset, the device uses a physical navigation button.
    return 'hidden-soft-keys-or-none';
}

export default getNavigationBarType;
