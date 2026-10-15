import {getZohoBooksSetupLink} from '@libs/actions/connections/ZohoBooks';

import {openLink} from '@userActions/Link';

/**
 * On web the Zoho Books OAuth setup opens in a new browser tab. Open it inline from the connect click, within its
 * user-gesture window, otherwise the popup blocker stops the tab.
 */
function connectToZohoBooksOAuth(policyID: string, environmentURL: string) {
    openLink(getZohoBooksSetupLink(policyID), environmentURL);
}

export default connectToZohoBooksOAuth;
