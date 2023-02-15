import CONFIG from '../../CONFIG';
import canUseStagingToggle from './canUseStagingToggle';
import getStagingToggleState from './getStagingToggleState';

function shouldUseStagingServer() {
    if (canUseStagingToggle()) {
        return getStagingToggleState();
    }

    return false;
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
        ? CONFIG.EXPENSIFY.PRODUCTION_SECURE_API_ROOT
        : CONFIG.EXPENSIFY.PRODUCTION_API_ROOT;
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

export {
    getApiRoot,
    getCommandUrl,
    canUseStagingToggle,
};

