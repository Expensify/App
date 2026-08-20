import type {RefObject} from 'react';
// eslint-disable-next-line no-restricted-imports
import type {NativeScrollEvent, NativeSyntheticEvent, ScrollView as RNScrollView} from 'react-native';

type SyncedHorizontalScroll = {
    /** Ref to attach to the horizontal ScrollView being kept in sync. */
    scrollViewRef: RefObject<RNScrollView | null>;

    /** Handler to pass to the ScrollView's `onScroll`. Undefined on web, where the sync runs off the DOM scroll event. */
    onScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;

    /** Offset to seed `contentOffset` with, so a freshly mounted scroller doesn't paint at the left edge first. */
    initialOffset: number;
};

/**
 * Keeps several horizontal table scroll containers that share a `key` on the same offset.
 *
 * A group's sticky column sub-header and its transaction rows are separate FlashList rows, so they cannot share one
 * scroll container. Syncing their offsets is what keeps the column labels lined up with the values below them once
 * the table is wider than the viewport.
 *
 * Pass `undefined` as the key to opt out (layouts that don't split a group render both halves in one scroller).
 */
type UseSyncedHorizontalScroll = (key: string | undefined, isEnabled: boolean) => SyncedHorizontalScroll;

export type {SyncedHorizontalScroll, UseSyncedHorizontalScroll};
