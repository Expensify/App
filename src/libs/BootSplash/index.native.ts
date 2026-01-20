import {InteractionManager, NativeModules} from 'react-native';
import Timing from '@libs/actions/Timing';
import Log from '@libs/Log';
import CONST from '@src/CONST';

const BootSplash = NativeModules.BootSplash;

function hide(): Promise<void> {
    Log.info('[BootSplash] hiding splash screen', false);

    return BootSplash.hide().finally(() => {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        InteractionManager.runAfterInteractions(() => {
            Timing.end(CONST.TIMING.SPLASH_SCREEN);
        });
    });
}

export default {
    hide,
    logoSizeRatio: BootSplash.logoSizeRatio || 1,
    navigationBarHeight: BootSplash.navigationBarHeight || 0,
};
