import type {FlatNavSectionID} from '@libs/Navigation/FlatNav/types';

/** Where the user is, read the same way by the flat nav tab bar slot and by its More menu so the two always agree. */
type FlatNavTabBarFocus = {
    /** A route name of `TAB_SCREENS`, which the web and native tab navigators share. Undefined before the tab navigator has a focused route. */
    focusedTabRouteName: string | undefined;

    /**
     * `useActiveFlatNavItem(sections, isSearchFocused)?.sectionID`, so it is undefined when the search is in no visible
     * section. Only read while the Search navigator is the focused route, because a caller can pass a section left over
     * from an earlier visit to Search.
     */
    activeFlatNavSectionID: FlatNavSectionID | undefined;
};

export default FlatNavTabBarFocus;
