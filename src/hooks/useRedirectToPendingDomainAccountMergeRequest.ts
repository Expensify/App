import Navigation from '@libs/Navigation/Navigation';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

import {useFocusEffect} from '@react-navigation/native';
import {pendingMergeRequestByRequesterSelector} from '@selectors/Domain';
import {accountIDSelector, emailSelector} from '@selectors/Session';

import useOnyx from './useOnyx';

/**
 * Redirects to the pending domain-account-merge-request result screen whenever the current user has a stored
 * pending request. Used by the Merge accounts entry and the validate-code page so a user with a pending request
 * never lands on the form or code entry.
 */
function useRedirectToPendingDomainAccountMergeRequest() {
    const [currentUserAccountID = CONST.DEFAULT_NUMBER_ID] = useOnyx(ONYXKEYS.SESSION, {selector: accountIDSelector});
    const [userEmailOrPhone] = useOnyx(ONYXKEYS.SESSION, {selector: emailSelector});
    const [myPendingMergeRequest] = useOnyx(ONYXKEYS.COLLECTION.DOMAIN_ACCOUNT_MERGE_REQUEST, {
        selector: pendingMergeRequestByRequesterSelector(currentUserAccountID),
    });

    useFocusEffect(() => {
        if (!myPendingMergeRequest || !userEmailOrPhone) {
            return;
        }
        Navigation.navigate(ROUTES.SETTINGS_MERGE_ACCOUNTS_RESULT.getRoute(userEmailOrPhone.trim(), CONST.MERGE_ACCOUNT_RESULTS.PENDING_DOMAIN_APPROVAL), {forceReplace: true});
    });

    return myPendingMergeRequest;
}

export default useRedirectToPendingDomainAccountMergeRequest;
