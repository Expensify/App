import {getAdminExpensifyCardFeedEntries} from '@libs/ExpensifyCardFeedSelectorUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useOnyx from './useOnyx';

/** True when the user is an admin of at least one workspace with loaded Expensify Card program settings. */
function useHasAnyAdminExpensifyCardFeed(): boolean {
    const {accountID: currentUserAccountID} = useCurrentUserPersonalDetails();
    const [cardSettingsCollection] = useOnyx(ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS);
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [domains] = useOnyx(ONYXKEYS.COLLECTION.DOMAIN);

    return getAdminExpensifyCardFeedEntries(cardSettingsCollection, policies, domains, currentUserAccountID).length > 0;
}

export default useHasAnyAdminExpensifyCardFeed;
