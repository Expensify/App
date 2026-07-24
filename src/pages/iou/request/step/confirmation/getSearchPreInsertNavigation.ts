import type {ValueOf} from 'type-fest';

const SEARCH_PRE_INSERT_NAVIGATION = {
    /** Reveal the Search route before dismissing the modal (used when a report may be pre-inserted underneath). */
    REVEAL_SEARCH: 'revealSearch',
    /** Plain modal dismiss - the Search route is already staged. */
    DISMISS_MODAL: 'dismissModal',
} as const;

type SearchPreInsertNavigation = ValueOf<typeof SEARCH_PRE_INSERT_NAVIGATION>;

/**
 * Pure decision for the SEARCH_PRE_INSERT handler: native-shortcut flows may have a destination report
 * pre-inserted beneath the modal, so they must reveal the Search route before dismissing rather than
 * doing a plain dismiss. Every other pre-insert flow already has Search staged and just dismisses.
 */
function getSearchPreInsertNavigation(isFromNativeShortcut: boolean): SearchPreInsertNavigation {
    return isFromNativeShortcut ? SEARCH_PRE_INSERT_NAVIGATION.REVEAL_SEARCH : SEARCH_PRE_INSERT_NAVIGATION.DISMISS_MODAL;
}

export {SEARCH_PRE_INSERT_NAVIGATION, getSearchPreInsertNavigation};
