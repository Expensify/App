import type {NavBarManagerType} from './types';
import {NavBarManagerNitroModule} from '../index';

const navBarManager: NavBarManagerType = {
    setButtonStyle: (style) => {
        NavBarManagerNitroModule.setButtonStyle(style);
    },
    getType: () => {
        return NavBarManagerNitroModule.getType();
    },
};

export default navBarManager;
