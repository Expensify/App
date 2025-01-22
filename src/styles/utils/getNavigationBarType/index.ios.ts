import type {EdgeInsets} from 'react-native-safe-area-context';
import CONST from '@src/CONST';
import type {NavigationBarType} from './types';

function getNavigationBarType(insets?: EdgeInsets): NavigationBarType {
    const bottomInset = insets?.bottom ?? 0;

    // On iOS, if there is a bottom safe area inset, it means the device uses a gesture bar.
    if (bottomInset > 0) {
        return CONST.NAVIGATION_BAR_TYPE.GESTURE_BAR;
    }

    // If there is no bottom safe area inset, the device uses a physical navigation button.
    return CONST.NAVIGATION_BAR_TYPE.NONE;
}

export default getNavigationBarType;
