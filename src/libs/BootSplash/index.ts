import {InteractionManager} from 'react-native';
import Timing from '@libs/actions/Timing';
import Log from '@libs/Log';
import CONST from '@src/CONST';

function resolveAfter(delay: number): Promise<void> {
    return new Promise<void>((resolve) => {
        setTimeout(resolve, delay);
    });
}

function hide(): Promise<void> {
    Log.info('[BootSplash] hiding splash screen', false);

    return document.fonts.ready.then(() => {
        const splash = document.getElementById('splash');
        if (splash) {
            splash.style.opacity = '0';
        }

        // eslint-disable-next-line deprecation/deprecation
        InteractionManager.runAfterInteractions(() => {
            Timing.end(CONST.TIMING.SPLASH_SCREEN);
        });

        return resolveAfter(250).then(() => {
            if (!splash?.parentNode) {
                return;
            }
            splash.parentNode.removeChild(splash);
        });
    });
}

export default {
    hide,
    logoSizeRatio: 1,
    navigationBarHeight: 0,
};
