import Config from 'react-native-config';
import _ from 'underscore';
import CONST from '../../CONST';
import getEnvironment from './getEnvironment';

/**
 * Are we running the app in development?
 *
 * @return {boolean}
 */
function isDevelopment() {
    return _.get(Config, 'ENVIRONMENT', CONST.ENVIRONMENT.DEV) === CONST.ENVIRONMENT.DEV;
}

export {
    getEnvironment,
    isDevelopment,
};
