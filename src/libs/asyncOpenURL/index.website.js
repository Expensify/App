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
        promise.then((params) => {
            Linking.openURL(typeof url === 'string' ? url : url(params));
        });
    } else {
        const windowRef = window.open();
        promise
            .then((params) => {
                windowRef.location = typeof url === 'string' ? url : url(params);
            })
            .catch(() => windowRef.close());
    }
}
