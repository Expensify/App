import type {EdgeInsets} from 'react-native-safe-area-context';
import NavBarManager from '@libs/NavBarManager';
import type {NavigationBarType} from '@libs/NavBarManager/types';
import CONST from '@src/CONST';

function getNavigationBarType(insets?: EdgeInsets): NavigationBarType {
    const bottomInset = insets?.bottom ?? 0;

    // If the bottom safe area inset is 0, we consider the device to have no navigation bar (or it being hidden by default).
    // This could be mean either hidden soft keys, gesture navigation without a gesture bar or physical buttons.
    if (bottomInset === 0) {
        return CONST.NAVIGATION_BAR_TYPE.NONE;
    }

    return NavBarManager.getType();
}

export default getNavigationBarType;
