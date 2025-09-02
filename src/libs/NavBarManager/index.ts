import getPlatform from '@libs/getPlatform';
import CONST from '@src/CONST';
import {NAVIGATION_BAR_TYPE} from '@expensify/nitro-utils';
import type NavBarManager from './types';

const navBarManager: NavBarManager = {
    setButtonStyle: () => {},
    getType: () => (getPlatform() === CONST.PLATFORM.IOS ? NAVIGATION_BAR_TYPE.GESTURE_BAR : NAVIGATION_BAR_TYPE.NONE),
};

export default navBarManager;
