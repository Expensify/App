import {Linking} from 'react-native';

/**
 * Prevents Safari from blocking pop-up window when opened within async call.
 *
 * @param {Promise} promise
 * @param {string}  url
 */
export default function asyncOpenURL(promise, url) {
    if (!url) {
        return;
    }

    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

    if (!isSafari) {
        promise.then(() => {
            Linking.openURL(url);
        });
    } else {
        const windowRef = window.open();
        promise
            .then(() => {
                windowRef.location = url;
            })
            .catch(() => windowRef.close());
    }
}
