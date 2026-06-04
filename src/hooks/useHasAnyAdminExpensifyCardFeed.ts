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
    const [cardList] = useOnyx(ONYXKEYS.CARD_LIST);

    return getAdminExpensifyCardFeedEntries(cardSettingsCollection, policies, domains, currentUserAccountID, cardList).length > 0;
}

export default useHasAnyAdminExpensifyCardFeed;
