import {Linking} from 'react-native';

/**
 * Gets the URLSchema and check the existence of that application
 *
 * @param {String} urlScheme
 * @returns {Promise}
 */
export default function isAppInstalled(urlScheme) {
    return new Promise((resolve, reject) => {
        Linking.canOpenURL(`${urlScheme}://`)
            .then((isInstalled) => {
                resolve(isInstalled);
            })
            .catch((error) => {
                reject(error);
            });
    });
}
