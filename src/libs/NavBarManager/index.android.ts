import {NativeModules} from 'react-native';
import Log from '@libs/Log';
import type StartupTimer from './types';
import type {NavBarButtonStyle} from './types';

const navBarManager: StartupTimer = {
    setButtonStyle: (style: NavBarButtonStyle) => {
        if (!NativeModules.RNNavBarManager) {
            Log.hmmm('RNNavBarManager not found');
            return;
        }

        NativeModules.RNNavBarManager.setButtonStyle(style);
    },
};

export default navBarManager;
