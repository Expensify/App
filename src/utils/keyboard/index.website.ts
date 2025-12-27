import {Keyboard} from 'react-native';
import {isMobile, isMobileSafari} from '@libs/Browser';
import CONST from '@src/CONST';

let isVisible = false;
const initialViewportHeight = window?.visualViewport?.height;
let previousViewportHeight = initialViewportHeight;
const EMOJI_PICKER_TOGGLE_THRESHOLD = 100;

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

    const newIsVisible = initialViewportHeight - viewportHeight > CONST.SMART_BANNER_HEIGHT;

    // On iOS Safari, ignore small viewport changes when keyboard is already visible
    // These are likely emoji picker toggles, not keyboard show/hide events
    if (isMobileSafari() && typeof previousViewportHeight === 'number') {
        const viewportHeightChange = Math.abs(viewportHeight - previousViewportHeight);

        if (isVisible && viewportHeightChange < EMOJI_PICKER_TOGGLE_THRESHOLD) {
            previousViewportHeight = viewportHeight;
            return; // Don't notify subscribers
        }
    }

    // Update state and notify subscribers
    isVisible = newIsVisible;
    previousViewportHeight = viewportHeight;

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
