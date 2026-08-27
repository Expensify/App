import {getNetSuiteSetupLink} from '@libs/actions/connections/NetSuiteCommands';
import Navigation from '@libs/Navigation/Navigation';

import {openLink} from '@userActions/Link';

/**
 * On web the NetSuite OAuth setup opens OldDot in a new browser tab. Open it inline within the connect click's
 * user-gesture window instead of navigating to a setup screen, otherwise the popup blocker stops the tab.
 *
 * The OAuth tab is a separate browsing context, so this tab never hears back from it. Dismiss the RHP here rather
 * than waiting for the connection to land in Onyx.
 */
function connectToNetSuiteOAuthSetup(policyID: string, accountID: string, environmentURL: string) {
    openLink(getNetSuiteSetupLink(policyID, accountID), environmentURL);
    Navigation.dismissModal();
}

export default connectToNetSuiteOAuthSetup;
