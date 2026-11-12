import {useSearchQueryContext} from '@components/Search/SearchContext';

import type {ActiveFlatNavItem, FlatNavSection} from './types';

import {getActiveFlatNavItem} from './FlatNavUtils';

/**
 * The section and item of the current search. The search key outlives the Search page, so the caller says whether the
 * Search page is the one on screen: that is `selectedTab` on web and the focused route on native.
 */
function useActiveFlatNavItem(sections: FlatNavSection[], isSearchFocused: boolean): ActiveFlatNavItem | undefined {
    const {currentSearchKey} = useSearchQueryContext();

    if (!isSearchFocused) {
        return undefined;
    }
    return getActiveFlatNavItem(sections, currentSearchKey);
}

export default useActiveFlatNavItem;
