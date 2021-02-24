import {Linking} from 'react-native';

/**
 * Gets the URLSchema and check the existence of that application
 *
 * @param {String} urlScheme
 * @returns {Promise<Boolean>}
 */
export default async function isAppInstalled(urlScheme) {
    try {
        return await Linking.canOpenURL(`${urlScheme}://`);
    } catch {
        return false;
    }
}
