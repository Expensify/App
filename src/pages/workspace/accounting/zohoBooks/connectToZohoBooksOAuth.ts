import {getZohoBooksSetupLink} from '@libs/actions/connections/ZohoBooks';
import Navigation from '@libs/Navigation/Navigation';

import {openLink} from '@userActions/Link';

/**
 * On web the Zoho Books OAuth setup opens in a new browser tab. Open it from the setup form submit, inside the
 * click's user-gesture window, otherwise the popup blocker stops the tab.
 *
 * The OAuth tab is a separate browsing context, so this tab never hears back from it. Dismiss the RHP here rather
 * than waiting for the connection to land in Onyx.
 */
function connectToZohoBooksOAuth(policyID: string, environmentURL: string) {
    openLink(getZohoBooksSetupLink(policyID), environmentURL);
    Navigation.dismissModal();
}

export default connectToZohoBooksOAuth;
