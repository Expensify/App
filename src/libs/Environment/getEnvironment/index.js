import _ from 'underscore';
import Config from 'react-native-config';
import CONST from '../../../CONST';

/**
 * Returns a promise that resolves with the current environment string value
 *
 * @returns {Promise}
 */
function getEnvironment() {
    return Promise.resolve(_.get(Config, 'ENVIRONMENT', CONST.ENVIRONMENT.DEV));
}

export default getEnvironment;
