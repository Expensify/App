import {NativeModules} from 'react-native';
import type StartupTimer from './types';
import type {NavBarButtonStyle} from './types';

const navBarManager: StartupTimer = {
    setButtonStyle: (style: NavBarButtonStyle) => {
        NativeModules.RNNavBarManager.setButtonStyle(style);
    },
};

export default navBarManager;
