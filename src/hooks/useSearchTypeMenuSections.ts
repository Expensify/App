import {useMemo} from 'react';
import {useOnyx} from 'react-native-onyx';
import {buildSearchQueryJSON} from '@libs/SearchQueryUtils';
import {createTypeMenuSections} from '@libs/SearchUIUtils';
import ONYXKEYS from '@src/ONYXKEYS';

/**
 * Get a list of all search groupings, along with their search items. Also returns the
 * currently focused search, based on the hash
 */
const useSearchTypeMenuSections = (hash = 0) => {
    const [session] = useOnyx(ONYXKEYS.SESSION, {canBeMissing: false});
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {canBeMissing: true});

    const typeMenuSections = useMemo(() => createTypeMenuSections(session, allPolicies), [allPolicies, session]);

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
