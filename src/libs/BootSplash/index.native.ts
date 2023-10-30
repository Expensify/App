import {NativeModules} from 'react-native';
import Log from '../Log';

const BootSplash = NativeModules.BootSplash;

function hide(): Promise<void> {
    Log.info('[BootSplash] hiding splash screen', false);
    return BootSplash.hide();
}

export default {
    hide,
    getVisibilityStatus: BootSplash.getVisibilityStatus,
    logoSizeRatio: BootSplash.logoSizeRatio || 1,
    navigationBarHeight: BootSplash.navigationBarHeight || 0,
};
