import type {Ref} from 'react';
// eslint-disable-next-line no-restricted-imports
import type {ScrollView as RNScrollView, ScrollViewProps, View as RNView} from 'react-native';

type SyncedHorizontalScroll = {
    /**
     * Ref to attach to the horizontal ScrollView that drives the sync. A callback ref, not an object one, because it
     * has to bind to the ScrollView's real mount/unmount: a group renders collapsed first, so the scroller enters the
     * tree long after the hook does, and an effect keyed on render values would not re-run to pick it up.
     */
    scrollViewRef: Ref<RNScrollView>;

    /**
     * Props to spread onto that ScrollView. Empty whenever syncing is off, so a layout that doesn't sync (native, or
     * anything narrower than the large-screen breakpoint) renders the ScrollView with exactly the props it had before.
     */
    syncProps: Pick<ScrollViewProps, 'onScroll' | 'scrollEventThrottle'>;
};

/**
 * Publishes a group's horizontal table offset, for the one scroller the user actually drags.
 *
 * A group's sticky column sub-header and its transaction rows are separate FlashList rows, so they cannot share one
 * scroll container. The rows are the scroller; the sub-header follows it through `useHorizontalScrollFollower`, which
 * is what keeps the column labels lined up with the values below them once the table is wider than the viewport.
 *
 * The sync is deliberately one-way. Making the sub-header a scroller too meant it published as well, and a sub-header
 * publishes wrongly at exactly the wrong moment: when a header sticks, FlashList mounts a *second* copy of it, and
 * that copy starts at offset 0 and reports 0 back to the group, yanking the rows to the start of the table.
 *
 * Pass `undefined` as the key to opt out. Layouts that don't split a group render both halves in one scroller and
 * need no syncing. `isEnabled` additionally gates it on the table actually overflowing, and must stay reactive: the
 * ScrollView only exists while it is true, so the hook has nothing to attach to before then.
 */
type UseSyncedHorizontalScroll = (key: string | undefined, isEnabled: boolean) => SyncedHorizontalScroll;

/**
 * Follows the offset published for `key`, without being something the user can scroll.
 *
 * Returns a callback ref for a clipped (`overflow: hidden`) View wrapping content wider than itself. That clip still
 * accepts a `scrollLeft`, so the hook can move it in step with the rows, but it renders no scrollbar and cannot be
 * dragged. Most importantly it never publishes. It only ever receives an offset, so it cannot argue with the scroller
 * it is following.
 *
 * Same key and `isEnabled` contract as `useSyncedHorizontalScroll`.
 */
type UseHorizontalScrollFollower = (key: string | undefined, isEnabled: boolean) => Ref<RNView>;

export type {SyncedHorizontalScroll, UseHorizontalScrollFollower, UseSyncedHorizontalScroll};
