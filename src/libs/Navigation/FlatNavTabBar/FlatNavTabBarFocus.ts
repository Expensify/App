import type {FlatNavSectionID} from '@libs/Navigation/FlatNav/types';

/** Where the user is. The slot and the More menu must be given the same value, or they can disagree. */
type FlatNavTabBarFocus = {
    /** A route name of `TAB_SCREENS`. Undefined before the tab navigator has a focused route. */
    focusedTabRouteName: string | undefined;

    /**
     * The visible flat nav section of the search the Search navigator shows, undefined when that search is in no visible
     * section. Only read while the Search navigator is focused, so a section left over from an earlier visit is ignored.
     */
    activeFlatNavSectionID: FlatNavSectionID | undefined;
};

export default FlatNavTabBarFocus;
