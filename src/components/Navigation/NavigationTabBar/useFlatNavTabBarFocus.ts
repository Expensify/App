import {useSearchQueryContext} from '@components/Search/SearchContext';

import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';

import FLAT_NAV from '@libs/Navigation/FlatNav/FLAT_NAV';
import {getFlatNavSectionIDForSearchKey} from '@libs/Navigation/FlatNav/FlatNavUtils';
import type FlatNavTabBarFocus from '@libs/Navigation/FlatNavTabBar/FlatNavTabBarFocus';

import ONYXKEYS from '@src/ONYXKEYS';

import type {ValueOf} from 'type-fest';

import {savedSearchesPresenceSelector, shouldShowSavedSearchesSection} from '@selectors/SavedSearches';

import NAVIGATION_TABS from './NAVIGATION_TABS';
import ROUTE_TO_NAVIGATION_TAB from './ROUTE_TO_NAVIGATION_TAB';

/**
 * Where the user is, for the flat nav bar of narrow web: the route of the selected tab, and on Search the section of
 * the search the Search page shows. Saved counts only while its section is visible, as on the native bar.
 */
function useFlatNavTabBarFocus(selectedTab: ValueOf<typeof NAVIGATION_TABS>): FlatNavTabBarFocus {
    const {currentSearchKey} = useSearchQueryContext();
    const [savedSearchesPresence] = useOnyx(ONYXKEYS.SAVED_SEARCHES, {selector: savedSearchesPresenceSelector});
    const {isOffline} = useNetwork();

    const focusedTabRouteName = Object.keys(ROUTE_TO_NAVIGATION_TAB).find((routeName) => ROUTE_TO_NAVIGATION_TAB[routeName] === selectedTab);
    const sectionID = selectedTab === NAVIGATION_TABS.SEARCH ? getFlatNavSectionIDForSearchKey(currentSearchKey) : undefined;
    const isSectionHidden = sectionID === FLAT_NAV.SECTION.SAVED && !shouldShowSavedSearchesSection(savedSearchesPresence, isOffline);

    return {focusedTabRouteName, activeFlatNavSectionID: isSectionHidden ? undefined : sectionID};
}

export default useFlatNavTabBarFocus;
