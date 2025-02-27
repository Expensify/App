import {Keyboard} from 'react-native';
import {isMobile} from '@libs/Browser';
import CONST from '@src/CONST';

let isVisible = false;
const initialViewportHeight = window?.visualViewport?.height;

const handleResize = () => {
    const viewportHeight = window?.visualViewport?.height;

    if (!viewportHeight || !initialViewportHeight) {
        return;
    }

    // Determine if the keyboard is visible by checking if the height difference exceeds 152px.
    // The 152px threshold accounts for UI elements such as smart banners on iOS Retina (max ~152px)
    // and smaller overlays like offline indicators on Android. Height differences > 152px reliably indicate keyboard visibility.
    isVisible = initialViewportHeight - viewportHeight > CONST.SMART_BANNER_HEIGHT;
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

const utils = {dismiss};

export default utils;
