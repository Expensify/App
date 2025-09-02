import {NAVIGATION_BAR_TYPE} from '@expensify/nitro-utils';
import type GetNavigationBarType from './types';

const getNavigationBarType: GetNavigationBarType = (insets) => {
    const bottomInset = insets?.bottom ?? 0;

    // If there is no bottom safe area inset, the device uses a physical navigation button.
    if (bottomInset === 0) {
        return NAVIGATION_BAR_TYPE.NONE;
    }

    // On iOS, if there is a bottom safe area inset, it means the device uses a gesture bar.
    return NAVIGATION_BAR_TYPE.GESTURE_BAR;
};

export default getNavigationBarType;
