import type {ExpensifyIconName} from '@components/Icon/ExpensifyIconLoader';

import type {SearchKey} from '@libs/SearchKeyUtils';
import type {SearchTypeMenuItem} from '@libs/SearchSuggestionUtils';
import type {getSavedSearchIconName} from '@libs/SearchUIUtils';

import type CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import type {PendingAction} from '@src/types/onyx/OnyxCommon';

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

    /** Offline change not yet synced (add, rename or delete), so the row can be greyed out like in the Spend column */
    pendingAction?: PendingAction | null;

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

type FlatNavSubnavGroupID = ValueOf<typeof FLAT_NAV.SUBNAV_GROUP>;

/** Static description of a subnav header: which sections list their items under it, and how their rows are labelled there. */
type FlatNavSubnavGroupDefinition = {
    id: FlatNavSubnavGroupID;

    /** Translation key of the header label */
    translationPath: TranslationPaths;

    /** Sections whose items are listed under the header, in render order */
    sectionIDs: readonly FlatNavSectionID[];

    /** Labels a canned search as it reads under this header, where the section's own wording would not fit */
    itemTranslationPaths?: Partial<Record<SearchKey, TranslationPaths>>;
};

/** A header with the searches under it, as the subnav draws them */
type FlatNavSubnavGroup = {
    id: FlatNavSubnavGroupID;
    translationPath: TranslationPaths;
    items: FlatNavItem[];
};

/** Heights of the subnav's rows, which are fixed so the marker's position can be worked out without measuring */
type FlatNavSubnavRowHeights = {
    header: number;
    item: number;
    marker: number;
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
    FlatNavSubnavGroup,
    FlatNavSubnavGroupDefinition,
    FlatNavSubnavRowHeights,
};
