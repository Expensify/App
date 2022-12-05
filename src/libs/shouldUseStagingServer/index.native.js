import * as Environment from '../Environment/Environment';

/**
 * Helper method used to decide which API endpoint to call in the Native apps.
 * We build the staging native apps with production env config so we cannot rely on those values,
 * hence we will decide solely on the value of the shouldUseStagingServer value (always false in production).
 *
 * @param {Boolean} stagingServerToggleState
 * @returns {Boolean}
 */
export default function shouldUseStagingServer(stagingServerToggleState) {
    return !Environment.isDevelopment() && stagingServerToggleState;
}
