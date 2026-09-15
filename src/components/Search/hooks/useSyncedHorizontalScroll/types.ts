import type {Ref} from 'react';
// eslint-disable-next-line no-restricted-imports
import type {ScrollView as RNScrollView, ScrollViewProps, View as RNView} from 'react-native';

type SyncedHorizontalScroll = {
    /** Ref for the horizontal ScrollView that drives the sync. */
    scrollViewRef: Ref<RNScrollView>;

    /**
     * Props to spread onto that ScrollView. Empty whenever syncing is off, so a layout that doesn't sync (native, or
     * anything narrower than the large-screen breakpoint) renders the ScrollView with exactly the props it had before.
     */
    syncProps: Pick<ScrollViewProps, 'onScroll' | 'scrollEventThrottle'>;
};

/**
 * Publishes a group's horizontal table offset, for the scroller the user drags.
 *
 * A group's sticky column sub-header and its rows are separate FlashList rows with separate scroll containers, so
 * `useHorizontalScrollFollower` keeps the sub-header's offset in sync with this one. The sync is one-way: a sub-header
 * that could also publish would yank the rows back to 0 whenever FlashList mounts a second copy of it for sticking.
 *
 * Pass `undefined` as the key to opt out (a layout that doesn't split a group needs no syncing).
 */
type UseSyncedHorizontalScroll = (key: string | undefined, isEnabled: boolean) => SyncedHorizontalScroll;

/**
 * Follows the offset published for `key`, without being scrollable by the user.
 *
 * Returns a callback ref for a clipped (`overflow: hidden`) View wrapping content wider than itself. Moving it via
 * `scrollLeft` keeps it in step with the rows without a visible scrollbar and without ever publishing an offset of
 * its own. Same key and `isEnabled` contract as `useSyncedHorizontalScroll`.
 */
type UseHorizontalScrollFollower = (key: string | undefined, isEnabled: boolean) => Ref<RNView>;

export type {SyncedHorizontalScroll, UseHorizontalScrollFollower, UseSyncedHorizontalScroll};
