import {AppState} from 'react-native';

let onAppBecameActiveCallback;

AppState.addEventListener('change', (state) => {
    if (state === 'active') {
        onAppBecameActiveCallback();
    }
})

/**
 * Register active state change callback
 *
 * @param {Function} callback
 */
function registerOnAppBecameActiveCallback(callback) {
    onAppBecameActiveCallback = callback;
}

export default {
    registerOnAppBecameActiveCallback,
};
