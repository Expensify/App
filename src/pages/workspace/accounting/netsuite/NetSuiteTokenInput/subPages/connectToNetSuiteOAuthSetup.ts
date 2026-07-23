import {getNetSuiteSetupLink} from '@libs/actions/connections/NetSuiteCommands';

import {openLink} from '@userActions/Link';

/**
 * On web the NetSuite OAuth setup opens OldDot in a new browser tab. Open it inline within the connect click's
 * user-gesture window instead of navigating to a setup screen, otherwise the popup blocker stops the tab.
 */
function connectToNetSuiteOAuthSetup(policyID: string, accountID: string, environmentURL: string) {
    openLink(getNetSuiteSetupLink(policyID, accountID), environmentURL);
}

export default connectToNetSuiteOAuthSetup;
