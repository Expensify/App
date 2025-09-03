import type {NavBarManagerType} from './types';
import {NAVIGATION_BAR_TYPE} from './types';

const navBarManager: NavBarManagerType = {
    setButtonStyle: () => {},
    getType: () => (NAVIGATION_BAR_TYPE.NONE),
};

export default navBarManager;
