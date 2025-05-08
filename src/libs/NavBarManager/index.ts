import getPlatform from '@libs/getPlatform';
import CONST from '@src/CONST';
import type NavBarManager from './types';

const navBarManager: NavBarManager = {
    setButtonStyle: () => {},
    getType: () => (getPlatform() === CONST.PLATFORM.IOS ? CONST.NAVIGATION_BAR_TYPE.GESTURE_BAR : CONST.NAVIGATION_BAR_TYPE.NONE),
};

export default navBarManager;
