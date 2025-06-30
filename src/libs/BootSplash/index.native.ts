import {NativeModules} from 'react-native';
import Log from '@libs/Log';
import Timing from '@libs/actions/Timing';
import CONST from '@src/CONST';

const BootSplash = NativeModules.BootSplash;

function hide(): Promise<void> {
    Log.info('[BootSplash] hiding splash screen', false);

    return BootSplash.hide().finally(() => Timing.end(CONST.TIMING.SPLASH_SCREEN));
}

export default {
    hide,
    logoSizeRatio: BootSplash.logoSizeRatio || 1,
    navigationBarHeight: BootSplash.navigationBarHeight || 0,
};
