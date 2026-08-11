import type {TransactionPreviewData} from '@libs/actions/Search';
import type {ModifiedMouseEvent} from '@libs/Navigation/helpers/openInternalRouteInNewTab';

import type {CardList, Transaction} from '@src/types/onyx';

import type React from 'react';
import type {ForwardedRef} from 'react';
import type {NativeScrollEvent, NativeSyntheticEvent, StyleProp, ViewStyle} from 'react-native';

import type {SearchListItem} from './SearchList/ListItem/types';
import type {SearchColumnType, SearchQueryJSON} from './types';

/** Imperative handle the router uses for highlight-driven scrolling. */
type SearchListHandle = {
    scrollToIndex: (index: number, animated?: boolean) => void;
};

/**
 * Props shared by every dedicated Search view. The router (`<Search>`) builds these once and spreads
 * them into whichever view renders; each view narrows to its own extras on top of this shape.
 */
type CommonSearchViewProps = {
    /** The search query for the current view. */
    queryJSON: SearchQueryJSON;

    /** The sorted rows to render (from the router's useSearchSnapshot). */
    data: SearchListItem[];

    /** The columns to render in the list (drives the table min-width and header). */
    columns: SearchColumnType[];

    /** Whether the list supports multi-select. */
    canSelectMultiple: boolean;

    /** Whether the action column uses its wider variant. */
    isActionColumnWide: boolean;

    /** Whether mobile selection mode is on. */
    isMobileSelectionModeEnabled: boolean;

    /** The column header element (undefined on narrow layouts). */
    SearchTableHeader?: React.JSX.Element;

    /** Whether a table header bar is shown above the list. */
    tableHeaderVisible: boolean;

    /** Whether everything has been loaded (gates the fully-checked select-all state). */
    hasLoadedAllTransactions?: boolean;

    /** Rows flagged for the post-create highlight animation (feeds BaseSearchList extraData). */
    newTransactions: Transaction[];

    /** The navigation handler for a row tap (owned by the router). */
    onSelectRow: (item: SearchListItem, transactionPreviewData?: TransactionPreviewData, event?: ModifiedMouseEvent) => void;

    /** The list footer (pagination / pending skeleton). */
    ListFooterComponent?: React.JSX.Element;

    /** Fires when the list scrolls near its end (router's fetchMoreResults). */
    onEndReached: () => void;

    /** Fires on the list's first layout and on layout changes. */
    onLayout: () => void;

    /** Scroll handler forwarded to the list. */
    onScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;

    /** Content container style for the list. */
    contentContainerStyle: StyleProp<ViewStyle>;

    /** Outer container style for the list wrapper. */
    containerStyle: StyleProp<ViewStyle>;

    /** Imperative handle for highlight-driven scrolling, set by the router. */
    ref?: ForwardedRef<SearchListHandle>;
};

/** Extra props specific to the transaction views (expense/invoice/trip): attendee tracking and card rendering. */
type TransactionViewExtras = {
    /** Precomputed attendee-tracking boolean (derived from policy-for-moving-expenses). */
    isAttendeesEnabledForMovingPolicy?: boolean;

    /** Non-personal and workspace cards for row rendering (subscribed once by the router). */
    nonPersonalAndWorkspaceCards?: CardList;
};

export type {CommonSearchViewProps, TransactionViewExtras};
