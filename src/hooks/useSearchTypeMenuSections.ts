import {useMemo} from 'react';
import {mergeCardListWithWorkspaceFeeds} from '@libs/CardUtils';
import {createTypeMenuSections, getSuggestedSearches} from '@libs/SearchUIUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import useOnyx from './useOnyx';

/**
 * Get a list of all search groupings, along with their search items. Also returns the
 * currently focused search, based on the hash
 */
const useSearchTypeMenuSections = (hash = 0) => {
    const [session] = useOnyx(ONYXKEYS.SESSION, {canBeMissing: false});
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {canBeMissing: true});
    const [userCardList] = useOnyx(ONYXKEYS.CARD_LIST, {canBeMissing: true});
    const [workspaceCardFeeds] = useOnyx(ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST, {canBeMissing: true});

    const suggestedSearches = useMemo(() => {
        return getSuggestedSearches(session) ?? {};
    }, [session]);

    const hasCardFeed = useMemo(() => {
        return Object.keys(mergeCardListWithWorkspaceFeeds(workspaceCardFeeds ?? CONST.EMPTY_OBJECT, userCardList)).length > 0;
    }, [userCardList, workspaceCardFeeds]);

    const typeMenuSections = useMemo(() => createTypeMenuSections(session, hasCardFeed, allPolicies), [allPolicies, hasCardFeed, session]);

    const currentSearch = useMemo(() => {
        return Object.values(suggestedSearches).find((search) => search.hash === hash);
    }, [hash, suggestedSearches]);

    return {typeMenuSections, currentSearch};
};

export default useSearchTypeMenuSections;
