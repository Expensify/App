import {seedMyExpensesSearch} from '@libs/actions/Search';
import {isSubmitterAndApprover} from '@libs/PolicyUtils';

import ONYXKEYS from '@src/ONYXKEYS';
import {accountIDSelector, emailSelector} from '@src/selectors/Session';
import type {Policy} from '@src/types/onyx';

import type {OnyxCollection} from 'react-native-onyx';

import {useEffect, useMemo, useRef} from 'react';

import useLocalize from './useLocalize';
import useOnyx from './useOnyx';

const createIsSubmitterAndApproverSelector = (currentUserEmail: string | undefined) => (policies: OnyxCollection<Policy>) => isSubmitterAndApprover(policies, currentUserEmail);

/** Seeds the default saved search for users who both submit and approve. `isEnabled` holds the seed back until it is false no longer. */
function useSeedMyExpensesSearch(isEnabled = true) {
    const {translate} = useLocalize();
    const [hasSeededMyExpensesSearch] = useOnyx(ONYXKEYS.NVP_HAS_SEEDED_MY_EXPENSES_SEARCH);
    const [savedSearches, savedSearchesMetadata] = useOnyx(ONYXKEYS.SAVED_SEARCHES);
    const [currentUserAccountID] = useOnyx(ONYXKEYS.SESSION, {selector: accountIDSelector});
    const [currentUserEmail] = useOnyx(ONYXKEYS.SESSION, {selector: emailSelector});
    const isSubmitterAndApproverSelector = useMemo(() => createIsSubmitterAndApproverSelector(currentUserEmail), [currentUserEmail]);
    const [isSubmitterAndApproverUser] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector: isSubmitterAndApproverSelector});
    const hasSeededRef = useRef(false);

    useEffect(() => {
        // Wait for the saved searches to finish loading before seeding. Their value is `undefined` both while loading and when empty,
        // so gating on the load status (instead of the value) prevents seeding over a pre-existing search that has not synced yet.
        if (
            !isEnabled ||
            hasSeededRef.current ||
            hasSeededMyExpensesSearch ||
            !currentUserAccountID ||
            !currentUserEmail ||
            isSubmitterAndApproverUser === undefined ||
            savedSearchesMetadata.status !== 'loaded'
        ) {
            return;
        }

        if (isSubmitterAndApproverUser) {
            hasSeededRef.current = true;
            seedMyExpensesSearch(currentUserAccountID, translate('search.mySavedSearch'), savedSearches);
        }
    }, [isEnabled, hasSeededMyExpensesSearch, currentUserAccountID, currentUserEmail, isSubmitterAndApproverUser, translate, savedSearches, savedSearchesMetadata.status]);
}

export default useSeedMyExpensesSearch;
