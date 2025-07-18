import {useMemo} from 'react';
import {buildSearchQueryJSON} from '@libs/SearchQueryUtils';
import {createTypeMenuSections} from '@libs/SearchUIUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import useOnyx from './useOnyx';

/**
 * Get a list of all search groupings, along with their search items. Also returns the
 * currently focused search, based on the hash
 */
const useSearchTypeMenuSections = (hash = 0) => {
    const [currentUserLoginAndAccountID] = useOnyx(ONYXKEYS.SESSION, {selector: (session) => ({email: session?.email, accountID: session?.accountID}), canBeMissing: false});
    const [allFeeds] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER, {canBeMissing: true});
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {canBeMissing: true});

    const typeMenuSections = useMemo(
        () => createTypeMenuSections(currentUserLoginAndAccountID?.email, currentUserLoginAndAccountID?.accountID, allFeeds, allPolicies),
        [currentUserLoginAndAccountID?.email, currentUserLoginAndAccountID?.accountID, allPolicies, allFeeds],
    );

    const currentSearch = useMemo(() => {
        const flatMenuItems = typeMenuSections.map((section) => section.menuItems).flat();
        return flatMenuItems.find((menuItem) => {
            const menuHash = buildSearchQueryJSON(menuItem.getSearchQuery())?.hash;
            return menuHash === hash;
        });
    }, [hash, typeMenuSections]);

    return {typeMenuSections, currentSearch};
};

export default useSearchTypeMenuSections;
