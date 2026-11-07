import useEnvironment from '@hooks/useEnvironment';
import useOnyx from '@hooks/useOnyx';

import {getDigitsSetupLink} from '@libs/actions/connections/Digits';

import {openLink} from '@userActions/Link';

import ONYXKEYS from '@src/ONYXKEYS';

import {authTokenTypeSelector} from '@selectors/Session';

/**
 * On web the Digits sign-in opens in a new browser tab. Call the returned function from the connect press (within its
 * user-gesture window) or a flow that mounts on one, because browsers block tabs opened outside a user gesture.
 */
function useStartDigitsOAuth() {
    const {environmentURL} = useEnvironment();
    const [session] = useOnyx(ONYXKEYS.SESSION, {selector: authTokenTypeSelector});

    return (policyID: string) => openLink(getDigitsSetupLink(policyID), environmentURL, false, session);
}

export default useStartDigitsOAuth;
