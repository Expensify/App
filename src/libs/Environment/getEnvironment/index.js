import lodashGet from 'lodash/get';
import Config from 'react-native-config';
import CONST from '../../../CONST';

/**
 * Returns a promise that resolves with the current environment string value
 *
 * @returns {Promise}
 */
function getEnvironment() {
    return new Promise(resolve => resolve(lodashGet(Config, 'ENVIRONMENT', CONST.ENVIRONMENT.DEV)));
}

export default getEnvironment;
