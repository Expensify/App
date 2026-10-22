import useEnvironment from '@hooks/useEnvironment';

import {getZohoBooksSetupLink} from '@libs/actions/connections/ZohoBooks';

import {openLink} from '@userActions/Link';

/**
 * On web the Zoho Books OAuth setup opens in a new browser tab. Call the returned function from the connect click (within
 * its user-gesture window) instead of navigating to a setup screen first, otherwise the popup blocker stops the tab.
 */
function useStartZohoBooksOAuth() {
    const {environmentURL} = useEnvironment();

    return (policyID: string) => openLink(getZohoBooksSetupLink(policyID), environmentURL);
}

export default useStartZohoBooksOAuth;
