import type {SyncedHorizontalScroll, UseHorizontalScrollFollower, UseSyncedHorizontalScroll} from './types';

/** Stable identity, so spreading it never gives the ScrollView a new props object to diff. */
const NO_SYNC_PROPS: SyncedHorizontalScroll['syncProps'] = {};

const NO_REF = () => {};

/**
 * Native never splits a group's header out of its rows, so this hook is never given a key here.
 * See ./index.ts for the web version that actually syncs.
 */
const useSyncedHorizontalScroll: UseSyncedHorizontalScroll = () => ({scrollViewRef: NO_REF, syncProps: NO_SYNC_PROPS});

/** Nothing to follow, for the same reason. */
const useHorizontalScrollFollower: UseHorizontalScrollFollower = () => NO_REF;

export {useHorizontalScrollFollower, useSyncedHorizontalScroll};
