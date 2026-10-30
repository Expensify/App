type RecordBlockedNavigation = () => void;

/** Returns a function that removes the listener. */
type AddBlockedBrowserBackListener = (listener: () => void) => () => void;

export type {AddBlockedBrowserBackListener, RecordBlockedNavigation};
