import {useEffect, useRef} from 'react';
import {seedMyExpensesSearch} from '@libs/actions/Search';
import {isSubmitterAndApprover} from '@libs/PolicyUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import {accountIDSelector, emailSelector} from '@src/selectors/Session';
import useLocalize from './useLocalize';
import useOnyx from './useOnyx';

function useSeedMyExpensesSearch() {
    const {translate} = useLocalize();
    const [hasSeededMyExpensesSearch] = useOnyx(ONYXKEYS.NVP_HAS_SEEDED_MY_EXPENSES_SEARCH);
    const [savedSearches] = useOnyx(ONYXKEYS.SAVED_SEARCHES);
    const [currentUserAccountID] = useOnyx(ONYXKEYS.SESSION, {selector: accountIDSelector});
    const [currentUserEmail] = useOnyx(ONYXKEYS.SESSION, {selector: emailSelector});
    const [isSubmitterAndApproverUser] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector: (policies) => isSubmitterAndApprover(policies, currentUserEmail)});
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
