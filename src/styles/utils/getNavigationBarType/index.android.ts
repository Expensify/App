import type {EdgeInsets} from 'react-native-safe-area-context';
import CONST from '@src/CONST';
import type {NavigationBarType} from './types';

function getNavigationBarType(insets?: EdgeInsets): NavigationBarType {
    const bottomInset = insets?.bottom ?? 0;

    // If the bottom safe area inset is greater than the defined Android minimum soft keys height threshold, we consider it as a static soft keys.
    if (bottomInset > CONST.NAVIGATION_BAR_ANDROID_SOFT_KEYS_MINIMUM_HEIGHT_THRESHOLD) {
        return 'static-soft-keys';
    }

    // If the bottom safe area inset is greater than 0, we consider it as a gesture bar.
    if (bottomInset > 0) {
        return 'gesture-bar';
    }

    // If the bottom safe area inset is 0, we consider it as hidden soft keys or no navigation bar (e.g. physical buttons).
    return 'hidden-soft-keys-or-none';
}

export default getNavigationBarType;
