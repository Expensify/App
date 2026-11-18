import useEnvironment from '@hooks/useEnvironment';
import useOnyx from '@hooks/useOnyx';

import {getDigitsSetupLink} from '@libs/actions/connections/Digits';
import Navigation from '@libs/Navigation/Navigation';

import {openLink} from '@userActions/Link';

import ONYXKEYS from '@src/ONYXKEYS';

import {authTokenTypeSelector} from '@selectors/Session';

/**
 * On web the Digits sign-in opens in a new browser tab. Call the returned function from the connect press (within its
 * user-gesture window) or a flow that mounts on one, because browsers block tabs opened outside a user gesture.
 *
 * The sign-in tab never reports back to this one, so a caller inside the RHP passes `shouldDismissModal` to close it and
 * leave the admin on the Connections page, where the new connection shows up once they sign in.
 */
function useStartDigitsOAuth() {
    const {environmentURL} = useEnvironment();
    const [session] = useOnyx(ONYXKEYS.SESSION, {selector: authTokenTypeSelector});

    return (policyID: string, {shouldDismissModal = false}: {shouldDismissModal?: boolean} = {}) => {
        openLink(getDigitsSetupLink(policyID), environmentURL, false, session);
        if (!shouldDismissModal) {
            return;
        }
        Navigation.dismissModal();
    };
}

export default useStartDigitsOAuth;
