import type {EdgeInsets} from 'react-native-safe-area-context';
import CONST from '@src/CONST';
import type {NavigationBarType} from './types';

function getNavigationBarType(insets?: EdgeInsets): NavigationBarType {
    const bottomInset = insets?.bottom ?? 0;

    // If the bottom safe area inset is greater than the defined Android minimum soft keys height threshold, we consider it as a static soft keys.
    if (bottomInset > CONST.NAVIGATION_BAR_ANDROID_SOFT_KEYS_MINIMUM_HEIGHT_THRESHOLD) {
        return CONST.NAVIGATION_BAR_TYPE.SOFT_KEYS;
    }

    // If the bottom safe area inset is greater than 0, we consider it as a gesture bar.
    if (bottomInset > 0) {
        return CONST.NAVIGATION_BAR_TYPE.GESTURE_BAR;
    }

    // If the bottom safe area inset is 0, we consider the device to have no navigation bar (or it being hidden by default).
    // This could be mean either hidden soft keys, gesture navigation without a gesture bar or physical buttons.
    return CONST.NAVIGATION_BAR_TYPE.NONE;
}

export default getNavigationBarType;
