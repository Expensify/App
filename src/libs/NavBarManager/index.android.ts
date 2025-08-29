import {NativeModules} from 'react-native';
import CONST from '@src/CONST';
import type NavBarManager from './types';

const navBarManager: NavBarManager = {
    setButtonStyle: (style) => {
        NativeModules.RNNavBarManager.setButtonStyle(style);
    },
    getType: () => {
        return CONST.NAVIGATION_BAR_TYPE.GESTURE_BAR;
    },
};

export default navBarManager;
