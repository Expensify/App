import type {Ref} from 'react';
// eslint-disable-next-line no-restricted-imports
import type {ScrollView as RNScrollView, ScrollViewProps} from 'react-native';

type SyncedHorizontalScroll = {
    /**
     * Ref to attach to the horizontal ScrollView being kept in sync. A callback ref, not an object one, because it
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
 * Keeps every horizontal table scroller that shares a `key` on the same offset.
 *
 * A group's sticky column sub-header and its transaction rows are separate FlashList rows, so they cannot share one
 * scroll container. Syncing their offsets is what keeps the column labels lined up with the values below them once
 * the table is wider than the viewport.
 *
 * Pass `undefined` as the key to opt out — layouts that don't split a group render both halves in one scroller and
 * need no syncing. `isEnabled` additionally gates it on the table actually overflowing, and must stay reactive: the
 * ScrollView only exists while it is true, so the hook has nothing to attach to before then.
 */
type UseSyncedHorizontalScroll = (key: string | undefined, isEnabled: boolean) => SyncedHorizontalScroll;

export type {SyncedHorizontalScroll, UseSyncedHorizontalScroll};
