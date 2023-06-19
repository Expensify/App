import Config from 'react-native-config';
import lodashGet from 'lodash/get';
import CONST from '../../CONST';
import getEnvironment from './getEnvironment';
import CONFIG from '../../CONFIG';

const ENVIRONMENT_URLS = {
    [CONST.ENVIRONMENT.DEV]: CONST.DEV_NEW_EXPENSIFY_URL + CONFIG.DEV_PORT,
    [CONST.ENVIRONMENT.STAGING]: CONST.STAGING_NEW_EXPENSIFY_URL,
    [CONST.ENVIRONMENT.PRODUCTION]: CONST.NEW_EXPENSIFY_URL,
    [CONST.ENVIRONMENT.ADHOC]: CONST.STAGING_NEW_EXPENSIFY_URL,
};

const OLDDOT_ENVIRONMENT_URLS = {
    [CONST.ENVIRONMENT.DEV]: CONST.INTERNAL_DEV_EXPENSIFY_URL,
    [CONST.ENVIRONMENT.STAGING]: CONST.STAGING_EXPENSIFY_URL,
    [CONST.ENVIRONMENT.PRODUCTION]: CONST.EXPENSIFY_URL,
    [CONST.ENVIRONMENT.ADHOC]: CONST.STAGING_EXPENSIFY_URL,
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
 * Are we running an internal test build?
 *
 * @return {boolean}
 */
function isInternalTestBuild() {
    return lodashGet(Config, 'ENVIRONMENT', CONST.ENVIRONMENT.DEV) === CONST.ENVIRONMENT.ADHOC && lodashGet(Config, 'PULL_REQUEST_NUMBER', '');
}

/**
 * Get the URL based on the environment we are in
 *
 * @returns {Promise}
 */
function getEnvironmentURL() {
    return new Promise((resolve) => {
        getEnvironment().then((environment) => resolve(ENVIRONMENT_URLS[environment]));
    });
}

/**
 * Get the corresponding oldDot URL based on the environment we are in
 *
 * @returns {Promise<string>}
 */
function getOldDotEnvironmentURL() {
    return getEnvironment().then((environment) => OLDDOT_ENVIRONMENT_URLS[environment]);
}

export {getEnvironment, isInternalTestBuild, isDevelopment, getEnvironmentURL, getOldDotEnvironmentURL};
