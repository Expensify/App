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

function useSeedMyExpensesSearch() {
    const {translate} = useLocalize();
    const [hasSeededMyExpensesSearch] = useOnyx(ONYXKEYS.NVP_HAS_SEEDED_MY_EXPENSES_SEARCH);
    const [savedSearches] = useOnyx(ONYXKEYS.SAVED_SEARCHES);
    const [currentUserAccountID] = useOnyx(ONYXKEYS.SESSION, {selector: accountIDSelector});
    const [currentUserEmail] = useOnyx(ONYXKEYS.SESSION, {selector: emailSelector});
    const isSubmitterAndApproverSelector = useMemo(() => createIsSubmitterAndApproverSelector(currentUserEmail), [currentUserEmail]);
    const [isSubmitterAndApproverUser] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector: isSubmitterAndApproverSelector}, [currentUserEmail]);
    const hasSeededRef = useRef(false);

    useEffect(() => {
        if (hasSeededRef.current || hasSeededMyExpensesSearch || !currentUserAccountID || !currentUserEmail || isSubmitterAndApproverUser === undefined) {
            return;
        }

        if (isSubmitterAndApproverUser) {
            hasSeededRef.current = true;
            seedMyExpensesSearch(currentUserAccountID, translate('search.mySavedSearch'), savedSearches);
        }
    }, [hasSeededMyExpensesSearch, currentUserAccountID, currentUserEmail, isSubmitterAndApproverUser, translate, savedSearches]);
}

export default useSeedMyExpensesSearch;
