import {Keyboard} from 'react-native';

let isVisible = false;
const initialViewportHeight = window?.visualViewport?.height;

const handleResize = () => {
    const currentHeight = window?.visualViewport?.height;

    if (!currentHeight || !initialViewportHeight) {
        return;
    }

    if (currentHeight < initialViewportHeight) {
        isVisible = true;
        return;
    }

    if (currentHeight === initialViewportHeight) {
        isVisible = false;
    }
};

window.visualViewport?.addEventListener('resize', handleResize);

const dismiss = (): Promise<void> => {
    return new Promise((resolve) => {
        if (!isVisible) {
            resolve();
            return;
        }

        const handleDismissResize = () => {
            if (window.visualViewport?.height !== initialViewportHeight) {
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
