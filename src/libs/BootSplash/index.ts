import Log from '../Log';
import {VisibilityStatus} from './types';

function resolveAfter(delay: number) {
    return new Promise((resolve) => setTimeout(resolve, delay));
}

function hide() {
    Log.info('[BootSplash] hiding splash screen', false);

    return document.fonts.ready.then(() => {
        const splash = document.getElementById('splash');
        if (splash) {
            splash.style.opacity = '0';
        }

        return resolveAfter(250).then(() => {
            if (!splash?.parentNode) {
                return;
            }
            splash.parentNode.removeChild(splash);
        });
    });
}

function getVisibilityStatus(): Promise<VisibilityStatus> {
    return Promise.resolve(document.getElementById('splash') ? 'visible' : 'hidden');
}

export default {
    hide,
    getVisibilityStatus,
    navigationBarHeight: 0,
};
