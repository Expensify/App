import CONST from '@src/CONST';
import type GetNavigationBarType from './types';

const getNavigationBarType: GetNavigationBarType = (insets) => {
    const bottomInset = insets?.bottom ?? 0;

    // If there is no bottom safe area inset, the device uses a physical navigation button.
    if (bottomInset === 0) {
        return Promise.resolve(CONST.NAVIGATION_BAR_TYPE.NONE);
    }

    // On iOS, if there is a bottom safe area inset, it means the device uses a gesture bar.
    return Promise.resolve(CONST.NAVIGATION_BAR_TYPE.GESTURE_BAR);
};

export default getNavigationBarType;
