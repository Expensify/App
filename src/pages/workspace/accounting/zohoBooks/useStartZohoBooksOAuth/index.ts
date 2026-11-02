import useEnvironment from '@hooks/useEnvironment';
import useOnyx from '@hooks/useOnyx';

import {getZohoBooksSetupLink} from '@libs/actions/connections/ZohoBooks';

import {openLink} from '@userActions/Link';

import ONYXKEYS from '@src/ONYXKEYS';

import {authTokenTypeSelector} from '@selectors/Session';

/**
 * On web the Zoho Books OAuth setup opens in a new browser tab. Call the returned function from the connect click (within
 * its user-gesture window) instead of navigating to a setup screen first, otherwise the popup blocker stops the tab.
 */
function useStartZohoBooksOAuth() {
    const {environmentURL} = useEnvironment();
    const [session] = useOnyx(ONYXKEYS.SESSION, {selector: authTokenTypeSelector});

    return (policyID: string) => openLink(getZohoBooksSetupLink(policyID), environmentURL, false, session);
}

export default useStartZohoBooksOAuth;
