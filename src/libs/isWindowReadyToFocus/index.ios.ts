import {AppState} from 'react-native';

let isWindowReadyPromise = Promise.resolve();
let resolveWindowReadyToFocus: (() => void) | undefined;

AppState.addEventListener('change', (nextAppState) => {
    if (nextAppState === 'active') {
        if (resolveWindowReadyToFocus) {
            resolveWindowReadyToFocus();
            resolveWindowReadyToFocus = undefined;
        }
        return;
    }

    // When transitioning to background or inactive, block focus until active again
    if (nextAppState === 'background' || nextAppState === 'inactive') {
        if (!resolveWindowReadyToFocus) {
            isWindowReadyPromise = new Promise((resolve) => {
                resolveWindowReadyToFocus = resolve;
            });
        }
    }
});

/**
 * On iOS, we need to ensure that the app is fully active before focusing an input.
 * When the app transitions from background/inactive to active, iOS may restore the first responder
 * and show the keyboard before the app finishes its transition animation.
 * This function blocks focus operations until the app is fully active.
 */
const isWindowReadyToFocus = () => isWindowReadyPromise;

export default isWindowReadyToFocus;
