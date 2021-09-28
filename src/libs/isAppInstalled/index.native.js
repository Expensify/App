import {Linking} from 'react-native';

/**
 * Gets the URLSchema and check the existence of that application
 *
 * @param {String} urlScheme
 * @param {Boolean} shouldMakeCancellable
 * @returns {Promise}
 */
export default function isAppInstalled(urlScheme, shouldMakeCancellable = false) {
    const promise = new Promise((resolve, reject) => {
        Linking.canOpenURL(`${urlScheme}://`)
            .then((isInstalled) => {
                resolve(isInstalled);
            })
            .catch((error) => {
                reject(error);
            });
    });

    return shouldMakeCancellable ? makeCancellable(promise) : promise;
}
