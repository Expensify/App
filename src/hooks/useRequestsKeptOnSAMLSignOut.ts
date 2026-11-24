/**
 * Sends or deletes the work set aside on a SAML sign-out once someone is signed in again.
 */
import sendOrDeleteRequestsKeptOnSAMLSignOut from '@libs/actions/sendOrDeleteRequestsKeptOnSAMLSignOut';

import ONYXKEYS from '@src/ONYXKEYS';
import {accountIDSelector} from '@src/selectors/Session';

import {useEffect} from 'react';

import useOnyx from './useOnyx';

function useRequestsKeptOnSAMLSignOut() {
    const [accountID] = useOnyx(ONYXKEYS.SESSION, {selector: accountIDSelector});
    const [requestsKeptOnSAMLSignOut] = useOnyx(ONYXKEYS.REQUESTS_KEPT_ON_SAML_SIGN_OUT);

    useEffect(() => {
        if (!requestsKeptOnSAMLSignOut || !accountID) {
            return;
        }
        sendOrDeleteRequestsKeptOnSAMLSignOut(requestsKeptOnSAMLSignOut, accountID);
    }, [requestsKeptOnSAMLSignOut, accountID]);
}

export default useRequestsKeptOnSAMLSignOut;
