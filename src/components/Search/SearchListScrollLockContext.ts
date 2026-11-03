import type {ComponentRef} from 'react';
// Importing the ScrollView type directly from react-native is required to type getScrollableNode's return, the shared wrapper does not expose it.
// eslint-disable-next-line no-restricted-imports
import type {ScrollView as RNScrollView, ViewStyle} from 'react-native';

import {createContext, useContext, useEffect} from 'react';

/** Lets the page drive the results list's scroll position directly, frame by frame. */
type SearchListScroller = {
    getOffset: () => number;
    scrollTo: (offset: number) => void;
};

/** Hands the page the results list's scroller. Returns the unregister function. */
type RegisterSearchListScroller = (scroller: SearchListScroller) => () => void;

/**
 * Whether the narrow Search page's inner scrollers (the results list, the empty state, the chart) must not scroll on
 * their own. On mobile web in landscape the header and the list area share one outer scroller: while any of the header
 * is on screen this is true, so a drag on the rows moves that outer scroller and the header leaves first. Undefined
 * everywhere else, where there is no outer scroller.
 */
const SearchListScrollLockContext = createContext<boolean | undefined>(undefined);

/**
 * Lets the results list register its scroller with the page, so a fling that hides the header can carry on into the
 * rows instead of stopping at the boundary.
 */
const SearchListScrollRegistrationContext = createContext<RegisterSearchListScroller>(() => () => {});

/**
 * `overflowY: hidden` rather than `scrollEnabled={false}`: react-native-web's scrollEnabled also sets
 * `touch-action: none`, which stops the browser from handing the drag to the outer scroller.
 */
const lockedScrollStyle: ViewStyle = {overflowY: 'hidden'};

/**
 * Under the scroll-away header the results list must not bounce: a fling that reaches its top brings the header back
 * in, and an overshoot past the top would open a gap between the header and the first row, wider the faster the fling.
 */
const noBounceStyle: ViewStyle = {overscrollBehavior: 'none'};

/**
 * The style that locks an inner scroller while the outer one has to move first, see SearchListScrollLockContext.
 * `shouldPreventBounce` is for the results list only, whose arrival at its top the page handles itself. It applies only
 * while unlocked: `overscroll-behavior` also stops the browser handing a drag on to the outer scroller, which Chrome
 * applies even to an `overflow: hidden` scroller, so a locked list with it would swallow the drag. A locked list can't
 * bounce anyway.
 */
function useSearchListScrollLockStyle(shouldPreventBounce = false): ViewStyle | undefined {
    const isLocked = useContext(SearchListScrollLockContext);
    if (isLocked === undefined) {
        return undefined;
    }
    if (isLocked) {
        return lockedScrollStyle;
    }
    return shouldPreventBounce ? noBounceStyle : undefined;
}

/** Registers the results list's scroller with the page for as long as the list is mounted. */
function useRegisterSearchListScroller(scroller: SearchListScroller) {
    const registerListScroller = useContext(SearchListScrollRegistrationContext);

    useEffect(() => registerListScroller(scroller), [registerListScroller, scroller]);
}

/** React Native types `getScrollableNode` as `any`. On web it resolves to the element that actually scrolls. */
function getScrollTop(scrollView: ComponentRef<typeof RNScrollView>): number {
    const node: unknown = scrollView.getScrollableNode();
    return !!node && typeof node === 'object' && 'scrollTop' in node && typeof node.scrollTop === 'number' ? node.scrollTop : 0;
}

/**
 * Registers a ScrollView rendered in place of the results list (the chart, the empty state) the same way, so a fling
 * or drag that hides the header carries on into it too. Returns a callback ref for that ScrollView: registering on
 * attach rather than in an effect ties it to the ScrollView actually being mounted, as `Search` calls this before it
 * knows whether it will render the chart, and its effects would run after (and override) a results list's.
 */
function useRegisterSearchScrollView() {
    const registerListScroller = useContext(SearchListScrollRegistrationContext);

    return (scrollView: ComponentRef<typeof RNScrollView> | null) =>
        scrollView
            ? registerListScroller({
                  getOffset: () => getScrollTop(scrollView),
                  scrollTo: (offset) => scrollView.scrollTo({y: offset, animated: false}),
              })
            : undefined;
}

export default SearchListScrollLockContext;
export {SearchListScrollRegistrationContext, useRegisterSearchListScroller, useRegisterSearchScrollView, useSearchListScrollLockStyle};
export type {SearchListScroller};
