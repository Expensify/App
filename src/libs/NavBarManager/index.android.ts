import {NativeModules} from 'react-native';
import type NavBarManager from './types';
import type {} from './types';

const navBarManager: NavBarManager = {
    setButtonStyle: (style) => {
        NativeModules.RNNavBarManager.setButtonStyle(style);
    },
};

export default navBarManager;
