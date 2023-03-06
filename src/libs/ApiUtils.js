import lodashGet from 'lodash/get';
import Onyx from 'react-native-onyx';
import ONYXKEYS from '../ONYXKEYS';
import CONFIG from '../CONFIG';
import CONST from '../CONST';
import * as Environment from './Environment/Environment';

// To avoid rebuilding native apps, native apps use production config for both staging and prod
// We use the async environment check because it works on all platforms
let ENV_NAME = CONST.ENVIRONMENT.PRODUCTION;
Environment.getEnvironment()
    .then((envName) => {
        ENV_NAME = envName;
    });

let stagingServerToggleState;
Onyx.connect({
    key: ONYXKEYS.USER,
    callback: (val) => {
        stagingServerToggleState = lodashGet(val, 'shouldUseStagingServer');
    },
});

function shouldUseStagingServer() {
    // Choosing between staging and prod/dev is only available on DEV and STAGING
    if (ENV_NAME === CONST.ENVIRONMENT.PRODUCTION) {
        return false;
    }

    if (typeof stagingServerToggleState !== 'boolean') {
        return ENV_NAME === CONST.ENVIRONMENT.STAGING;
    }

    return stagingServerToggleState;
}

/**
 * Get the currently used API endpoint
 * (Some environments allow for dynamically switching the API)
 *
 * @param {Object} request
 * @param {Boolean} request.shouldUseSecure
 * @returns {String}
 */
function getApiRoot(request) {
    if (shouldUseStagingServer()) {
        return request.shouldUseSecure
            ? CONFIG.EXPENSIFY.STAGING_SECURE_API_ROOT
            : CONFIG.EXPENSIFY.STAGING_API_ROOT;
    }

    return request.shouldUseSecure
        ? CONFIG.EXPENSIFY.PRIMARY_SECURE_API_ROOT
        : CONFIG.EXPENSIFY.PRIMARY_API_ROOT;
}

/**
 * Get the command url for the given request
 *
 * @param {Object} request
 * @param {Boolean} request.shouldUseSecure
 * @param {String} request.command - the name of the API command
 * @returns {string}
 */
function getCommandUrl(request) {
    return `${getApiRoot(request)}api?command=${request.command}`;
}

function isUsingStagingApi() {
    return getApiRoot({shouldUseSecure: false}) === CONFIG.EXPENSIFY.STAGING_API_ROOT;
}

export {
    getApiRoot,
    getCommandUrl,
    isUsingStagingApi,
};

