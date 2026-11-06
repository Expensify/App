import type {ExpensifyIconName} from '@components/Icon/ExpensifyIconLoader';

import type {SearchKey} from '@libs/SearchKeyUtils';
import type {SearchTypeMenuItem} from '@libs/SearchSuggestionUtils';
import type {getSavedSearchIconName} from '@libs/SearchUIUtils';

import type CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';

import type {ValueOf} from 'type-fest';

import type FLAT_NAV from './FLAT_NAV';

/** Identifier of a top-level flat nav section. Stable, unlike its translation path. */
type FlatNavSectionID = ValueOf<typeof FLAT_NAV.SECTION>;

/** A suggested (canned) search key. Saved search keys are not part of it. */
type FlatNavCannedSearchKey = ValueOf<typeof CONST.SEARCH.SEARCH_KEYS>;

type FlatNavSavedSearchIconName = ReturnType<typeof getSavedSearchIconName>;

/** Static description of a section: what it contains, in render order. */
type FlatNavSectionDefinition = {
    id: FlatNavSectionID;

    /** Label of the section row, the More entry and the narrow header */
    translationPath: TranslationPaths;

    /** Icon for surfaces rendered in JS (web bar, mWeb, More popover). Native tab glyphs are mapped separately. */
    iconName: ExpensifyIconName;

    /** Canned search keys in render order. Empty for the Saved section, whose items come from the user's saved searches. */
    searchKeys: readonly FlatNavCannedSearchKey[];
};

type FlatNavCannedSearchItem = {
    type: typeof FLAT_NAV.ITEM_TYPE.CANNED_SEARCH;
    key: FlatNavCannedSearchKey;
    sectionID: FlatNavSectionID;

    /** Label as it reads inside its section, e.g. `reports` reads "My reports" under Reports */
    translationPath: TranslationPaths;
    iconName: SearchTypeMenuItem['icon'];

    /** Default query. Navigation prefers the last valid query the user left this search with. */
    searchQuery: string;

    /** Undefined when the search has no todo badge or its count is 0 */
    badgeText?: string;
};

type FlatNavSavedSearchItem = {
    type: typeof FLAT_NAV.ITEM_TYPE.SAVED_SEARCH;

    /** `savedSearch_<savedSearchID>` */
    key: SearchKey;
    sectionID: typeof FLAT_NAV.SECTION.SAVED;
    savedSearchID: string;
    name: string;

    /** Human readable title. Differs from `name` only when the saved search was never renamed. */
    title: string;

    /** The saved query, not the last one the user left it with */
    query: string;
    iconName: FlatNavSavedSearchIconName;

    /** Pending delete */
    isDisabled: boolean;
};

type FlatNavItem = FlatNavCannedSearchItem | FlatNavSavedSearchItem;

/** A section the user can see, holding only the items they can see */
type FlatNavSection = {
    id: FlatNavSectionID;
    translationPath: TranslationPaths;
    iconName: ExpensifyIconName;
    items: FlatNavItem[];

    /** Todo count of the whole section, for when its items are hidden. Undefined when the section has no todo items or its count is 0. */
    badgeText?: string;
};

type ActiveFlatNavItem = {
    sectionID: FlatNavSectionID;

    /** Undefined when the search belongs to the section but has no visible row, e.g. a deleted saved search */
    itemKey: SearchKey | undefined;
};

export type {
    ActiveFlatNavItem,
    FlatNavCannedSearchItem,
    FlatNavCannedSearchKey,
    FlatNavItem,
    FlatNavSavedSearchIconName,
    FlatNavSavedSearchItem,
    FlatNavSection,
    FlatNavSectionDefinition,
    FlatNavSectionID,
};
