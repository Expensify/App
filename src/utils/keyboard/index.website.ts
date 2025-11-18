import {Keyboard} from 'react-native';
import {isMobile} from '@libs/Browser';
import CONST from '@src/CONST';

let isVisible = false;
const initialViewportHeight = window?.visualViewport?.height;

const keyboardVisibilityChangeListenersSet = new Set<(isVisible: boolean) => void>();

const subscribeKeyboardVisibilityChange = (cb: (isVisible: boolean) => void) => {
    keyboardVisibilityChangeListenersSet.add(cb);

    return () => {
        keyboardVisibilityChangeListenersSet.delete(cb);
    };
};

const handleResize = () => {
    const viewportHeight = window?.visualViewport?.height;

    if (!viewportHeight || !initialViewportHeight) {
        return;
    }

    // Determine if the keyboard is visible by checking if the height difference exceeds 152px.
    // The 152px threshold accounts for UI elements such as smart banners on iOS Retina (max ~152px)
    // and smaller overlays like offline indicators on Android. Height differences > 152px reliably indicate keyboard visibility.
    isVisible = initialViewportHeight - viewportHeight > CONST.SMART_BANNER_HEIGHT;

    for (const cb of keyboardVisibilityChangeListenersSet) {
        cb(isVisible);
    }
};

window.visualViewport?.addEventListener('resize', handleResize);

const dismiss = (): Promise<void> => {
    return new Promise((resolve) => {
        if (!isVisible || !isMobile()) {
            resolve();
            return;
        }

        const handleDismissResize = () => {
            const viewportHeight = window?.visualViewport?.height;

            if (!viewportHeight || !initialViewportHeight) {
                return;
            }

            const isKeyboardVisible = initialViewportHeight - viewportHeight > CONST.SMART_BANNER_HEIGHT;
            if (isKeyboardVisible) {
                return;
            }

            window.visualViewport?.removeEventListener('resize', handleDismissResize);
            return resolve();
        };

        window.visualViewport?.addEventListener('resize', handleDismissResize);
        Keyboard.dismiss();
    });
};

const dismissKeyboardAndExecute = (cb: () => void): Promise<void> => {
    return new Promise((resolve) => {
        // This fixes a bug specific to native apps on Android < 16
        // For web it just executes callback
        // https://github.com/Expensify/App/issues/70692
        cb();
        resolve();
    });
};

const utils = {dismiss, dismissKeyboardAndExecute, subscribeKeyboardVisibilityChange};

export default utils;
