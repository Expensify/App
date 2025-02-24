import {NativeModules} from 'react-native';
import type NavBarManager from './types';

const navBarManager: NavBarManager = {
    setButtonStyle: (style) => {
        NativeModules.RNNavBarManager.setButtonStyle(style);
    },
};

export default navBarManager;
