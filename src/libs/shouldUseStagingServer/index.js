import CONFIG from '../../CONFIG';

/**
 * Helper method used to decide which API endpoint to call
 *
 * @param {Boolean} stagingServerToggleState
 * @returns {Boolean}
 */
function shouldUseStagingServer(stagingServerToggleState) {
    return CONFIG.IS_IN_STAGING && stagingServerToggleState;
}

export default shouldUseStagingServer;
