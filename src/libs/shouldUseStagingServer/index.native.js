import * as Environment from '../Environment/Environment';

/*
 * @param {Boolean} stagingServerToggleState
 * @returns {Boolean}
 */
export default function shouldUseStagingServer(stagingServerToggleState) {
    return !Environment.isDevelopment() && stagingServerToggleState;
}
