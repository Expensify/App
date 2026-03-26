import {getAdminExpensifyCardFeedEntries} from '@libs/ExpensifyCardFeedSelectorUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import useOnyx from './useOnyx';

/** True when the user is an admin of at least one workspace with loaded Expensify Card program settings. */
function useHasAnyAdminExpensifyCardFeed(): boolean {
    const [cardSettingsCollection] = useOnyx(ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS);
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);

    return getAdminExpensifyCardFeedEntries(cardSettingsCollection, policies).length > 0;
}

export default useHasAnyAdminExpensifyCardFeed;
