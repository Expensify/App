import {useEffect, useRef} from 'react';
import {seedMyExpensesSearch} from '@libs/actions/Search';
import {isDualRoleUser} from '@libs/PolicyUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import {accountIDSelector, emailSelector} from '@src/selectors/Session';
import useLocalize from './useLocalize';
import useOnyx from './useOnyx';

function useSeedMyExpensesSearch() {
    const {translate} = useLocalize();
    const [hasSeededMyExpensesSearch] = useOnyx(ONYXKEYS.NVP_HAS_SEEDED_MY_EXPENSES_SEARCH);
    const [savedSearches] = useOnyx(ONYXKEYS.SAVED_SEARCHES);
    const [currentUserAccountID = -1] = useOnyx(ONYXKEYS.SESSION, {selector: accountIDSelector});
    const [currentUserEmail] = useOnyx(ONYXKEYS.SESSION, {selector: emailSelector});
    const [isDualRole] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector: (policies) => isDualRoleUser(policies, currentUserEmail)});
    const hasSeededRef = useRef(false);

    useEffect(() => {
        if (hasSeededRef.current || hasSeededMyExpensesSearch || currentUserAccountID === -1 || !currentUserEmail || isDualRole === undefined) {
            return;
        }

        if (isDualRole) {
            hasSeededRef.current = true;
            seedMyExpensesSearch(currentUserAccountID, translate('search.mySavedSearch'), savedSearches);
        }
    }, [hasSeededMyExpensesSearch, currentUserAccountID, currentUserEmail, isDualRole, translate, savedSearches]);
}

export default useSeedMyExpensesSearch;
