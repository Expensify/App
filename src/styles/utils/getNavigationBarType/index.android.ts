import NavBarManager from '@libs/NavBarManager';
import {NAVIGATION_BAR_TYPE} from '@expensify/nitro-utils';
import type GetNavigationBarType from './types';

const getNavigationBarType: GetNavigationBarType = (insets) => {
    const bottomInset = insets?.bottom ?? 0;

    // If the bottom safe area inset is 0, we consider the device to have no navigation bar (or it being hidden by default).
    // This could be mean either hidden soft keys, gesture navigation without a gesture bar or physical buttons.
    if (bottomInset === 0) {
        return NAVIGATION_BAR_TYPE.NONE;
    }

    return NavBarManager.getType();
};

export default getNavigationBarType;
