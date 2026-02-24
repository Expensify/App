import {NativeModules} from 'react-native';
import Log from '@libs/Log';

const BootSplash = NativeModules.BootSplash;

function hide(): Promise<void> {
    Log.info('[BootSplash] hiding splash screen', false);

    return BootSplash.hide();
}

export default {
    hide,
    logoSizeRatio: BootSplash.logoSizeRatio || 1,
    navigationBarHeight: BootSplash.navigationBarHeight || 0,
};
