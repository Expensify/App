import {useMemo} from 'react';
import {mergeCardListWithWorkspaceFeeds} from '@libs/CardUtils';
import {createTypeMenuSections} from '@libs/SearchUIUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import useOnyx from './useOnyx';

/**
 * Get a list of all search groupings, along with their search items. Also returns the
 * currently focused search, based on the hash
 */
const useSearchTypeMenuSections = () => {
    const [session] = useOnyx(ONYXKEYS.SESSION, {canBeMissing: false});
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {canBeMissing: true});
    const [userCardList] = useOnyx(ONYXKEYS.CARD_LIST, {canBeMissing: true});
    const [workspaceCardFeeds] = useOnyx(ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST, {canBeMissing: true});

    const hasCardFeed = useMemo(() => {
        return Object.keys(mergeCardListWithWorkspaceFeeds(workspaceCardFeeds ?? CONST.EMPTY_OBJECT, userCardList)).length > 0;
    }, [userCardList, workspaceCardFeeds]);

    const typeMenuSections = useMemo(() => createTypeMenuSections(session, hasCardFeed, allPolicies), [allPolicies, hasCardFeed, session]);

    return {typeMenuSections};
};

export default useSearchTypeMenuSections;
