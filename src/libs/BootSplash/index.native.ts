import {NativeModules} from 'react-native';
import Log from '../Log';
import {BootSplashModule} from './types';

const BootSplash: BootSplashModule = NativeModules.BootSplash;

function hide() {
    Log.info('[BootSplash] hiding splash screen', false);
    return BootSplash.hide();
}

export default {
    hide,
    getVisibilityStatus: BootSplash.getVisibilityStatus,
    navigationBarHeight: BootSplash.navigationBarHeight || 0,
};
