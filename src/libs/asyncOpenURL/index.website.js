import {Linking} from 'react-native';

/**
 * Prevents Safari from blocking pop-up window when opened within async call.
 *
 * @param {Promise} promise
 */
export default function asyncOpenURL(promise) {
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

    if (!isSafari) {
        promise.then((url) => {
            if (!url) {
                return;
            }
            Linking.openURL(url);
        });
    } else {
        const windowRef = window.open();
        promise
            .then((url) => {
                if (!url) {
                    return windowRef.close();
                }
                windowRef.location = url;
            })
            .catch(() => windowRef.close());
    }
}
