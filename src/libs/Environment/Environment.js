import Config from 'react-native-config';
import lodashGet from 'lodash/get';
import CONST from '../../CONST';
import getEnvironment from './getEnvironment';
import CONFIG from '../../CONFIG';

const ENVIRONMENT_URLS = {
    [CONST.ENVIRONMENT.DEV]: CONST.DEV_NEW_EXPENSIFY_URL + CONFIG.DEV_PORT,
    [CONST.ENVIRONMENT.STAGING]: CONST.STAGING_NEW_EXPENSIFY_URL,
    [CONST.ENVIRONMENT.PRODUCTION]: CONST.NEW_EXPENSIFY_URL,
};

/**
 * Are we running the app in development?
 *
 * @return {boolean}
 */
function isDevelopment() {
    return lodashGet(Config, 'ENVIRONMENT', CONST.ENVIRONMENT.DEV) === CONST.ENVIRONMENT.DEV;
}

/**
 * Get the URL based on the environment we are in
 *
 * @returns {Promise}
 */
function getEnvironmentURL() {
    return new Promise((resolve) => {
        getEnvironment()
            .then(environment => resolve(ENVIRONMENT_URLS[environment]));
    });
}

export {
    getEnvironment,
    isDevelopment,
    getEnvironmentURL,
};
