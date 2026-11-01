import {getDigitsSetupLink} from '@libs/actions/connections/Digits';

import {openLink} from '@userActions/Link';

/**
 * Opens the Digits sign-in in a new browser tab. Call it straight from a press handler or a flow that mounts on one,
 * because browsers block tabs opened outside a user gesture.
 */
function openDigitsSignIn(policyID: string, environmentURL: string) {
    openLink(getDigitsSetupLink(policyID), environmentURL);
}

export default openDigitsSignIn;
