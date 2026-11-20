import type {FlatNavSectionID} from '@libs/Navigation/FlatNav/types';

/** Where the user is. Given the same value, the slot highlights More exactly when one More menu entry is active. */
type FlatNavTabBarFocus = {
    /** A route name of `TAB_SCREENS`. Undefined before the tab navigator has a focused route. */
    focusedTabRouteName: string | undefined;

    /**
     * The flat nav section of the search the Search navigator shows, undefined when that search is in no section. Only
     * read while the Search navigator is focused, so a section left over from an earlier visit is ignored. The More menu
     * marks only a section it lists, so a section the user cannot see, such as Accounting opened from a shared link,
     * highlights More with no active entry.
     */
    activeFlatNavSectionID: FlatNavSectionID | undefined;
};

export default FlatNavTabBarFocus;
