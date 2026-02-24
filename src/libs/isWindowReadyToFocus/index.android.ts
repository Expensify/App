import {AppState} from 'react-native';

let isWindowReadyPromise = Promise.resolve();
let resolveWindowReadyToFocus: () => void;

AppState.addEventListener('focus', () => {
    if (!resolveWindowReadyToFocus) {
        return;
    }
    resolveWindowReadyToFocus();
});

AppState.addEventListener('blur', () => {
    isWindowReadyPromise = new Promise((resolve) => {
        resolveWindowReadyToFocus = resolve;
    });
});

/**
 * If we want to show the soft keyboard reliably, we need to ensure that the input's window gains focus first.
 * Fortunately, we only need to manage the focus of the app window now,
 * so we can achieve this by listening to the 'focus' event of the AppState.
 * See {@link https://developer.android.com/develop/ui/views/touch-and-input/keyboard-input/visibility#ShowReliably}
 */
const isWindowReadyToFocus = () => isWindowReadyPromise;

export default isWindowReadyToFocus;
