import {NavBarManagerNitroModule, NAVIGATION_BAR_TYPE} from '@expensify/nitro-utils';
import type NavBarManager from './types';

const navBarManager: NavBarManager = {
    setButtonStyle: (style) => {
        NavBarManagerNitroModule.setButtonStyle(style);
    },
    getType: () => {
        return NAVIGATION_BAR_TYPE.GESTURE_BAR;
    },
};

export default navBarManager;
