import {NavBarManagerNitroModule} from '@expensify/nitro-utils';
import type NavBarManager from './types';

const navBarManager: NavBarManager = {
    setButtonStyle: (style) => {
        NavBarManagerNitroModule.setButtonStyle(style);
    },
    getType: () => {
        return NavBarManagerNitroModule.getType();
    },
};

export default navBarManager;
