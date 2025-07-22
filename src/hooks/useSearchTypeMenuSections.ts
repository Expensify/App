import {useMemo} from 'react';
import {createTypeMenuSections} from '@libs/SearchUIUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import useCardFeedsForDisplay from './useCardFeedsForDisplay';
import useLocalize from './useLocalize';
import useOnyx from './useOnyx';

/**
 * Get a list of all search groupings, along with their search items. Also returns the
 * currently focused search, based on the hash
 */
const useSearchTypeMenuSections = () => {
    const {defaultCardFeed, cardFeedsByPolicy} = useCardFeedsForDisplay();

    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {canBeMissing: true});
    const {formatPhoneNumber} = useLocalize();
    const [currentUserLoginAndAccountID] = useOnyx(ONYXKEYS.SESSION, {selector: (session) => ({email: session?.email, accountID: session?.accountID}), canBeMissing: false});

    const typeMenuSections = useMemo(
        () => createTypeMenuSections(currentUserLoginAndAccountID?.email, currentUserLoginAndAccountID?.accountID, cardFeedsByPolicy, defaultCardFeed, formatPhoneNumber, allPolicies),
        [currentUserLoginAndAccountID?.email, currentUserLoginAndAccountID?.accountID, cardFeedsByPolicy, defaultCardFeed, allPolicies, formatPhoneNumber],
    );

    return {typeMenuSections};
};

export default useSearchTypeMenuSections;
