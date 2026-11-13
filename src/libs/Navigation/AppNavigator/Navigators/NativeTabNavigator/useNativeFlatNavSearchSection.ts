/**
 * The flat nav section of the search the Search tab shows, which decides the placeholder Search is drawn inside. It is
 * read from the search key in the same render that changes the search, rather than from the sections the user can see,
 * so the tab navigator does not build the sections on every render. The Saved section is checked against the saved
 * searches the way the Spend menu checks it. Accounting is taken from the key alone: whether the user sees it depends on
 * the export, card and approval settings of every workspace (getSuggestedSearchesVisibility), which is too much to read
 * here. So an Accounting search of a user who cannot see Accounting, such as a shared link, highlights More while the More
 * menu has no active row. Only the flat nav tab navigator calls it, so without the beta none of this is read.
 */
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';

import FLAT_NAV from '@libs/Navigation/FlatNav/FLAT_NAV';
import {getFlatNavSectionIDForSearchKey} from '@libs/Navigation/FlatNav/FlatNavUtils';
import type {FlatNavSectionID} from '@libs/Navigation/FlatNav/types';
import type {SearchKey} from '@libs/SearchKeyUtils';

import ONYXKEYS from '@src/ONYXKEYS';

import {storedSearchTabSearchKeySelector} from '@selectors/ReportNavigation';
import {savedSearchesPresenceSelector} from '@selectors/SavedSearches';
import {useState} from 'react';

type NativeFlatNavSearchSectionParams = {
    /** The `searchKey` param of the search the Search tab route shows, undefined before its navigator mounts */
    searchKey: SearchKey | undefined;

    isSearchFocused: boolean;
};

function useNativeFlatNavSearchSection({searchKey, isSearchFocused}: NativeFlatNavSearchSectionParams): FlatNavSectionID | undefined {
    const [storedSearchKey] = useOnyx(ONYXKEYS.REPORT_NAVIGATION_LAST_SEARCH_QUERY, {selector: storedSearchTabSearchKeySelector});
    const [savedSearchesPresence] = useOnyx(ONYXKEYS.SAVED_SEARCHES, {selector: savedSearchesPresenceSelector});
    const {isOffline} = useNetwork();
    const [hasSearchBeenShown, setHasSearchBeenShown] = useState(isSearchFocused);
    if (isSearchFocused && !hasSearchBeenShown) {
        setHasSearchBeenShown(true);
    }

    // Search opens the stored search on its first visit, see TabPressListeners, so until then it starts in the
    // placeholder of that search instead of moving there when it mounts.
    const sectionID = getFlatNavSectionIDForSearchKey(hasSearchBeenShown ? searchKey : storedSearchKey);
    const isSavedSectionVisible = !!savedSearchesPresence?.hasSavedSearchesNotPendingDelete || (isOffline && !!savedSearchesPresence?.hasSavedSearches);
    if (sectionID === FLAT_NAV.SECTION.SAVED && !isSavedSectionVisible) {
        return undefined;
    }
    return sectionID;
}

export default useNativeFlatNavSearchSection;
